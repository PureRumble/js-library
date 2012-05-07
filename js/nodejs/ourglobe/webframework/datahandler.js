var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;

var FuncVer = require("ourglobe").FuncVer;

var ClusterConHandler =
	require("ourglobe/clusterconhandler").ClusterConHandler
;
var ClusterMapper =
	require("ourglobe/clusterconhandler").ClusterMapper
;

function DataHandler( collection, id )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			ClusterConHandler.COLLECTION_NAME_S, [ Id, "undef" ]
		] )
			.verArgs( arguments )
		;
		
		if( DataHandler.clusterMapper === undefined )
		{
			throw new RuntimeError(
				"A ClusterMapper hasnt been set yet"
			);
		}
	}
	
	this.conHandler =
		DataHandler.clusterMapper.getConHandler( collection )
	;
	this.collection = collection;
	this.id = id;
}

DataHandler.setClusterMapper = function( clusterMapper )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ ClusterMapper ] ).verArgs( arguments );
	}
	
	DataHandler.clusterMapper = clusterMapper;
}

DataHandler.prototype.getConHandler = function()
{
	if( conf.doVer() === true )
	{
		var fv =
			new FuncVer( [], ClusterConHandler ).verArgs( arguments )
		;
	}
	
	var returnVar = this.conHandler;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

DataHandler.prototype.loadObj = function( cb )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ "func" ] ).verArgs( arguments );
		
		this.verify();
	}
	
	this.conHandler.query(
		this.collection,
		this.id,
		function( err, objs )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [
						"undef",
						{
							extraItems:{ props:{ id:{ req:true, types:Id } } }
						}
					] )
					.verArgs( arguments )
				;
			}
			
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			var obj = objs[ 0 ];
			
			if( obj === undefined )
			{
				throw new DataHandlerRuntimeError(
					"There is no obj in the collection with the id of "+
					"this DataHandler",
					this
				);
			}
			
			cb( undefined, obj );
		}
	);
}

DataHandler.prototype.verify = function()
{
	if( conf.doVer() === true )
	{
		new FuncVer().verArgs( arguments );
	}
	
// This function is called from if-statements that check
// conf.doVer(). Therefore the following check shouldnt be
// placed under the same if-statement in this function
	if( this.id === undefined )
	{
		throw new RuntimeError(
			"This DataHandler isnt connected to an object for "+
			"performing query or update",
			DataHandler.prototype.verify
		);
	}
}

exports.DataHandler = DataHandler;

var DataHandlerRuntimeError =
	require("./errors").DataHandlerRuntimeError
;
