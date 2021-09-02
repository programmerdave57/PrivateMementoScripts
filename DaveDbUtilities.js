// DaveDbUtilities.js

// testing GitHub access
function AddNoteToField(
            e, note, fieldname )
{
    var text;
    
    text = e.field(fieldname);
    if ( text )
        text += "\n\n";
    else
        text = ""; // might be null or undefined...
    text += "● " + note;
    
    e.set( fieldname, text );
}
  
function AddTsNoteToField(
  e, note, fieldname, optional_when )
{
    var when, ts;
    
    if ( optional_when )
        when = optional_when; // Date() object...
    else
        when = new Date();
    ts = moment(when).format("ddd YYYY-MM-DD h:mm a");
    note = ts + "\n" + note;

    AddNoteToField(
            e, note, fieldname);
}

function GetTimestampWithOffset(
            when, ago )
{
    var ts;

    ts = when;

    if ( ! ts )
        ts = new Date();

    if ( ago )
    {
        ts = moment(ts)
              .add(-ago, "m")
              .toDate();
    }

    return ts;
}

function _getStandardNoteValues()
{
    // for convenience...
    // uses all standard names...

    var adder1, adderm, addera=[];
    var i;
    
    try
    {
        adder1 = arg("Standard Note" );
    }
    catch (e)
    {
        adder1 = "";
    }
    
    try
    {
        adderm = arg("Standard Note Multi" );
    }
    catch (e)
    {
        adderm = [];
    }
    
    if ( adder1 )
        addera.push(adder1);
    for ( i=0; i<adderm.length; i++ )
        addera.push( adderm[i] );
    
    //message(addera.length);
    //exit();
    
    return addera;
}

function AddStandardTsNoteToDesc()
{
    var when, note, add="", 
        count, i, addera;

    note = arg("Note");
    
    addera = _getStandardNoteValues();
    count = addera.length;
    if ( count == 0 )
    {
        if ( note )
            add += note;
    }
    else
    {
        for ( i=0; i<count; i++ )
        {
            if ( add )
                add += "\n";
            add += addera[i];
        }
        if ( note )
        {
            if ( count > 1 )
                add += "\n"; // new behav
            else
                add += " "; // old behav
            add += note;
        }
    }
    
    when = GetTimestampWithOffset(
               arg("When"),
               arg("Minutes Ago") );

    AddTsNoteToField(
       entry(),
       add,
       "Desc",
       when );
}

//AddTsNoteToField(
//       entry(), arg("Note"),"Desc", arg("When") );

function ShowAgoMessage( datefieldname )
{
    message( moment(entry().field(datefieldname)).fromNow() );
}

function GetTimeDurationStringDays( d1, d2 )
{
    var d1min, d2min;
    var d, h, m;
    
    d1min = Math.floor(
        d1.getTime() / 1000 / 60);
    d2min = Math.floor(
        d2.getTime() / 1000 / 60);
        
    m = d2min - d1min;
    
    d = Math.floor( m / 24 / 60 );
    m = m - (d * 24 * 60);
    
    h = Math.floor( m / 60 );
    m = m - (h * 60 );
    
    s = "";
    if ( d )
    {
        s += "" + d + " day";
        if ( d > 1 )
            s += "s";
    }
    if ( d + h )
    {
        if ( d )
            s += " ";
        s += "" + h + " hour";
        if ( h > 1 )
            s += "s";
        s += " ";
    }
    s += "" + m + " minute";
    if ( m > 1 )
        s += "s";
        
    return s;
}

// current entry stuff...
function MakeCurrentIdFilename( lib )
{
    var dir = "/storage/emulated/0/memento/Dave/data";
    var prefix = "CurrentID_";
    var suffix = ".txt";
    var fname, libname;

    if ( ! lib )
        lib = lib();
    libname = lib.title;
    fname = dir + "/" + prefix + libname + suffix;
    return fname;
}

function ReadCurrentIdFromFile( lib )
{
    var fname, id, f;

    fname = MakeCurrentIdFilename(lib);
    f = file(fname);
    id = f.readLine(id);
    f.close();
    //message( id );

    return id;
}

function WriteCurrentIdToFile( e, lib )
{
    RememberCurrentEntry( e, lib );
    message( "Deprecated function call: WriteCurrentIdToFile()" );
}

function RememberCurrentEntry( e, lib )
{
    var fname, id, f;
    
    if ( ! lib )
        lib = lib();

    id = e.id;
    fname = MakeCurrentIdFilename(lib);
    f = file(fname);
    f.write(id);
    f.close();
    //message( id );
}

function FindCurrentEntry( lib )
{
    var e, id;

    if ( ! lib )
        lib = lib();

    id = ReadCurrentIdFromFile( lib );
    e = lib.findById( id );

    return e;
}

function ShowCurrentEntry( lib )
{
    var e;
    
    if ( ! lib )
        lib = lib();
    e = FindCurrentEntry( lib );
    e.show();
}

function AddTsNoteToCurrentEntry()
{
    var when, e;
    
    // for convenience...
    // uses all standard names...
    
    when = GetTimestampWithOffset(
               arg("When"),
               arg("Minutes Ago") );

    e = FindCurrentEntry( lib() );

    AddTsNoteToField(
       e,
       arg("Note"),
       "Desc",
       when );

    message( "Note added to " + e.title );
}

function AddNoteToCurrentEntry(onote)
{
    var e, note;
    
    // for convenience...
    // uses all standard names...
    
    if ( onote )
        note = onote;
    else
        note = arg("Note");
    
    e = FindCurrentEntry( lib() );

    AddNoteToField(
       e,
       note,
       "Desc" );

    message( "Note added to " + e.title );
}

function AddNoteEntryToEntry(
    e, fieldname, text, ts )
{
    var o = {}, oe, notes;

    o.Note = text;
    if ( ts )
        o.Timestamp = ts.getTime();
    else
        o.Timestamp = new Date().getTime();

    oe = libByName("Note Entries").create( o );

    notes = e.field(fieldname);
    notes.push( oe );
    e.set(fieldname, notes );
}

function FormatTimeIndex( ti )
{
    var ret = "";
    var tistr, part;
    var sanity = 5;

    if ( ti != null )
        tistr = "" + ti; // passed, but may be "0"...
    else
        tistr = "";

    while ( tistr )
    {
        part = tistr.substr( -2 );
        if ( ret )
            ret = ":" + ret;
        ret = part + ret;

        tistr = tistr.substr( 0, tistr.length-2 );

        sanity--;
        if ( ! sanity )
            break;
    }

    return ret;
}

/*
function OrMultiSelectFields( e, dest, src )
{
    
}
*/

// **********************************
// time routines...
// **********************************

function combineDateTime( date, time )
{
    var retdate, h, m, s;

    // currently this requires a date value...

    if ( ! time )
    {
        retdate = date;
    }
    else
    {
        retdate = date;
        retdate.setHours( time.getHours() )
        retdate.setMinutes( time.getMinutes() );
        retdate.setSeconds( time.getSeconds() );
        retdate.setMilliseconds( time.getMilliseconds() );
    }

    return retdate;
}

function getTimeDifference( start_date, start_time, end_date, end_time )
{
    var start, end, sec_start, sec_end;
    var seconds = 0;

    if ( ! end_date )
        end_date = start_date;

    start = combineDateTime( start_date, start_time );
    end   = combineDateTime( end_date, end_time );

    sec_start = start.getTime() / 1000; // hello...
    sec_end   = end.getTime() / 1000;
    if ( sec_start > sec_end )
        sec_end += 60*60*24;
    seconds = sec_end - sec_start;

    return seconds;
}

function getTimeDifferenceFromFields( e, field_start_date, field_start_time, field_end_date, field_end_time )
{
    var start_date, start_time, end_date, end_time;
    var seconds;

    if ( field_start_date )
        start_date = e.field(field_start_date);
    if ( field_start_time )
        start_time = e.field(field_start_time);
    if ( field_end_date )
        end_date = e.field(field_end_date);
    if ( field_end_time )
        end_time = e.field(field_end_time);

    seconds = getTimeDifference( start_date, start_time, end_date, end_time );

    return seconds;
}

function formatTimestamp( date )
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

function areYouSure()
{
    if ( ! arg("Are You Sure?") )
    {
        message( "*** Script not run." );
        exit();
    }
}


// ---------------------------------
// DATABASE ACCESS...
// ---------------------------------

function getField( e, fieldname )
{
    return e.field( fieldname );
}

function getValue( e, values, fieldname )
{
  var value;

  if ( fieldname in values )
  {
    value = values[fieldname];
    //debugmsg( "FIELD: values[" + fieldname + "] = " + value );
  }
  else
  {
    value = getField( e, fieldname );
    //debugmsg( "FIELD: database_lookup[" + fieldname + "] = " + value );
  }

  return value;
}
   


// ---------------------------------
// HISTORY FIELD...
// ---------------------------------

function addToHistory( e, code, line, note, date, fieldname )
{
  var history, msg;
  
  if ( ! date )
    date = new Date();
  if ( ! fieldname )
    fieldname = "History";
  
  history = e.field( fieldname );
  
  msg = "D: " + moment(date).format('ddd, MMM D, YYYY, h:mm:ss a');
  if ( code )
    msg += "\n" + code + ": " + line;
  if ( note )
    msg += "\n" + "N: " + note;
  
  history = msg + "\n" + history;
  e.set( fieldname, history );
}