var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var assert = require("ourglobe").assert;
var FuncVer = require("ourglobe").FuncVer;

function ClusterMapper( clusterConHandlers, mapping )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			{
				extraItems:ClusterConHandler,
				minItems:1,
				denseItems:true
			},
			{ extraItems:"+int" }
		] )
			.verArgs( arguments );
		;
	}
	
	var clusterMapping = [];
	
	for( var coll in mapping )
	{
		var cch = clusterConHandlers[ mapping[ coll ] ];
		
		clusterMapping[ coll ] = cch;
		
		if( cch === undefined )
		{
			throw new RuntimeError(
				"Collection "+coll+" is to be mapped to the "+
				"ClusterConHandler on pos "+mapping[ coll ]+" but arg "+
				"clusterConHandlers is empty on that pos"
			);
		}
	}
	
	this.clusterConHandlers = clusterConHandlers;
	this.clusterMapping = clusterMapping;
}

ClusterMapper.prototype.getConHandler = function( collection )
{
	if( conf.doVer() === true )
	{
		var fv =
			new FuncVer(
				[ ClusterConHandler.COLLECTION_NAME_S ],
				ClusterConHandler
			)
				.verArgs( arguments )
		;
	}
	
	var returnVar = this.clusterMapping[ collection ];
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

exports.ClusterMapper = ClusterMapper;

var ClusterConHandler =
	require("./clusterconhandler").ClusterConHandler
;
