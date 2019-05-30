// WellnessConsolidatedView.js

// ------------------------------------
// TEMPLATES...
// ------------------------------------



// key "T999999999.888" ...
// 999999999 = unix time (seconds)...
// 888 = 001, 002, etc., for collisions...
// data is complete HTML text for one timestamped entry...
var Debugmsg = "";

function wcvInit()
{
  var templates = {
  
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
      template: "<div>Duration: {?field:*}</div>",
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
      template: "<div class=emblazon>Fluids: {?field:*} ounces</div>",
      fieldname: "Fluid Ounces",
      condition: TEMPLATE_CONDITION_NOT_NULL,
    },
  
    intake_ensure: {
      template: "<div class=embluezon>Ensure: {?field:*} ounces</div>",
      fieldname: "Ensure Ounces",
      condition: TEMPLATE_CONDITION_NOT_NULL,
    },
    
    intake: {
      template: "{?template:intake_food}{?template:intake_amount}{?template:intake_fluids}{?template:intake_ensure}{?template:desc}",
    },
    
    activity: {
      template: "<div><span class=mainline>{?field:Activities}</span></div>{?template:duration}{?template:notes}",
    },
    
    healthlog: {
      template: "<div><span class=mainline>{?field:Type} - {?field:Data}</span></div>{?template:desc}",
    },
    
    footer: {
      template: "<p class=fineprint>View updated on {?field:Text}</p>",
    },
  };
  
  templateInit( templates );
  
  Debugmsg = "";
}

function debugmsg( msg )
{
	//console.log( msg );
	Debugmsg += "\n" + msg;
}

// ---------------------------------
// WELLNESS STUFF...
// ---------------------------------

function saveWellnessEntryContent( iconclass, date, content )
{
  var entryvalues;
  var html;

  entryvalues = {
    iconclass: iconclass,
    content: content,
    ts: formatTimestamp( date )
  };

  // wrap the content with the entry div stuff...
  html = templateProcessTemplate( "entry", null, entryvalues );

  templateAddSectionToSequencer( date, html );
}

function prepareCSS()
{
  var text;
 
  var f = file( "/sdcard/memento/Dave/app/MomWellness/wellness.css" );
  text = f.readAll();
  f.close();

  templateAddSectionToSequencer( new Date(1900, 01, 01), text );
}


// ---------------------------------
// INTAKE...
// ---------------------------------

function processIntakeEntries( we )
{
  // pass Wellness entry...
  
  var entries; // array of entries returned by the database...
  var e, count, i;
  var values = {};
  var html;
  var date;

  // get intake entries that link to this wellness entry...
  entries = libByName("Mom Intake Log").linksTo( we );
  
  // process entries...
  count = entries.length;
  for ( i=0; i<count; i++ )
  {
    e = entries[i];

    //debugmsg( "" );
    //debugmsg( "*************************************************" );
    //debugmsg( "ENTRY: " + e["Food"] );

    date = getField( e, "Date" );
    html = templateProcessTemplate( "intake", e, values );
    saveWellnessEntryContent( "intake", date, html );
  }
}

function processActivityEntries( we )
{
  // pass Wellness entry...

  var entries; // array of entries returned by the database...
  var e, count, i;
  var values = {};
  var html;
  var date, time, datetime;
  var min, duration;

  // get activity entries that link to this wellness entry...
  entries = libByName("Mom Activities").linksTo( we );
  
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
    
    min = getField( e, "Duration");
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

  var entries; // array of entries returned by the database...
  var e, count, i;
  var values = {};
  var html;
  var date, time, datetime;

  // get heslth log entries that link to this wellness entry...
  entries = libByName("Mom Health Log").linksTo( we );

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

function wcvHandleSpecialNoteTypes( note )
{
  var ret = {};
  
  ret.nclass = "note";
  if ( note.startsWith("~~ Call Placed ~~\n") )
  {
    ret.note = note.substr(17);
    ret.note = ret.note.replace( /\n/, "<br>" );
    ret.nclass = "callout";
  }
  else if ( note.startsWith("~~ Call Received ~~\n") )
  {
    ret.note = note.substr(20);
    ret.note = ret.note.replace( /\n/, "<br>" );
    ret.nclass = "callin";
  }
  
  return ret;
}

function processNotes( we )
{
  // pass Wellness entry...
  
  var text, lines, line, note, date;
  var y, mo, d, h, mi, s, ampm;
  var matches;
  var count, i;
  var values = {};
  var html;

  text = getField( we, "Desc" );
  date = getField( we, "Date Entered" );

  lines = text.split( /\r{0,1}\n/ );
  count = lines.length;
  
  note = "";
  for ( i=0; i<count; i++ )
  {
    line = lines[i];
    matches = line.match( /(\w\w\w) (\d\d\d\d)-(\d\d)-(\d\d) (\d{1,2})\:(\d\d) ([ap]m)/ );

    if ( matches )
    {
      //debugmsg( "PARSED TIMESTAMP LINE SUCCESSFULLY" );
      //debugmsg( matches.join("\n") );

      // got a new date, so spit out the current note...
      if ( note )
      {
        var nclass, ret;
        ret = wcvHandleSpecialNoteTypes( note )
        nclass = ret.nclass;
        note = ret.note;
        note = applyDaveMarkup( note );
        values["Desc"] = paragraphizeText(note);
        html = templateProcessTemplate( "desc", null, values );
        saveWellnessEntryContent( nclass, date, html );
      }

      y  = parseInt(matches[2], 10);
      mo = parseInt(matches[3], 10) - 1;
      d  = parseInt(matches[4], 10);
      h  = parseInt(matches[5], 10);
      mi = parseInt(matches[6], 10); // parseInt(matches[6]);
      s  = 0;
      ampm = matches[7];

      if ( ampm == "am" )
      {
        if ( h == 12 )
          h = 0;
      }
      else
      {
        if ( h < 12 )
          h += 12;
      }
      
      date = new Date( y, mo, d, h, mi, s );

      //debugmsg( "SETTING DATE TO " + date.toString() );
      
      //note = "TEMP " + line + "<BR>";
      note = "";
    }
    else // line is not a timestamp line...
    {
      if ( note )
        note += "\n";
      note += line;
    }
  } // end for each line

  if ( note )
  {
    var nclass, ret;
    ret = wcvHandleSpecialNoteTypes( note )
    nclass = ret.nclass;
    note = ret.note;
    note = applyDaveMarkup( note );
    values["Desc"] = paragraphizeText(note);
    html = templateProcessTemplate( "desc", null, values );
    saveWellnessEntryContent( nclass, date, html );
  }
}


// ---------------------------------
// MAIN...
// ---------------------------------

function addFooter()
{
  var values = {};
  
  values["Text"] = formatTimestamp( new Date() );
  html = templateProcessTemplate( "footer", null, values );
  templateAddSectionToSequencer( new Date( 2100, 12, 31), html );
}

function updateWellnessConsolidatedView( we )
{
  var html;

  wcvInit();
  prepareCSS();
  processActivityEntries( we );
  processIntakeEntries( we );
  processHealthEntries( we );
  processNotes( we );
  addFooter();

  html = getAllHTML();

  we.set( "Consolidated Day View", html );
  //we.set( "debugout", html );
  //we.set( "debugout", Debugmsg ); //html );
}

// this goes in the script on the phone...
//updateWellnessConsolidatedView( entry() );