ourglobe.define(
[
	"ourglobe/lib/server/mongodb",
	"ourglobe/server/store",
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

var StoreConHandler = mods.get( "store" ).StoreConHandler;
var Id = mods.get( "store" ).Id;

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
extends: StoreConHandler,
constr:
[
function()
{
	return StoreConHandler.CONSTR_V;
},
function( storeName, conParams )
{
	this.ourGlobeCallSuper( undefined, storeName, conParams );
}]

});

var nativeQueryObjS = getV.PROPER_OBJ;

Class.addStatic(
MongoConHandler,
{

NATIVE_QUERY_OBJ_S: nativeQueryObjS,

QUERY_OBJ_S:
	{ types:[ "arr", Id, nativeQueryObjS ], extraItems: Id },

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

var Store = mods.get( "store" ).Store;
var StoreConHandler = mods.get( "store" ).StoreConHandler;

var Id = mods.get( "store" ).Id;
var Binary = mods.get( "store" ).Binary;

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

getDateStoreObj:
[
StoreConHandler.GET_DATE_STORE_OBJ_V,
function( date )
{
	return date;
}],

restoreDate:
[
StoreConHandler.RESTORE_DATE_V,
function( date )
{
	return date;
}],

getBinaryStoreObj:
[
StoreConHandler.GET_BINARY_STORE_OBJ_V,
function( binary )
{
	return new MongoDbBinary( binary.getBuffer() );
}], 

restoreBinary:
[
StoreConHandler.RESTORE_BINARY_V,
function( mongoDbBinary )
{
	if( mongoDbBinary instanceof MongoDbBinary === false )
	{
		throw new StoreDataRuntimeError(
			"A MongoDbBinary from the store hasnt been provided "+
			"as expected for restoring the Binary",
			{ providedVar:mongoDbBinary }
		);
	}
	
	var buf = undefined
	
	try
	{
		buf = mongoDbBinary.read( 0 );
	}
	catch( e )
	{
		throw new StoreDataRuntimeError(
			"An error occurred while converting the MongoDbBinary "+
			"to a Buffer",
			{ mongoDbBinary: mongoDbBinary, err: e }
		);
	}
	
	return new Binary( buf );
}],

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
StoreConHandler.GET_OPEN_CON_V,
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
	Store.COLLECTION_NAME_S,
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
			
			objsToIns = this.getStoreObj( objs );
			
			for( var item in objsToIns )
			{
				objsToIns[ item ]._id = objsToIns[ item ].id.id;
			}
			
			var coll = new Collection( db, collectionName );
			
			coll.insert(
				objsToIns,
				{ safe:true },
				getCb(
				this,
				getA( Error ),
				getA( "null/undef", "any" ),
				function( err, insObjs )
				{
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
	Store.COLLECTION_NAME_S, MongoConHandler.QUERY_OBJ_S, "func"
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
							
							this.restoreObj( items );
							
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
	Store.COLLECTION_NAME_S, MongoConHandler.QUERY_OBJ_S, "func"
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
			
			var objsToIns = this.getStoreObj( newObj );
			
			var coll = new Collection( db, collectionName );
			
			coll.update(
				queryObj,
				objsToIns,
				{ safe: true, multi: true },
				getCb(
				this,
				getA( Error ),
				getA( "null/undef" ),
				function( err )
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
}]

});

});
