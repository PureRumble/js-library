ourglobe.define(
[
	"ourglobe/lib/server/mongodb",
	"ourglobe/server/cluster",
	"./mongodb"
],
function( mods )
{

var FuncVer = ourglobe.FuncVer;
var sys = ourglobe.sys;
var getF = ourglobe.getF;

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;
var Id = mods.get( "cluster" ).Id;

var MongoConHandler =
getF(
new FuncVer( [
	ClusterConHandler.CLUSTER_NAME_S,
	{
		extraItems:
		{
			req: true,
			extraProps: false,
			props:
			{
				host: FuncVer.R_PROPER_STR, port: FuncVer.R_NON_NEG_INT
			}
		}
	}
]),
function( clusterName, conParams )
{
	MongoConHandler.ourGlobeSuper.call(
		this, clusterName, conParams
	);
});

sys.extend( MongoConHandler, ClusterConHandler );

MongoConHandler.NATIVE_QUERY_OBJ_S = FuncVer.PROPER_OBJ;

MongoConHandler.QUERY_OBJ_S =
{
	types:[ "arr", Id, MongoConHandler.NATIVE_QUERY_OBJ_S ],
	extraItems: Id
};

return MongoConHandler

},
function( mods, MongoConHandler )
{

var libMongoDb = mods.get( "lib/server/mongodb" );

var Db = libMongoDb.Db;
var Server = libMongoDb.Server;
var Collection = libMongoDb.Collection;
var Cursor = libMongoDb.Cursor;
var MongoDbBinary = libMongoDb.Binary;

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;

var Id = mods.get( "cluster" ).Id;
var Binary = mods.get( "cluster" ).Binary;

var MongoDb = mods.get( "./mongodb");

MongoConHandler.PREPARING_HANDLERS =
{
	prepareBinary:
	getF(
	new FuncVer( [ Buffer, ClusterConHandler.CONTENT_TYPE_S ] )
		.setReturn( MongoDbBinary ),
	function( buf, contentType )
	{
		return new MongoDbBinary( buf );
	}) 
};

MongoConHandler.RESTORING_HANDLERS =
{
	restoreBinary:
	getF(
	new FuncVer( [ "any", "any" ] ).setReturn( Buffer ),
	function( mongoDbBinary, contentType )
	{
		if( mongoDbBinary instanceof MongoDbBinary === false )
		{
			throw new ClusterDataRuntimeError(
				"A MongoDbBinary from the cluster hasnt been provided "+
				"as expected for restoring the Binary",
				{ providedVar:mongoDbBinary }
			);
		}
		
		var returnVar = undefined
		
		try
		{
			returnVar = mongoDbBinary.read( 0 );
		}
		catch( e )
		{
			throw new ClusterDataRuntimeError(
				"An error occurred while converting the MongoDbBinary "+
				"to a Buffer",
				{ mongoDbBinary: mongoDbBinary, err: e }
			);
		}
		
		return returnVar;
	})
};

MongoConHandler.prepareQueryObj =
getF(
new FuncVer( [ MongoConHandler.QUERY_OBJ_S ] )
	.setReturn( MongoConHandler.NATIVE_QUERY_OBJ_S ),
function( queryObj )
{
	if( queryObj instanceof Id === true )
	{
		queryObj = [ queryObj ];
	}
	
	if( sys.hasType( queryObj, "arr" ) === true )
	{
		var ids = [];
		
		for( var item in queryObj )
		{
			ids.push( queryObj[ item ].toString() );
		}
		
		queryObj = { _id:{ "$in": ids } };
	}
	
	return queryObj;
});

MongoConHandler.prototype.getOpenCon =
getF(
new FuncVer( [
	{
		extraProps: false,
		props:
		{
			host: FuncVer.R_PROPER_STR, port: FuncVer.R_NON_NEG_INT
		}
	},
	"func"
]),
function( conParams, cb )
{
	var server = new Server( conParams.host, conParams.port, {} );
	
	var db =
	new Db(
		MongoDb.getStandardDbName(), server, { strict: true }
	);
	
	db.open(
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "null/undef", Db ] ),
		function( err, db )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			else
			{
				cb( undefined, db );
			}
		})
	);
});

var objS =
{
	props:
	{
		id:{ req: true, types: Id }, _id: { badTypes: "any" }
	}
};

MongoConHandler.prototype.insert =
getF(
new FuncVer( [
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ objS, "arr" ], extraItems: objS },
	"func"
]),
function( collectionName, objs, cb )
{
	if( sys.hasType( objs, "arr" ) === false )
	{
		objs = [ objs ];
	}
	
	if( objs.length === 0 )
	{
		cb( undefined );
		
		return;
	}
	
	this.getCurrCon(
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "undef", Db ] ),
		function( err, db )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			var restoreInfo =
				ClusterConHandler.prepareSetForCluster(
					objs, MongoConHandler.PREPARING_HANDLERS
				)
			;
			
			for( var item in objs )
			{
				objs[ item ]._id = objs[ item ].id.id;
			}
			
			var coll = new Collection( db, collectionName );
			
			coll.insert(
				objs,
				{ safe:true },
				getF(
				new FuncVer( [ Error ] )
					.addArgs( [ "null/undef", "any" ] ),
				function( err, insObjs )
				{
					for( var item in objs )
					{
						delete objs[ item ]._id;
					}
					
					ClusterConHandler.restoreSet( restoreInfo );
					
					if( sys.errorCheck ( err, cb ) === true )
					{
						return;
					}
					
					cb( undefined );
				})
			);
		})
	);
});

MongoConHandler.prototype.query =
getF(
new FuncVer( [
	ClusterConHandler.COLLECTION_NAME_S,
	MongoConHandler.QUERY_OBJ_S,
	"func"
]),
function( collectionName, queryObj, cb )
{
	queryObj = MongoConHandler.prepareQueryObj( queryObj );
	
	if(
		sys.hasType( queryObj, "arr" ) === true &&
		queryObj.length === 0
	)
	{
		cb( undefined, [] );
		
		return;
	}
	
	this.getCurrCon(
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "undef", Db ] ),
		function( err, db )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			var coll = new Collection( db, collectionName );
			
			coll.find(
				queryObj,
				getF(
				new FuncVer( [ Error ] )
					.addArgs( [ "null/undef", Cursor ] ),
				function( err, cursor )
				{
					if( sys.errorCheck( err, cb ) === true )
					{
						return;
					}
					
					cursor.toArray(
						getF(
						new FuncVer( [ Error ] )
							.addArgs( [ "null/undef", "arr" ] ),
						function( err, items )
						{
							if( sys.errorCheck( err, cb ) === true )
							{
								return;
							}
							
							for( var item in items )
							{
								if( "_id" in items[ item ] === true )
								{
									delete items[ item ]._id;
								}
							}
							
							ClusterConHandler.restoreSetFromCluster(
								items, MongoConHandler.RESTORING_HANDLERS
							);
							
							cb( undefined, items );
						})
					);
				})
			);
		})
	);
});

MongoConHandler.prototype.delete =
getF(
new FuncVer( [
	ClusterConHandler.COLLECTION_NAME_S,
	MongoConHandler.QUERY_OBJ_S,
	"func"
]),
function( collectionName, queryObj, cb )
{
	queryObj = MongoConHandler.prepareQueryObj( queryObj );
	
	if(
		sys.hasType( queryObj, "arr" ) === true &&
		queryObj.length === 0
	)
	{
		cb( undefined );
		
		return;
	}
	
	this.getCurrCon(
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "undef", Db ] ),
		function( err, db )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			var coll = new Collection( db, collectionName );
			
			coll.remove(
				queryObj,
				{ safe:true },
				getF(
				new FuncVer( [ Error ] )
					.addArgs( [ "null/undef", "any" ] ),
				function( err, nrObjs )
				{
					if( sys.errorCheck( err, cb ) === true )
					{
						return;
					}
					
					cb( undefined );
				})
			);
		})
	);
});

MongoConHandler.prototype.update =
getF(
new FuncVer( [ FuncVer.PROPER_OBJ, "any", "func" ]),
function( queryObj, newObj, cb )
{
	this.getCurrCon(
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "undef", Db ] ),
		function( err, db )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			var restoreInfo =
				ClusterConHandler.prepareSetForCluster(
					newObj, MongoConHandler.PREPARING_HANDLERS
				)
			;
			
			var coll = new Collection( db, collectionName );
			
			coll.update(
				queryObj,
				newObj,
				{ safe: true, multi: true },
				getF(
				new FuncVer( [ Error ] ).addArgs( [ "null/undef" ] ),
				function( err )
				{
					ClusterConHandler.restoreSet( restoreInfo );
					
					if( sys.errorCheck( err, cb ) === true )
					{
						return;
					}
					
					cb( undefined );
				})
			);
		})
	);
});

});
