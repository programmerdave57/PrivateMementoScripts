// NVP.js

function getNvpValue( k1, k2, fname )
{
  var val = null;
  var k, e;
  
  k = k1 + "/" + k2;
  e = libByName("NVP").findByKey(k);
  if ( e )
    val = e.field( fname );

  return val;
}

function setNvpValue( k1, k2, fname, value )
{
  var k, e;
  
  k = k1 + "/" + k2;
  e = libByName("NVP").findByKey(k);
  
  if ( e )
  {
      e.set( fname, value );
      e.set( "Date Modified", new Date() );
  }
 else
 {
 	message(
 "+-----------------------------------------+\n" +
 "|     E   R   R   O   R   !   !   !     |\n" +
 "|     NVP key not found:        |\n" +
 "|     " + k + "\n" +
 "+-----------------------------------‐------+" );
  }
}

function getNvpReal( k1, k2 )
{
  return getNvpValue(k1, k2, "Value Real");
}

function getNvpInteger( k1, k2 )
{
    return getNvpValue(k1, k2, "Value Integer");
}

function getNvpIntegerAutoIncrement(k1, k2)
{
	  var v;
	  v = getNvpInteger(k1,k2);
	  setNvpInteger(k1,k2,v+1);
	  return v;
}

function setNvpInteger(k1, k2,  value )
{
	  setNvpValue(k1,k2,"Value Integer",value);
}

function getNvpString( k1, k2 )
{
  return getNvpValue(k1, k2, "Value String");
}

function getNvpLocation( k1, k2 )
{
    return getNvpValue(k1, k2, "Value Location");
}