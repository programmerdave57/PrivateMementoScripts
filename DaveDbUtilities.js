// DaveDbUtilities.js

function AddTsNoteToField(
  e, note, fieldname, optional_when )
{
    var text, when, ts;
    
    text = e.field(fieldname);
    if ( optional_when )
        when = optional_when; // Date() object...
    else
        when = new Date();
    ts = moment(when).format("ddd YYYY-MM-DD h:mm a");
    
    if ( text )
        text += "\n\n";
    else
        text = ""; // might be null or undefined...
    text += "● " + ts + "\n" + note;
    
    e.set( fieldname, text );
}

//AddTsNoteToField(
//       entry(), arg("Note"),"Desc", arg("When") );