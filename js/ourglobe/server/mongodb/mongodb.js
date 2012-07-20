ourglobe.define(
function( mods )
{

var MongoDb = {};
MongoDb.STANDARD_DB_NAME = "ourglobedb";

return MongoDb;

},
function( mods, MongoDb )
{

var FuncVer = ourglobe.FuncVer;
var getF = ourglobe.getF;

MongoDb.getStandardDbName =
getF(
new FuncVer().setReturn( "str" ),
function()
{
	return MongoDb.STANDARD_DB_NAME;
});

});
