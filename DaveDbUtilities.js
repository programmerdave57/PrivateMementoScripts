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
    var dir = "/storage/emulated/0/memento";
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

function FindCurrentEntry( lib )
{
    var e, id;

    if ( ! lib )
        lib = lib();

    id = ReadCurrentIdFromFile( lib );
    e = lib.findById( id );

    return e;
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

/*
function OrMultiSelectFields( e, dest, src )
{
    
}
*/