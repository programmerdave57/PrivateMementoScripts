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

function getNvpReal( k1, k2 )
{
  return getNvpValue(k1, k2, "Value Real");
}

function getNvpInteger( k1, k2 )
{
  return getNvpValue(k1, k2, "Value Integer");
}

function getNvpString( k1, k2 )
{
  return getNvpValue(k1, k2, "Value String");
}