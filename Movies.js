// Movies.js

function setOmdbFields( o, e )
{
    if ( o.Plot )
        e.set( "plot", o.Plot );
    if ( o.Year )
        e.set( "year", o.Year );
    if ( o.Poster )
        e.set( "poster", o.Poster )
}