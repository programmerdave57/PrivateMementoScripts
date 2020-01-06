// UpdateMovedFileLinks.js

var umfl_NewBeginning = "file:///sdcard/Davestore/memento/files/Dave/";
var umfl_OldBeginning = "file:///storage/extSdCard/Dave/memento/files/";

//var umfl_NewBeginning = "file:///sdcard/Davestore/Photos/";
//var umfl_OldBeginning = "file:///storage/extSdCard/Dave/Photos/";

var umfl_LogDir = "/sdcard/Dave/logs/memento";
var umfl_LogFileName;
var umfl_LogFile;    
    
function umfl_twonum( n )
{
    var out;
    out = "" + n;
    if ( n < 10 ) out = "0" + out;
    return out;
}

function umfl_getLogName( op, libname, fieldname )
{
    var name;
    var now;

    now = new Date();
    name = "" +
        now.getFullYear() +
        umfl_twonum( now.getMonth()+1 ) +
        umfl_twonum( now.getDate() ) +
        "_T" +
        umfl_twonum( now.getHours() ) +
        umfl_twonum( now.getMinutes() ) +
        umfl_twonum( now.getSeconds() );

    name += "_" + op + "_" + libname + "_" + fieldname + ".txt";

    name = umfl_LogDir + "/" + name;
    return name;
}

function umfl_openLog( name )
{
    umfl_LogFileName = name;
    umfl_LogFile = file( umfl_LogFileName );
}

function umfl_mylog( msg )
{
    umfl_LogFile.writeLine( msg );
}

function umfl_closeLog( name )
{
    umfl_LogFile.close();
}

// - - - - - - - - - - - - - - - - 

function umfl_updateOneEntry( e, fieldname )
{
    var links;
    var photos;
    var fname;
    var newname;
    var i;
    var count;
    var pos;
    var newnames = new Array();
    var dirty = false;

    umfl_mylog( "PROCESSING_ENTRY: " + e.name );

    links = e.field( fieldname );

    umfl_mylog( "LINKS_BEFORE: " + links );

    count = links.length;
    for ( i=0; i<count; i++ )
    {
        fname = links[i];
        //mylog( "\n" + fname );

        if ( fname.startsWith(umfl_OldBeginning) )
        {
            dirty = true;
            //debugout += "FOUND " + Beginning + "\n";
            //pos = fname.lastIndexOf("/");
            //newname = NewBeginning +
            //                           fname.substr( pos+1 );
            newname = umfl_NewBeginning +
                fname.substr( umfl_OldBeginning.length );
                
            //debugout += "NEWNAME: " + newname + "\n";
            newnames.push( newname );
        }
        else
        {
            newnames.push( fname );
        }
    } // end loop through all links in this entry

    //debugout += "\nNew value for Photos:\n" + newnames;

    if ( dirty )
    {
        umfl_mylog( "LINKS_UPDATED: " + newnames );
        e.set( fieldname, newnames );
    }
    else
    {
        umfl_mylog( "NO_UPDATE" );
    }

} // end function updateOneEntry

function updateMovedFileLinks( libname, fieldname )
{
    var lib;
    var entries;
    var e;
    var count, i;
    
    lib = libByName( libname );
    //libname = lib.title;
    
    umfl_openLog( umfl_getLogName("UMFL", libname, fieldname) );
    
    umfl_mylog( "Update Moved File Links" );
    umfl_mylog( "PROCESSING_LIB: " + libname );
    umfl_mylog( "FIELDNAME: " + fieldname );
    //umfl_mylog( "TEST_MODE_NO_UPDATES" );
    
    entries = lib.entries();
    count = entries.length;
    for ( i=0; i<count; i++ )
        umfl_updateOneEntry( entries[i], fieldname );
    
    umfl_mylog( "END_PROCESSING_LIB: " + libname );
    
    umfl_closeLog();
}