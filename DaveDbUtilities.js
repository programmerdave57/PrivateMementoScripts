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
            e, note, fieldmame);
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