ourglobe.define(
[
	"ourglobe/lib/server/mongodb",
	"ourglobe/server/cluster",
	"./mongodb"
],
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

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;
var Id = mods.get( "cluster" ).Id;

var libMongoDb = mods.get( "lib/server/mongodb" );

var Db = libMongoDb.Db;
var Server = libMongoDb.Server;
var Collection = libMongoDb.Collection;
var Cursor = libMongoDb.Cursor;
var MongoDbBinary = libMongoDb.Binary;

var MongoConHandler =
Class.create(
{

name: "MongoConHandler",
extends: ClusterConHandler,
constr:
[
function()
{
	return ClusterConHandler.CONSTR_V;
},
function( clusterName, conParams )
{
	this.ourGlobeCallSuper( undefined, clusterName, conParams );
}]

});

var nativeQueryObjS = getV.PROPER_OBJ;

Class.addStatic(
MongoConHandler,
{

NATIVE_QUERY_OBJ_S: nativeQueryObjS,

QUERY_OBJ_S:
	{ types:[ "arr", Id, nativeQueryObjS ], extraItems: Id },

PREPARING_HANDLERS:
{
	prepareBinary:
	getF(
	getA( Buffer, ClusterConHandler.CONTENT_TYPE_S ),
	getR( MongoDbBinary ),
	function( buf, contentType )
	{
		return new MongoDbBinary( buf );
	}) 
},

RESTORING_HANDLERS:
{
	restoreBinary:
	getF(
	getA( "any", "any" ),
	getR( Buffer ),
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
}

});

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

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;

var Id = mods.get( "cluster" ).Id;
var Binary = mods.get( "cluster" ).Binary;

var MongoDb = mods.get( "./mongodb" );

// TODO: Remove this as it is used by insert() which is a public
// func and thus required to always perform check
var objS =
{
	props:
		{ id:{ req: true, types: Id }, _id: { badTypes: "any" } }
};

Class.add(
MongoConHandler,
{

prepareQueryObj:
[
"static",
getA( MongoConHandler.QUERY_OBJ_S ),
getR( MongoConHandler.NATIVE_QUERY_OBJ_S ),
function( queryObj )
{
	if( queryObj instanceof Id === true )
	{
		queryObj = [ queryObj ];
	}
	
	if( hasT( queryObj, "arr" ) === true )
	{
		var ids = [];
		
		for( var item in queryObj )
		{
			ids.push( queryObj[ item ].toString() );
		}
		
		queryObj = { _id:{ "$in": ids } };
	}
	
	return queryObj;
}],

getOpenCon:
[
ClusterConHandler.GET_OPEN_CON_V,
function( conParams, cb )
{
	var server = new Server( conParams.host, conParams.port, {} );
	
	var db =
	new Db(
		MongoDb.getStandardDbName(), server, { strict: true }
	);
	
	db.open(
		getCb(
		this,
		getA( Error ),
		getA( "null/undef", Db ),
		function( err, db )
		{
			if( err !== null && err !== undefined )
			{
				cb( err );
				
				return;
			}
			else
			{
				cb( undefined, db );
				
				return;
			}
		})
	);
}],

insert:
[
getA(
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ objS, "arr" ], extraItems: objS },
	"func"
),
function( collectionName, objs, cb )
{
	if( hasT( objs, "arr" ) === false )
	{
		objs = [ objs ];
	}
	
	if( objs.length === 0 )
	{
		cb( undefined );
		
		return;
	}
	
	this.getCurrCon(
		getCb(
		this,
		getA( Error ),
		getA( "undef", Db ),
		function( err, db )
		{
			if( err !== undefined )
			{
				cb( err );
				
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
				getCb(
				this,
				getA( Error ),
				getA( "null/undef", "any" ),
				function( err, insObjs )
				{
					for( var item in objs )
					{
						delete objs[ item ]._id;
					}
					
					ClusterConHandler.restoreSet( restoreInfo );
					
					if( err !== undefined && err !== null )
					{
						cb( err );
						
						return;
					}
					
					cb();
				})
			);
		})
	);
}],

query:
[
getA(
	ClusterConHandler.COLLECTION_NAME_S,
	MongoConHandler.QUERY_OBJ_S,
	"func"
),
function( collectionName, queryObj, cb )
{
	queryObj = MongoConHandler.prepareQueryObj( queryObj );
	
	if(
		hasT( queryObj, "arr" ) === true &&
		queryObj.length === 0
	)
	{
		cb( undefined, [] );
		
		return;
	}
	
	this.getCurrCon(
		getCb(
		this,
		getA( Error ),
		getA( "undef", Db ),
		function( err, db )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			var coll = new Collection( db, collectionName );
			
			coll.find(
				queryObj,
				getCb(
				this,
				getA( Error ),
				getA( "null/undef", Cursor ),
				function( err, cursor )
				{
					if( err !== undefined && err !== null )
					{
						cb( err );
						
						return;
					}
					
					cursor.toArray(
						getCb(
						this,
						getA( Error ),
						getA( "null/undef", "arr" ),
						function( err, items )
						{
							if( err !== undefined && err !== null )
							{
								cb( err );
								
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
}],

delete:
[
getA(
	ClusterConHandler.COLLECTION_NAME_S,
	MongoConHandler.QUERY_OBJ_S,
	"func"
),
function( collectionName, queryObj, cb )
{
	queryObj = MongoConHandler.prepareQueryObj( queryObj );
	
	if(
		hasT( queryObj, "arr" ) === true &&
		queryObj.length === 0
	)
	{
		cb( undefined );
		
		return;
	}
	
	this.getCurrCon(
		getCb(
		this,
		getA( Error ),
		getA( "undef", Db ),
		function( err, db )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			var coll = new Collection( db, collectionName );
			
			coll.remove(
				queryObj,
				{ safe: true },
				getCb(
				this,
				getA( Error ),
				getA( "null/undef", "any" ),
				function( err, nrObjs )
				{
					if( err !== undefined && err !== null )
					{
						cb( err );
						
						return;
					}
					
					cb( undefined );
				})
			);
		})
	);
}],

update:
[
getA( getV.PROPER_OBJ, "any", "func" ),
function( queryObj, newObj, cb )
{
	this.getCurrCon(
		getCb(
		this,
		getA( Error ),
		getA( "undef", Db ),
		function( err, db )
		{
			if( err !== undefined )
			{
				cb( err );
				
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
				getCb(
				this,
				getA( Error ),
				getA( "null/undef" ),
				function( err )
				{
					ClusterConHandler.restoreSet( restoreInfo );
					
					if( err !== undefined && err !== null )
					{
						cb( err );
						
						return;
					}
					
					cb( undefined );
				})
			);
		})
	);
}]

});

});
