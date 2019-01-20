// Movies.js

function _setOmdbField( e, o, name )
{
    var mname;
    var value;

    mname = "o_" + name.toLowerCase();
    e.set( mname, o[name] );
}

function fixTitle( e )
{
    var otext, o, title, otitle;
    
    // sometimes the case is wrong...
    
    otext = e.field( "OMDb Entry" );
    o = JSON.parse( otext );
    
    title = e.field( "Title" );
    otitle = o.Title;
    
    if ( (otitle)
    &&   (title != otitle) )
    {
        e.set( "Title", otitle );
    }
}

function setEntryId( e )
{
    var imdbid;
    
    imdbid = e.field( "o_imdbid" );
    if ( imdbid )
    {
        e.set( "ID", imdbid );
    }
    else
    {
        // what to do? ...
    }
}

function setPosterFilename( e )
{
  var path = "file:///storage/extSdCard/Dave/memento/files/Images/Movie Posters";
  var id, fname;
  var url, pos;
  var ext = ".jpg";
    
  id = e.field( "ID" );
  if ( id )
  {
    url = e.field( "o_poster" );
    if ( url )
    {
      pos = url.lastIndexOf( "." );
      if ( pos != -1 )
      {
        // a little sanity check...
        if ( (url.length-pos-1) <=4 )
        {
          ext = url.substr( pos );
        }
      }
    }
    
    fname = path + "/" +
            id + ext;
    e.set( "Poster", [fname] );        
  }
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
    
    fixTitle( e );
    setEntryId( e );
    setPosterFilename( e );
}

function getOmdbEntry( e )
{
    var title, etitle, year, id;
    var response;
    var url = "http://www.omdbapi.com/?i=tt3896198&apikey=cb500913&plot=full&r=json";
    
    year = e.field( "Year" );
    id = e.field("ID");
    title = e.field( "IMDb Title" );
    if ( title == "*SAME" )
        title = e.field( "Title" );
    etitle = encodeURIComponent( title );
    url += etitle;
    
    if ( year )
        url += "&y=" + year;
        
    if ( id )
    (
        url += "&id=" + id;
    }
    else
    {
        url += "&t=" + title;
    }
    
    response = http().get( url );
    e.set( "OMDb Entry", response.body );
    setOmdbFields( e );
}

function importEntries()
{
    var mlib, e;
    var fname = "/storage/emulated/0/memento/movies_import.json";
    
    var data, text, f, one, title, obj;
    var count, i, j;
    var alist;
    var source;
    var found;
    
    f = file( fname );
    text = f.readAll();
    f.close();
    data = JSON.parse( text );
    
    mlib = lib();
    count = data.titles.length;
    for ( i=0; i<count; i++ )
    {
        one = data.titles[i];
    
        if ( one.Status != "new" )
            continue;
        if ( one.Action != "ADD" )
            continue;
    
        title = one.Title;
        e = mlib.findByKey( title );
        if ( ! e )
        {
            obj = {};
            obj.Title = title;
            obj.Availability = [one.Source];
            obj.Imported = true;
            e = mlib.create( obj );
    
            getOmdbEntry( e );
    
            one.Status = "processed";
            //break;
        }
        else
        {
            // entry exists...
            source = one.Source;
            alist = e.field("Availability");
            found = false;
            for ( j=0; j<alist.length; j++ )
            {
                if ( alist[j] == source )
                {
                    found = true;
                     break;
                 }
            }
            if ( ! found )
            {
                alist.push( source );
                e.set( "Availability", alist );
                one.Status = "processed";
            }
            else
            {
                one.Status = "duplicate";
            }
        }
    }
    
    text = JSON.stringify( data );
    f = file( fname );
    f.write( text );
    f.close();
    
    //message( data.titles.length );
}