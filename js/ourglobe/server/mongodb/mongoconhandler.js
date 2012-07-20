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

var MongoConHandler =
getF(
new FuncVer( [
	FuncVer.PROPER_STR_L,
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
	Id:
	getF(
	new FuncVer( [ Id ], MongoDbBinary ),
	function( id )
	{
		return new MongoDbBinary( id.getBuffer() );
	}),
	
	Binary:
	getF(
	new FuncVer( [ Binary ], MongoDbBinary ),
	function( binary )
	{
		return new MongoDbBinary( binary.getBuffer() );
	}) 
};

MongoConHandler.RESTORING_HANDLERS =
{
	Id:
	getF(
	new FuncVer( [ "any" ], Id ),
	function( id )
	{
		if( id instanceof MongoDbBinary === false )
		{
			throw new ClusterDataRuntimeError(
				"An Id obj must contain a MongoDbBinary"
			);
		}
		
		var returnVar = undefined;
		var buf = undefined;
		
		try
		{
			buf = id.read( 0 );
		}
		catch( e )
		{
			throw new ClusterDataRuntimeError(
				"An error occurred while converting a MongoDbBinary to "+
				"a Buffer",
				{ mongoDbBinary: id, err: e }
			);
		}
		
		try
		{
			returnVar = new Id( buf );
		}
		catch( e )
		{
			if( e.ourGlobeCode === Id.INVALID_ARGS_FOR_ID_CREATION )
			{
				e =
					new ClusterDataRuntimeError(
						"An Id obj must contain a MongoDbBinary that "+
						"represents an id validly",
						{ mongoDbBinary: id }
					);
				;
			}
			
			throw e;
		}
		
		return returnVar;
	}),
	
	Binary:
	getF(
	new FuncVer(
		[ MongoDbBinary, Binary.CONTENT_TYPE_S ], Binary
	),
	function( content, contentType )
	{
		var returnVar = undefined;
		
		try
		{
			returnVar = new Binary( content.read( 0 ), contentType );
		}
		catch( e )
		{
			throw new ClusterDataRuntimeError(
				"Valid content or content type hasnt been provided",
				{ content:content, contentType:contentType }
			);
		}
		
		return returnVar;
	})
};

MongoConHandler.prototype.getOpenCon =
getF(
new FuncVer( [
	{
		extraProps:false, props:{
			host:FuncVer.R_PROPER_STR, port:FuncVer.R_NON_NEG_INT
		}
	},
	"func"
]),
function( conParams, cb )
{
	var server = new Server( conParams.host, conParams.port, {} );
	
	var db = new Db(
		MongoDb.getStandardDbName(), server, { strict:true }
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
			
			for( var prop in objs )
			{
				objs[ prop ]._id = objs[ prop ].id[ "::id" ];
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
					for( var prop in objs )
					{
						delete objs[ prop ]._id;
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
	{ types:[ "arr", Id, FuncVer.PROPER_OBJ ], extraItems: Id },
	"func"
]),
function( collectionName, query, cb )
{
	if( query instanceof Id === true )
	{
		query = [ query ];
	}
	
	if( sys.hasType( query, "arr" ) === true )
	{
		var ids = [];
		
		for( var prop in query )
		{
			ids.push( new MongoDbBinary( query[ prop ].getBuffer() ) );
		}
		
		if( ids.length === 0 )
		{
			cb( undefined );
			
			return;
		}
		
		query = { _id:ids };
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
				query,
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
							.addArgs( [
								"null/undef",
								{
									extraItems:
									{
										props: { _id:MongoDbBinary }
									}
								}
							]),
						function( err, items )
						{
							if( sys.errorCheck( err, cb ) === true )
							{
								return;
							}
							
							for( var prop in items )
							{
								delete items[ prop ]._id;
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
	{
		types:[ "arr", Id, FuncVer.PROPER_OBJ ], extraItems: Id
	},
	"func"
]),
function( collectionName, query, cb )
{
	if( query instanceof Id === true )
	{
		query = [ query ];
	}
	
	if( sys.hasType( query, "arr" ) === true )
	{
		var ids = [];
		
		for( var prop in query )
		{
			ids.push( new MongoDbBinary( query[ prop ].getBuffer() ) );
		}
		
		if( ids.length === 0 )
		{
			cb( undefined );
			
			return;
		}
		
		query = { _id:ids };
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
				query,
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
