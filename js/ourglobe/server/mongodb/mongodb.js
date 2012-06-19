var conf = require("ourglobe").conf;
var FuncVer = require("ourglobe").FuncVer;

var ClusterMapper =
	require("ourglobe/clusterconhandler").ClusterMapper
;

var MongoDb = {};
MongoDb.STANDARD_DB_NAME = "ourglobedb";

MongoDb.getStandardDbName = function()
{
	if( conf.doVer() === true )
	{
		var fv =
			new FuncVer().setReturn( "str" ).verArgs( arguments )
		;
	}
	
	var returnVar = MongoDb.STANDARD_DB_NAME;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

exports.MongoDb = MongoDb;
