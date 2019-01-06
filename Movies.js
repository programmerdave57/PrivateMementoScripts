// Movies.js

function _setOmdbField( e, o, name )
{
    var mname;
    var value;

    mname = "o_" + name.toLowerCase();
    e.set( mname, o[name] );
}

function setOmdbFields( e )
{
    var otext, o;
    var fieldnames =
        [ "Year", "Plot", "Rated", "Released",
           "Runtime", "Genre", "Director", "Writer",
           "Actors", "Poster", "Country", "Language",
           "Production", "Website",
           "Type", "totalSeasons",
           "imdbID"
        ];
    var count, i;

    otext = e.field( "OMDb Entry" );
    if ( otext )
        o = JSON.parse( otext );

    if ( (o) && (o.Response == "True") )
    {
        count = fieldnames.length;
        for ( i=0; i<count; i++ )
            _setOmdbField( e, o, fieldnames[i] );
    }
}

//e = entry();
//setOmdbFields( e );