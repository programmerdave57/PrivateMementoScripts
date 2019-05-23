// TemplateFormatter.js

const
  TEMPLATE_CONDITION_UNCONDITIONAL = 0,
  TEMPLATE_CONDITION_BLANK = 1,
  TEMPLATE_CONDITION_NOT_BLANK = 101,
  TEMPLATE_CONDITION_NULL = 2,
  TEMPLATE_CONDITION_NOT_NULL = 102,
  TEMPLATE_CONDITION_TRUTHY = 3,
  TEMPLATE_CONDITION_FALSY = 4;

var TfTemplates;
var TfSequencer;

function templateInit( templates )
{
  TfTemplates = templates;
  TfSequencer = {};
}

function templateAddSectionToSequencer( date, text )
{
  var time, collisioncounter = 0, keybase, key;

  time = Math.floor(date.getTime()/1000); // seconds...
  keybase = "T" + ("0000000000000000" + time).substr( -16 ) + ".";
  
  for ( collisioncounter=0; collisioncounter<100; collisioncounter++ )
  {
    key = keybase + ("000" + collisioncounter).substr( -3 );
    if ( ! (key in TfSequencer) )
      break;
  }

  TfSequencer[key] = text;
}

function getAllHTML()
{
  var keys, count, i;
  var html = "";

  keys = Object.keys( TfSequencer );
  keys.sort();

  count = keys.length;
  for ( i=0; i<count; i++ )
  {
    //html += "<div>" + keys[i] + "</div>";
    html += TfSequencer[keys[i]];
  }

  return html;
}

function paragraphizeText( text )
{
  var html = "";
  var lines, line, count, i;
  var trimtext;

  trimtext = text.replace( /\n+$/, "" );
  lines = trimtext.split( /\n/ );
  count = lines.length;
  for ( i=0; i<count; i++ )
  {
    line = lines[i];
    if ( i == (count-1) )
      html += "<P class=last>";
    else
      html += "<P>";
    html += line + "</P>";
  }

  return html;
}

function applyDaveMarkup( text )
{
  var ret;
  var markers = [
    { s:"<<<", e:">>>", c:"highlight3"},
    { s:"<<", e:">>", c:"highlight2"},
    { s:"[", e:"]", c:"highlight1"},
  ];
  var mstart, mend, clas;
  var pos, endpos;
  var left, inside, right;
  var mcount, m;
  
  ret = text;
  mcount = markers.length;
  for ( m=0; m<mcount; m++ )
  {
    mstart = markers[m].s;
    mend = markers[m].e;
    clas = markers[m].c;
    while ( -1 != (pos=ret.indexOf(mstart)) )
    {
      endpos = ret.indexOf(mend);
      if ( endpos < pos )
        break;
      left = ret.substr(0, pos);
      pos += mstart.length;
      middle = ret.substr(pos, endpos-pos);
      right = ret.substr(endpos+mend.length);
      ret = left +
            "<span class=" + clas + ">" +
            middle +
            "</span>" +
            right;
    } // end for each found marker
  } // end for each marker type
  
  return ret;
}

// ---------------------------------
// TEMPLATE STUFF...
// (keep this in one place so we can
// move it to its own source file...)
// ---------------------------------

function templateFindPlaceholder( str )
{
  var ret = {type:"", name:"",
              pos:-1, endpos:-1,
              extra: "",
              error:false,
              errormsg:""};
  var pos, endpos, placeholder, type, name, extra;
  var values;

	switch(1)
	{ default:

		pos = str.indexOf( "{?" );
		if ( pos != -1 )
		{
			endpos = str.indexOf( "}" );
			if ( endpos == -1 )
			{
				ret.error = true;
				ret.errormsg = "no ending curly brace";
				break;
			}
		}

		ret.pos = pos;
		ret.endpos = endpos;

		// get the placeholder not including the "{?" and "}" ...
		placeholder = str.substr( pos+2, endpos-pos+1-3 );

		values = placeholder.match( /(\w+):([\w*]+)(:([\w,]+)){0,1}$/ );
		if ( ! values )
		{
			ret.error = true;
			ret.errormsg = "parse error: " + placeholder;
			break;
		}

		ret.type = values[1];
		ret.name = values[2];

		extra = values[4];
    if ( extra )
      ret.extra = extra;

	}; // end breakout box

	return ret;
}

function templateReplacePlaceholderWithValue( str, ph, value )
{
	var newstring;
	var left, middle, right;

	left = str.substr( 0, ph.pos );
	right = str.substr( ph.endpos+1 );
  middle = value;

	newstring = left + middle + right;

	//debugmsg( "" );
	//debugmsg( "BEFORE: " + str );
	//debugmsg( "LEFT: " + left );
	//debugmsg( "MIDDLE: " + middle );
	//debugmsg( "RIGHT: " + right );
	//debugmsg( "NEW: " + newstring );

	return newstring;
}

function templateConditionPasses( template, value )
{
  var pass = true;

  if ( "condition" in template )
  {
    switch ( template.condition )
    {
      case TEMPLATE_CONDITION_UNCONDITIONAL:
        pass = true;
        break;
      case TEMPLATE_CONDITION_BLANK:
        pass = value == "";
        break;
      case TEMPLATE_CONDITION_NOT_BLANK:
        pass = value != "";
        break;
      case TEMPLATE_CONDITION_NULL:
        pass = value == null;
        break;
      case TEMPLATE_CONDITION_NOT_NULL:
        pass = value != null;
        break;
      case TEMPLATE_CONDITION_TRUTHY:
        pass = value ? true : false;
        break;
      case TEMPLATE_CONDITION_FALSY:
        pass = value ? false : true;
        break;
      default:
        pass = true; // we don't have error checking yet!
    }
  }

  //debugmsg( "Checked template condition " + template.condition + (pass ? " (PASS)" : " (FAIL)") );

  return pass;
}

function templateProcessTemplate( templatename, e, values )
{
	var str = "";
  var template;
  var value, ph;
  var conditionpasses = true;

  template = TfTemplates[templatename];

  //debugmsg( "" );
  //debugmsg( "*** PROCESSING TEMPLATE " + templatename );
  //debugmsg( "TEMPLATE: " + template.template );

  str = template.template;

  if ( template.fieldname )
  {
    value = getValue( e, values, template.fieldname );
    conditionpasses = templateConditionPasses( template, value );
  }

  if ( ! conditionpasses )
  {
    str = "";
  }
  else
  {
    while ( true )
    {
      ph = templateFindPlaceholder( str );
      if ( ph.pos == -1 )
        break;

      if ( ph.type == "field" )
      {
        if ( ph.name == "*" )
          ph.name = template.fieldname;

        value = getValue( e, values, ph.name );
        str = templateReplacePlaceholderWithValue( str, ph, value );
      }
      else if ( ph.type == "template" )
      {
        value = templateProcessTemplate( ph.name, e, values );

        str = templateReplacePlaceholderWithValue( str, ph, value );
      }
    }
  }

	return str;
}
