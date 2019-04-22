// Wellness.js

function updateWellnessScore( e )
{
    var categories = [
                "Wellness",
                "Energy Level",
                "Physical Activity",
                "Cognition" ];
    var categorycount = categories.length;
    var bucketcount = 4;
    var score, name, b, c, v;

    score = 0;
    for ( b=1; b<=bucketcount; b++ )
    {
        score += 2 + 2; // 2 future categories...

        for ( c=0; c<categorycount; c++ )
        {
            name = "" + b + ". " + categories[c];
            v = parseInt( e.field(name) );
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
  
  if ( score > 55 )
    marker = "Green";
  else if ( score > 40 )
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