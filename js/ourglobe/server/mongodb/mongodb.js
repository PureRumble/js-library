ourGlobe.define(
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var MongoDb =
Class.create(
{

name: "MongoDb"

});

Class.addStatic(
MongoDb,
{

STANDARD_DB_NAME: "ourglobedb"

});

return MongoDb;

},
function( mods, MongoDb )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

Class.add(
MongoDb,
{

getStandardDbName:
[
"static",
getR( "str" ),
function()
{
	return MongoDb.STANDARD_DB_NAME;
}]

});

});
