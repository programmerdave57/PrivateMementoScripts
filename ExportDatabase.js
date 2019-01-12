const MEMENTODIR = "/storage/emulated/0/memento";
const MEMENTODIREXT = "/storage/extSdCard/Dave/Backups/memento";
//const MEMENTODIREXT = "/storage/extSdCard/Android/com.luckydroid.droidbase/files/Dave/Export";
const CHUNKMAX = 4096;
const SCRIPTVER = 3;

// version 2 format:
// - added creationTime and
//   lastModifiedTime in toString()
//   format.
// - also added deleted and favorites
//   metadata
// version 3 format:
// - added chunkId (0..n)
//   and chunkSize
//   and lastChunk (boolean)
//   to support breaking it up into
//   multiple passes and multiple
//   files to prevent out of memory
//   errors.

// only formatting changes made is this version only..
// converted tabs to spaces because of Quoda...

function davelog( msg )
{
	log( msg );
}

function twoz(n)
{
	return ("00"+n).substr(-2);
}

function formatHHMMSS( d )
{
	var ret =
		twoz(d.getHours()) + ":" +
		twoz(d.getMinutes()) + ":" +
		twoz(d.getSeconds());

	return ret;
}

function formatYYYYMMDD( d )
{
	var ret =
		d.getFullYear() + "-" +
		twoz(d.getMonth()+1) + "-" +
		twoz(d.getDate());
    
	return ret;
}

function getTimestamp()
{
	var d = new Date();
	var ts;

	// not used. note: this is
	// no longer good for file names...

	ts = formatYYYYMMDD( d ) + "T" +
				formatHHMMSS( d );
  
	return tz;
}

function getliblist()
{
	var arr;

	arr = arg( "Libraries" );

	if ( arr.length == 0 )
	{
		var f = file(MEMENTODIR + "/LibraryNames.txt");
		arr = f.readLines();
	}

	return arr.sort();
}

function listlibs()
{
	var libs = getliblist();
	//message( typeof(libs) + libs.length );
	for (i=0; i<libs.length; i++)
	{
		log(libs[i]);
	}
}

function readTemplate( libname )
{
	var fname = MEMENTODIR + "/" + libname + ".template";
	var f, template;

	f = file( fname );
	template = f.readAll();
	f.close();
	return template;
}

function parseTemplate( template )
{
	var schema;
	schema = JSON.parse(template);
	schema.id = schema.templates[0].lib;
	return schema;
}

function writeTemplateBackup( outdir, libname, template )
{
	var fname;
	var f;
	fname = outdir + "/" + libname +
					".template";
	f = file( fname );
	f.write( template );
	f.close();
}

function saveLib( outdir, libdata, schema )
{
	var f, fname;

	fname = outdir + "/" +
					libdata.name +
					"-" +
					twoz(libdata.chunkId) +
					".json";

	f = file( fname );
	f.write( JSON.stringify(libdata) );
	f.close();
}

function makeLink( e )
{
	var link = {};

	link.id = e.id;
	link.name = e.name;

	return link;
}

function makeLinks( a )
{
	var links=[], link, e, count, i;

	count = a.length;
	for ( i=0; i<count; i++ )
	{
		link = makeLink( a[i] );
		links.push( link );
	}

	return links;
}

function processField( e, schema, i )
{
	var ret;
	var fname, ftype, fvalue;
	var count, i, v;

	function massageArray( a )
	{
		var ret = [];
		for ( i=0; i<a.length; i++ )
		ret.push( a[i] );
		return ret;
	}

	fname = schema.templates[i].tt;
	ftype = schema.templates[i].type;
	fvalue = e.field(fname);
	ret = fvalue; // default...

	switch ( ftype )
	{
		case "ft_string":
					break;
		case "ft_date_time":
					//ret = fvalue.toString();
					break;
		case "ft_date":
					if ( fvalue )
					ret = formatYYYYMMDD(fvalue);
					break;
		case "ft_time_interval":
					if ( fvalue )
					ret = formatHHMMSS(fvalue);
					break;
		case "ft_str_list":
					break;
		case "ft_multy_str_list":
					ret = massageArray( fvalue );
					break;
		case "ft_int":
					break;
		case "ft_real":
					break;
		case "ft_boolean":
					break;
		case "ft_rating":
					break;
		case "ft_img":
					ret = massageArray( fvalue );
					break;
		case "ft_web":
					break;
		case "ft_file":
					ret = massageArray( fvalue );
					break;
		case "ft_lib_entry":
					ret = makeLinks( fvalue );
					break;
	}

	return ret;
}

function processEntry( e, schema )
{
	var obj = {};
	var fields, count, i;
	var fname, fvalue;

	obj.fields = {};
	obj.id = e.id;
	obj.libid = schema.id;
	obj.name = e.name;
	obj.title = e.title;
	obj.description = e.description;
	obj.creationTime = e.creationTime.toString();
	obj.lastModifiedTime = e.lastModifiedTime.toString();
	obj.deleted = e.deleted;
	obj.favorites = e.favorites ? true : false;

	fields = schema.templates;
	count = fields.length;
	for ( i=0; i<count; i++ )
	{
		fname = fields[i].tt;
		fvalue = processField( e, schema, i );
		obj.fields[fname] = fvalue;
	}

	return obj;
}

function processLib( outdir, libname )
{
	var template;
	var schema;
	var lib, entries, e, count, i;
	var libdata = {};

	davelog( "Processing lib " + libname )

	template = readTemplate(libname);
	writeTemplateBackup(outdir, libname, template );
	schema = parseTemplate(template);

	lib = libByName( libname );

	libdata.name = lib.title;
	libdata.id = schema.id;
	libdata.chunkId = 0;
	libdata.chunkSize = 0;
	libdata.lastChunk = true;
	libdata.exportscriptver=SCRIPTVER;
	libdata.entries = [];
	libdata.schema = schema;

	entries = lib.entries();
	count = entries.length;
	davelog( count );
	for ( i=0; i<count; i++ )
	{
		var obj;
		e = entries[i];
		obj = processEntry( e, schema );
		libdata.entries.push( obj );
		libdata.chunkSize++;
		if ( (i == (count-1))
		||   ((libdata.chunkSize % CHUNKMAX) == 0 ) )
		{
			libdata.lastChunk =
			i == (count-1);
			saveLib( outdir, libdata, schema );
			libdata.chunkSize = 0;
			libdata.chunkId++;
			libdata.entries = [];
			libdata.schema = null;
		}
	}

	//davelog(JSON.stringify(libdata));
	//saveLib( outdir, libdata, schema );
}

function DaveExportDatabase_main()
{
	var libnames, i, count;
	//var outdir = MEMENTODIR + "/Dave/Export/latest"; // + getTimestamp();
	var outdir = MEMENTODIR + "/Dave/Export/" + formatYYYYMMDD(new Date());
	outdir = MEMENTODIR + "/Dave/Export/latest";
	davelog( "Hello, World 2!" );
	davelog( "Outputting to " + outdir );

	libnames = getliblist();
	//libnames = ["Tan"];
	count = libnames.length;

	for (i=0; i<count; i++)
	{
		processLib( outdir, libnames[i] );
	}
}

//DaveExportDatabase_main();
