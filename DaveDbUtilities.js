// DaveDbUtilities.js

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

function AddStandardTsNoteToDesc()
{
    var when;
    
    // for convenience...
    // uses all standard names...
    
    when = GetTimestampWithOffset(
               arg("When"),
               arg("Minutes Ago") );

    AddTsNoteToField(
       entry(),
       arg("Note"),
       "Desc",
       when );
}

//AddTsNoteToField(
//       entry(), arg("Note"),"Desc", arg("When") );

function ShowAgoMessage( datefieldname )
{
    message( moment(entry().field(datefieldname)).fromNow() );
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
    var start, end, h, m, s;
    var seconds = 0;

    if ( ! end_date )
        end_date = start_date;

    start = combineDateTime( start_date, start_time );
    end   = combineDateTime( end_date, end_time );

    seconds = end.getTime() - start.getTime();
    if ( seconds < 0 )
        seconds += 60*60*24; // end time is after midnight...

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