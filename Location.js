// Location.js

function degreesToRadians(degrees) { return degrees * Math.PI / 180; }

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) { var earthRadiusKm = 6371; var dLat = degreesToRadians(lat2-lat1); var dLon = degreesToRadians(lon2-lon1); lat1 = degreesToRadians(lat1); lat2 = degreesToRadians(lat2); var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return earthRadiusKm * c; }

function km2miles(km)
{
    return km * 0.6213712;
}

function round2( f )
{
    var n;
    n = Math.round(f*1000);
    n = n + 5;
    n = Math.floor(n/10);
    n = n / 100;
    return n;
}

function milesBetween( lat1, lon1, lat2, lon2 )
{
    return km2miles(
        distanceInKmBetweenEarthCoordinates(
            lat1, lon1, lat2, lon2 ) );
}

function milesFromNvpLocation( loc, k2 )
{
    var loc2;
    
    loc2 = getNvpLocation("Location", k2);
    
    return round2(
        milesBetween(
            loc.lat, loc.lng,
            loc2.lat, loc2.lng));
}

function milesFromHome( loc )
{
    return milesFromNvpLocation(
        loc, "Home");
}

function milesFromOffice( loc )
{
    return milesFromNvpLocation(
        loc, "Office");
}

function updatePlaceEntryDistances(e)
{
    var loc, dhome, doff;

    loc = e.field("GPS Location");
    if ( loc )
    {
        dhome = milesFromHome(loc);
        doff = milesFromOffice(loc);
    }
    else
    {
        dhome = 9999.0;
        doff = 9999.0;
    }
    e.set("Miles from Home", dhome);
    e.set("Miles from Office", doff);
}