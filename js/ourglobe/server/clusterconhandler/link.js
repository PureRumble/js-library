var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

function Link( collection, id )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ ClusterConHandler.COLLECTION_NAME_S, Id ] )
			.verArgs( arguments )
		;
	}
	
	this.collection = collection;
	this.id = id;
}

Link.prototype.getCollection = function()
{
	if( conf.doVer() === true )
	{
		var fv =
			new FuncVer( [], ClusterConHandler.COLLECTION_NAME_S )
				.verArgs( arguments )
		;
	}
	
	var returnVar = this.collection;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

Link.prototype.getId = function()
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer( [], Id ).verArgs( arguments );
	}
	
	var returnVar = this.id;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

exports.Link = Link;

var Id = require("./id").Id;
var ClusterConHandler =
	require("./clusterconhandler").ClusterConHandler
;
