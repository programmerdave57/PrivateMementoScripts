// WellnessConsolidatedView.js

var RunningOnPhone = true;

if ( ! RunningOnPhone )
{
  var fs = require('fs');
}

// ------------------------------------
// TEMPLATES...
// ------------------------------------

const
  TEMPLATE_CONDITION_UNCONDITIONAL = 0,
  TEMPLATE_CONDITION_BLANK = 1,
  TEMPLATE_CONDITION_NOT_BLANK = 101,
  TEMPLATE_CONDITION_NULL = 2,
  TEMPLATE_CONDITION_NOT_NULL = 102,
  TEMPLATE_CONDITION_TRUTHY = 3,
  TEMPLATE_CONDITION_FALSY = 4;

var Templates = {

  entry: {
    template: "<div class=entry><div class=entryheading><span class=\"icon {?field:iconclass}\"></span><span class=timestamp>{?field:ts}</span></div>{?field:content}</div>",
  },

  desc: {
    template: "<div class=notetext>{?field:*}</div>",
    fieldname: "Desc",
    condition: TEMPLATE_CONDITION_NOT_BLANK,
  },

  notes: {
    template: "<div class=notetext>{?field:*}</div>",
    fieldname: "Notes",
    condition: TEMPLATE_CONDITION_NOT_BLANK,
  },

  duration: {
    template: "<div>{?field:*}</div>",
    fieldname: "Duration",
    condition: TEMPLATE_CONDITION_NOT_NULL,
  },
    
  intake_size: {
    template: " - {?field:*}",
    fieldname: "Size",
    condition: TEMPLATE_CONDITION_NOT_BLANK,
  },

  intake_food: {
    template: "<div><span class=mainline>{?field:Food}</span>{?template:intake_size}</div>",
  },

  intake_amount: {
    template: "<div>Amount: {?field:*}</div>",
    fieldname: "Amount",
    condition: TEMPLATE_CONDITION_NOT_BLANK,
  },

  intake_fluids: {
    template: "<div class=emblazon>Fluids: {?field:*}</div>",
    fieldname: "Fluid Ounces",
    condition: TEMPLATE_CONDITION_NOT_NULL,
  },

  intake: {
    template: "{?template:intake_food}{?template:intake_amount}{?template:intake_fluids}{?template:desc}",
  },
  
  activity: {
    template: "<div><span class=mainline>{?field:Activities}</span></div>{?template:duration}{?template:notes}",
  },
  
  healthlog: {
    template: "<div><span class=mainline>{?field:Type} - {?field:Data}</span></div>{?template:desc}",
  },
};

// key "T999999999.888" ...
// 999999999 = unix time (seconds)...
// 888 = 001, 002, etc., for collisions...
// data is complete HTML text for one timestamped entry...
var SectionSequencer = {};




function debugmsg( msg )
{
	//console.log( msg );
}


// ---------------------------------
// SECTION SEQUENCER...
// ---------------------------------

function addWellnessSectionToSequencer( date, text )
{
  var time, collisioncounter = 0, keybase, key;

  time = Math.floor(date.getTime()/1000); // seconds...
  keybase = "T" + ("0000000000000000" + time).substr( -16 ) + ".";
  
  for ( collisioncounter=0; collisioncounter<100; collisioncounter++ )
  {
    key = keybase + ("000" + collisioncounter).substr( -3 );
    if ( ! (key in SectionSequencer) )
      break;
  }

  SectionSequencer[key] = text;
}

function getAllHTML()
{
  var keys, count, i;
  var html = "";

  keys = Object.keys( SectionSequencer );
  keys.sort();

  count = keys.length;
  for ( i=0; i<count; i++ )
  {
    //html += "<div>" + keys[i] + "</div>";
    html += SectionSequencer[keys[i]];
  }

  return html;
}


// ---------------------------------
// WELLNESS STUFF...
// ---------------------------------

function wellnessFormatTimestamp( date )
{
  //return moment(when).format("ddd YYYY-MM-DD h:mm a");

  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
  var h, ampm;
  var ts;

  h = date.getHours();
  if ( h < 12 )
  {
    ampm = "am";
    if ( h == 0 )
      h = 12;
  }
  else
  {
    ampm = "pm";
    if ( h > 12 )
      h -= 12;
  }

  ts = days[date.getDay()] + " " +
        date.getFullYear() + "-" +
        ("00" + (date.getMonth()+1)).substr(-2) + "-" +
        ("00" + date.getDate()).substr(-2) + " " +
        "" + h + ":" +
        ("00" + date.getMinutes()).substr(-2) + " " +
        ampm;

  return ts;
}

function formatDuration( min )
{
  var h, m, duration = "";
  
  h = Math.floor( min / 60 );
  m = min % 60;
  
  if ( h )
    duration = "" + h + " hours, ";
  
  duration += "" + m + " minutes";
  
  return duration;
}

function saveWellnessEntryContent( iconclass, date, content )
{
  var entryvalues;
  var html;

  entryvalues = {
    iconclass: iconclass,
    content: content,
    ts: wellnessFormatTimestamp( date )
  };

  // wrap the content with the entry div stuff...
  html = templateProcessTemplate( "entry", null, entryvalues );

  addWellnessSectionToSequencer( date, html );
}

function prepareCSS()
{
  var text;
 
  if ( RunningOnPhone )
  {
    var f = file( "/sdcard/memento/Dave/app/MomWellness/wellness.css" );
    text = f.readAll();
    f.close();
  }
  else
  {
    text = fs.readFileSync( "wellness.css", "utf-8" );
  }

  addWellnessSectionToSequencer( new Date(1900, 01, 01), text );
}


// ---------------------------------
// DATABASE ACCESS...
// ---------------------------------

function getField( e, fieldname )
{
  if ( RunningOnPhone )
    return e.field( fieldname );
  else
    return e[fieldname]; // temporary code...
}

function getValue( e, values, fieldname )
{
  var value;

  if ( fieldname in values )
  {
    value = values[fieldname];
    debugmsg( "FIELD: values[" + fieldname + "] = " + value );
  }
  else
  {
    value = getField( e, fieldname );
    debugmsg( "FIELD: database_lookup[" + fieldname + "] = " + value );
  }

  return value;
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

		//if ( extra )
		//{
			//var i;
			//values = conditional.split( /\s*,\s*/ );
      //for ( i=0; i<values.length; i++ )
			//{
				//if ( values[i] == "iftrue" )
					//ret.iftrue = true;
				//else if ( values[i] == "spaceafter" )
					//ret.spaceafter = true;
				//else
				//{
					//ret.error = true;
					//ret.errormsg = "conditional parse error: \"" +
									//conditional + "\" at \"" + values[i] + "\"";
					//break;
				//}
			//}
		//}

		//debugmsg( values.join("\n") );

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

	debugmsg( "" );
	debugmsg( "BEFORE: " + str );
	debugmsg( "LEFT: " + left );
	debugmsg( "MIDDLE: " + middle );
	debugmsg( "RIGHT: " + right );
	debugmsg( "NEW: " + newstring );

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

  debugmsg( "Checked template condition " + template.condition + (pass ? " (PASS)" : " (FAIL)") );

  return pass;
}

function templateProcessTemplate( templatename, e, values )
{
	var str = "";
  var template;
  var value, ph;
  var conditionpasses = true;

  template = Templates[templatename];

  debugmsg( "" );
  debugmsg( "*** PROCESSING TEMPLATE " + templatename );
  debugmsg( "TEMPLATE: " + template.template );

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


// ---------------------------------
// INTAKE...
// ---------------------------------

function processIntakeEntries( we )
{
  // pass Wellness entry...
  
  var entriesfake = // these are database entries...
      [
        { "Date": new Date( 2019, 04, 01, 10, 05, 00 ),
          "Desc": "Mom ate the whole thing.",
          "Food": "Eggs, scrambled (2)",
          "Size": "",
          "Amount": "All",
          "Fluid Ounces": null },
        { "Date": new Date( 2019, 04, 01, 10, 05, 00 ),
          "Desc": "",
          "Food": "Toast with butter",
          "Size": "Made with the large size bread",
          "Amount": "Three quarters",
          "Fluid Ounces": null },
        { "Date": new Date( 2019, 04, 01, 10, 00, 02 ),
          "Desc": "This was all she could drink.",
          "Food": "Juice, orange",
          "Size": "4 oz",
          "Amount": "",
          "Fluid Ounces": 2.5 },
        { "Date": new Date( 2019, 04, 01, 14, 27, 03 ),
          "Desc": "That was all she wanted.",
          "Food": "Soup, chicken rice, Campbell's",
          "Size": "6 oz",
          "Amount": "Half",
          "Fluid Ounces": 3 },
      ];

  var entries; // array of entries returned by the database...
  var e, count, i;
  var values = {};
  var html;
  var date;

  // get intake entries that link to this wellness entry...
  if ( RunningOnPhone )
  {
    entries = libByName("Mom Intake Log").linksTo( we );
  }
  else
  {
    entries = entriesfake;
  }
  

  // process entries...
  count = entries.length;
  for ( i=0; i<count; i++ )
  {
    e = entries[i];

    debugmsg( "" );
    debugmsg( "*************************************************" );
    debugmsg( "ENTRY: " + e["Food"] );

    date = getField( e, "Date" );
    html = templateProcessTemplate( "intake", e, values );
    saveWellnessEntryContent( "intake", date, html );
  }
}

function processActivityEntries( we )
{
  // pass Wellness entry...
  
  var entriesfake = // these are database entries...
      [
      ];

  var entries; // array of entries returned by the database...
  var e, count, i;
  var values = {};
  var html;
  var date, time, datetime;
  var min, duration;

  // get activity entries that link to this wellness entry...
  if ( RunningOnPhone )
  {
    entries = libByName("Mom Activities").linksTo( we );
  }
  else
  {
    entries = entriesfake;
  }
  
  // process entries...
  count = entries.length;
  for ( i=0; i<count; i++ )
  {
    e = entries[i];
    date = getField( e, "Date" );
    time = getField( e, "Time" );
    datetime = combineDateTime( date, time );
    //datetime = date;
    
    values["Activities"] = getField( e, "Activities" ).join( ", " );
    
    min = getField("Duration");
    if ( min )
      duration = formatDuration( min );
    else
      duration = null;
    
    values["Duration"] = duration;
    
    
    html = templateProcessTemplate( "activity", e, values );
    saveWellnessEntryContent( "activity", datetime, html );
  }
}

function processHealthEntries( we )
{
  // pass Wellness entry...
  
  var entriesfake = // these are database entries...
      [
      ];

  var entries; // array of entries returned by the database...
  var e, count, i;
  var values = {};
  var html;
  var date, time, datetime;

  // get heslth log entries that link to this wellness entry...
  if ( RunningOnPhone )
  {
    entries = libByName("Mom Health Log").linksTo( we );
  }
  else
  {
    entries = entriesfake;
  }
  
  // process entries...
  count = entries.length;
  for ( i=0; i<count; i++ )
  {
    e = entries[i];
    date = getField( e, "Date" );
    
    html = templateProcessTemplate( "healthlog", e, values );
    saveWellnessEntryContent( "healthlog", date, html );
  }
}


// ---------------------------------
// MAIN...
// ---------------------------------

function updateWellnessConsolidatedView( we )
{
  var html;

  prepareCSS();
  processActivityEntries( we );
  processIntakeEntries( we );
  processHealthEntries( we );

  html = getAllHTML();

  if ( RunningOnPhone )
  {
    we.set( "Consolidated Day View", html );
  }
  else
  {
    console.log( html );
  }
}

var we;

if ( ! RunningOnPhone )
  updateWellnessConsolidatedView( {} );

// this goes in the script on the phone...
//updateWellnessConsolidatedView( entry() );