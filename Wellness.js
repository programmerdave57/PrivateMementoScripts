// Wellness.js

function updateWellnessScore( e )
{
    var categories = [
                "Wellness",
                "Energy Level",
                "Activity Level",
                "Outlook",
                "Cognition" ];
    var categorycount = categories.length;
    var bucketcount = 4;
    var score, name, b, c, v;
    
    var prevvalues = [0,0,0,0,0];
    var value;

    score = 0;
    for ( b=1; b<=bucketcount; b++ )
    {
        score += 2; // + 2; // 2 future categories...

        for ( c=0; c<categorycount; c++ )
        {
            name = "" + b + ". " + categories[c];
            value = e.field(name);
            if ( -1 == value.indexOf("select") )
            {
              v = prevvalues[c];
            }
            else
            {
              v = parseInt( value, 10 );
              prevvalues[c] = v;
            }
            score += v;
        }
    }

    //score += 2; // max 48 becomes 50 ...
    //score *= 2; // for 4 .. 100 for the day ...
    e.set( "Wellness Score", score );
}

function updateWellnessMarker( e )
{
  var score = e.field( "Wellness Score" );
  var marker;
  
  if ( score >= 50 )
    marker = "Green";
  else if ( score >= 40 )
    marker = "Yellow";
  else
    marker = "Red";
    
  e.set( "marker", marker );
}

function updateWellnessIndicators( e )
{
  updateWellnessScore( e );
  updateWellnessMarker( e );
}

// -----------------------------

// unified day view contains all
// entries from the following
// libraries for that date...
// • Events
//     ○ Mom Care entries
//     ○ entries with her linked
//     ○ Prepared Recipe entries
// • Mom Activities
// • Food Diary
// • Health Log
// • Viewings