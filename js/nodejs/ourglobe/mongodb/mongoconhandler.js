var Db = require("mongodb").Db;
var Server = require("mongodb").Server;
var Collection = require("mongodb").Collection;
var Cursor = require("mongodb").Cursor;
var MongoDbBinary = require("mongodb").Binary;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var ClusterMapper =
	require("ourglobe/clusterconhandler").ClusterMapper
;

var ClusterConHandler =
	require("ourglobe/clusterconhandler").ClusterConHandler
;

var Id = require("ourglobe/clusterconhandler").Id;
var Binary = require("ourglobe/clusterconhandler").Binary;

var _preparingHandlers =
{
	Id:function( id )
	{
		if( conf.doVer() === true )
		{
			var fv =
				new FuncVer( [ Id ], MongoDbBinary ).verArgs( arguments )
			;
		}
		
		var returnVar = new MongoDbBinary( id.getBuffer() );
		
		if( conf.doVer() === true )
		{
			fv.verReturn( returnVar );
		}
		
		return returnVar;
	},
	
	Binary:function( binary )
	{
		if( conf.doVer() === true )
		{
			var fv =
				new FuncVer( [ Binary ], MongoDbBinary )
					.verArgs( arguments )
			;
		}
		
		var returnVar = new MongoDbBinary( binary.getBuffer() );
		
		if( conf.doVer() === true )
		{
			fv.verReturn( returnVar );
		}
		
		return returnVar;
	} 
};

var _restoringHandlers =
{
	Id:function( id )
	{
		if( conf.doVer() === true )
		{
			var fv =
				new FuncVer( [ MongoDbBinary ], Id ).verArgs( arguments )
			;
		}
		
		var returnVar = undefined;
		
		try
		{
			returnVar = new Id( id.read( 0 ) );
		}
		catch( e )
		{
			throw new ClusterDataRuntimeError(
				"'"+idStr+"' isnt a valid Id str", idStr
			);
		}
		
		return returnVar;
	},
	
	Binary:function( content, contentType )
	{
		if( conf.doVer() === true )
		{
			var fv =
				new FuncVer(
					[ MongoDbBinary, Binary.CONTENT_TYPE_S ],
					Binary
				)
					.verArgs( arguments )
			;
		}
		
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
	}
};

function MongoConHandler( clusterName, conParams )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			FuncVer.PROPER_STR_L,
			{
				extraItems:{
					req:true, extraProps:false, props:{
						host:FuncVer.R_PROPER_STR,
						port:FuncVer.R_NON_NEG_INT
					}
				}
			}
		] )
			.verArgs( arguments )
		;
	}
	
	MongoConHandler.super_.call( this, clusterName, conParams );
}
sys.inherits( MongoConHandler, ClusterConHandler );

MongoConHandler.prototype.getOpenCon = function( conParams, cb )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			{
				extraProps:false, props:{
					host:FuncVer.R_PROPER_STR, port:FuncVer.R_NON_NEG_INT
				}
			},
			"func"
		] )
			.verArgs( arguments )
		;
	}
	
	var server = new Server( conParams.host, conParams.port, {} );
	
	var db = new Db(
		MongoDb.getStandardDbName(), server, { strict:true }
	);
	
	db.open( function( err, db )
	{
		if( conf.doVer() === true )
		{
			new FuncVer( [ Error ] )
				.addArgs( [ "null/undef", Db ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		else
		{
			cb( undefined, db );
		}
		
	} );
}

MongoConHandler.prototype.insert = function(
	collectionName, objs, cb
)
{
	if( conf.doVer() === true )
	{
		var objS =
		{
			props:{ id:{ req:true, types:Id }, _id:{ badTypes:"any" } }
		};
		
		new FuncVer( [
			ClusterConHandler.COLLECTION_NAME_S,
			{ types:[ objS, "arr" ], extraItems:objS },
			"func"
		] )
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( objs, "arr" ) === false )
	{
		objs = [ objs ];
	}
	
	if( objs.length === 0 )
	{
		cb( undefined );
		
		return;
	}
	
	this.getCurrCon( function( err, db )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", Db ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		
		var restoreInfo =
			ClusterConHandler.prepareObjsForCluster(
				objs, _preparingHandlers
			)
		;
		
		for( var prop in objs )
		{
			objs[ prop ]._id = objs[ prop ].id[ "::id" ];
		}
		
		var coll = new Collection( db, collectionName );
		
		coll.insert( objs, { safe:true }, function( err, insObjs )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "null/undef", "any" ] )
					.verArgs( arguments )
				;
			}
			
			for( var prop in objs )
			{
				delete objs[ prop ]._id;
			}
			
			ClusterConHandler.restoreObjs( restoreInfo );
			
			if( sys.errorCheck ( err, cb ) === true )
			{
				return;
			}
			
			cb( undefined );
			
		} );
		
	} );
}

MongoConHandler.prototype.query = function(
	collectionName, query, cb
)
{
	if( conf.doVer() === true )
	{
// Performing a query with an empty queryObj would be most odd.
// Therefore queryObj is required to be a proper obj
		new FuncVer( [
			ClusterConHandler.COLLECTION_NAME_S,
			{ types:[ "arr", Id, FuncVer.PROPER_OBJ ], extraItems:Id },
			"func"
		] )
			.verArgs( arguments )
		;
	}
	
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
	
	this.getCurrCon( function( err, db )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", Db ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		
		var coll = new Collection( db, collectionName );
		
		coll.find( query, function( err, cursor )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "null/undef", Cursor ] )
					.verArgs( arguments )
				;
			}
			
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			cursor.toArray( function( err, items )
			{
				if( conf.doVer() === true )
				{
					new FuncVer()
						.addArgs( [ Error ] )
						.addArgs( [
							"null/undef",
							{ extraItems:{ props:{ _id:MongoDbBinary } } }
						] )
						.verArgs( arguments )
					;
				}
				
				if( sys.errorCheck( err, cb ) === true )
				{
					return;
				}
				
				for( var prop in items )
				{
					delete items[ prop ]._id;
				}
				
				ClusterConHandler.restoreObjsFromCluster(
					items, _restoringHandlers
				);
				
				cb( undefined, items );
				
			} );
			
		} );
		
	} );
}

MongoConHandler.prototype.delete = function(
	collectionName, query, cb
)
{
	if( conf.doVer() === true )
	{
		new FuncVer()
			.addArgs( [
				ClusterConHandler.COLLECTION_NAME_S,
				{
					types:[ "arr", Id, FuncVer.PROPER_OBJ ], extraItems:Id
				},
				"func"
			] )
			.verArgs( arguments )
		;
	}
	
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
	
	this.getCurrCon( function( err, db )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", Db ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		
		var coll = new Collection( db, collectionName );
		
		coll.remove( query, { safe:true }, function( err, nrObjs )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "null/undef", "any" ] )
					.verArgs( arguments )
				;
			}
			
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			cb( undefined );
			
		} );
		
	} );
}

MongoConHandler.prototype.update = function(
	queryObj, newObj, cb
)
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			FuncVer.PROPER_OBJ, "obj", "func"
		] )
			.verArgs( arguments )
		;
	}
	
	this.getCurrCon( function( err, db )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", Db ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		
		var restoreInfo =
			ClusterConHandler.prepareObjsForCluster( newObj )
		;
		
		var coll = new Collection( db, collectionName );
		
		coll.update(
			queryObj,
			newObj,
			{ safe:true, multi:true },
			
			function( err )
			{
				if( conf.doVer() === true )
				{
					new FuncVer()
						.addArgs( [ Error ] )
						.addArgs( [ "null/undef" ] )
						.verArgs( arguments )
					;
				}
				
				if( sys.errorCheck( err, cb ) === true )
				{
					return;
				}
				
				cb( undefined );
			}
		);
		
	} );
}

exports.MongoConHandler = MongoConHandler;

var MongoDb = require("./mongodb").MongoDb;
