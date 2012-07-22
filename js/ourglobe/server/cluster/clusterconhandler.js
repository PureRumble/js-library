ourglobe.define(
[
	"ourglobe/dual/moremath",
	"./clusterdataruntimeerror",
	"./id",
	"./binary",
	"./link",
	"./cache"
],
function( mods )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var ClusterConHandler =
getF(
new FuncVer( [
	FuncVer.R_PROPER_STR_L,
	{
		extraItems:
		{
			req: true,
			extraProps: true,
			props:
				{ host:FuncVer.R_PROPER_STR, port:FuncVer.R_NON_NEG_INT }
		}
	}
] ),
function ClusterConHandler( clusterName, conParams )
{
	this.clusterName = clusterName;
	this.conHolders = [];
	
	for( var pos in conParams )
	{
		var currConHolder = {};
		currConHolder.params = conParams[pos];
		currConHolder.con = undefined;
		
		this.conHolders[pos] = currConHolder;
	}
	
	this.randCurrCon();
});

ClusterConHandler.COLLECTION_NAME_S = FuncVer.PROPER_STR_L;
ClusterConHandler.OUR_GLOBE_SYS_KEY = "ourGlobeSysSet";
ClusterConHandler.OUR_GLOBE_SYS_VALUE =
	"={F|6yOA&,3J)d,{b+$~7q__=W&>{Z7]*5;J^1'730O3#3l1814_D13{S7hL"
;

return ClusterConHandler;

},
function( mods, ClusterConHandler )
{

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var MoreMath = mods.get( "moremath" ).MoreMath;

var ClusterDataRuntimeError =
	mods.get( "clusterdataruntimeerror" )
;
var Id = mods.get( "id");
var Binary = mods.get( "binary" );
var Link = mods.get( "link" );
var Cache = mods.get( "cache" );

ClusterConHandler.prototype.getCurrCon =
getF(
new FuncVer( [ "func" ] ),
function( cb )
{
	var conHolder = this.conHolders[ this.currCon ];
	
	if( conHolder.con !== undefined )
	{
		cb( undefined, conHolder.con );
		
		return;
	}
	
	this.getOpenCon(
	conHolder.params,
	getF(
		new FuncVer()
			.addArgs( [ Error ] )
			.addArgs( [ "undef", "inst" ] ),
		function( err, con )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			else
			{
				conHolder.con = con;
				
				cb( undefined, con );
			}
		}
	));
});

ClusterConHandler.prototype.randCurrCon =
getF(
new FuncVer(),
function()
{
	var nrConHolders = this.conHolders.length;
	
	this.currCon = MoreMath.getRandInt( nrConHolders );
});

ClusterConHandler.ID_STR_S = Id.ID_STR_S;
ClusterConHandler.CONTENT_TYPE_S = Binary.CONTENT_TYPE_S;

ClusterConHandler.prepareId =
getF(
new FuncVer( [ ClusterConHandler.ID_STR_S ] ).setReturn( "str" ),
function( idStr )
{
	return idStr;
});

// This func is to be used as a convenience in
// restoreSetFromCluster() only if  the caller hasnt provided a
// restoreId() func. It therefor doesnt have to perform rigorous
// validation of what has been found in the cluster as this is
// later done by restoreSetFromCluster()
ClusterConHandler.restoreId =
getF(
new FuncVer( [ "any" ] ).setReturn( "any" ),
function( idStr )
{
	return idStr;
});

ClusterConHandler.prepareDate =
getF(
new FuncVer( [ Date ] ).setReturn( Date ),
function( date )
{
	return date;
});

// This func is to be used as a convenience in
// restoreSetFromCluster() only if  the caller hasnt provided a
// restoreDate() func. It therefor doesnt have to perform
// rigorous validation of what has been found in the cluster as
// this is later done by restoreSetFromCluster()
ClusterConHandler.restoreDate =
getF(
new FuncVer( [ "any" ] ).setReturn( "any" ),
function( date )
{
	return date;
});

ClusterConHandler.prepareSetForCluster =
getF(
new FuncVer(
	[
		"obj/arr",
		{
			extraProps: false,
			props:
			{
				prepareId: "func/undef",
				prepareBinary: "+func",
				prepareDate: "func/undef"
			}
		}
	]
)
	.setReturn( {
		extraItems:
		{
			extraProps: false,
			props: { set: "+obj/arr", key: "+str", value: "any" }
		}
	}),
function( set, handlers )
{
	var prepareId = handlers.prepareId;
	var prepareDate = handlers.prepareDate;
	var prepareBinary = handlers.prepareBinary;
	
	if( prepareId === undefined )
	{
		prepareId = ClusterConHandler.prepareId;
	}
	
	if( prepareDate === undefined )
	{
		prepareDate = ClusterConHandler.prepareDate;
	}
	
	var keysToRestore = [];
	
	var stack = [ { init: set }, "init" ];
	
	while( stack.length > 0 )
	{
		var pointingKey = stack.pop();
		var holdingSet = stack.pop();
		
		var currVar = holdingSet[ pointingKey ];
		
		if(
			sys.hasType(
				currVar, "null", "bool", "number", "str"
			) === true
		)
		{
			continue;
		}
		else if( sys.hasType( currVar, "obj", "arr" ) === true )
		{
// Has the current set already been prepared?
			if(
				currVar[ ClusterConHandler.OUR_GLOBE_SYS_KEY ] ===
					ClusterConHandler.OUR_GLOBE_SYS_VALUE
			)
			{
				if( sys.hasType( currVar, "arr" ) === true )
				{
					throw new ClusterDataRuntimeError(
						"An arr (in the set that is to be prepared) has a "+
						"system key value but this is not valid for an arr",
						{ preparingSet: set, arr: currVar },
						undefined,
						ClusterConHandler.prepareSetFromCluster
					);
				}
				
				continue;
			}
			
			for( var key in currVar )
			{
				stack.push( currVar );
				stack.push( key );
			}
		}
		else if(
			currVar instanceof Id === true ||
			currVar instanceof Binary === true ||
			currVar instanceof Link === true ||
			currVar instanceof Cache === true ||
			currVar instanceof Date === true ||
			currVar === undefined
		)
		{
			keysToRestore.push(
				{ set: holdingSet, key: pointingKey, value: currVar }
			);
			
			if( currVar === undefined )
			{
				delete holdingSet[ pointingKey ];
				
				continue;
			}
			
			if( currVar instanceof Id === true )
			{
				holdingSet[ pointingKey ] =
				{
					type: "Id",
					id: prepareId( currVar.toString() )
				};
			}
			else if( currVar instanceof Binary === true )
			{
				var contentType = currVar.getContentType();
				var buf = currVar.getBuffer();
				
				holdingSet[ pointingKey ] =
				{
					type: "Binary",
					contentType: contentType,
					binary: prepareBinary( buf, contentType )
				};
			}
			else if( currVar instanceof Date === true )
			{
				holdingSet[ pointingKey ] =
					{
						type: "Date", date: prepareDate( currVar )
					}
				;
			}
			else if( currVar instanceof Link === true )
			{
				holdingSet[ pointingKey ] =
				{
					type: "Link",
					collection: currVar.getCollection(),
					id: prepareId( currVar.getId().toString() )
				};
			}
			else if( currVar instanceof Cache === true )
			{
				var link = currVar.getLink();
				var cache = currVar.getCache();
				var refreshedDate = currVar.getRefreshedDate();
				
				holdingSet[ pointingKey ] =
				{
					type: "Cache",
					cache: currVar.getCache(),
					refreshedDate: prepareDate( refreshedDate ),
					collection: link.getCollection(),
					id: prepareId( link.getId().toString() )
				};
				
				stack.push( holdingSet[ pointingKey ] );
				stack.push( "cache" );
			}
			
			var currObj = holdingSet[ pointingKey ];
			
			currObj[ ClusterConHandler.OUR_GLOBE_SYS_KEY ] =
				ClusterConHandler.OUR_GLOBE_SYS_VALUE
			;
		}
		else
		{
			throw new ClusterDataRuntimeError(
				"The set that is to be prepared for the cluster "+
				"contains an instance of a class that isnt allowed",
				{ invalidClass: currVarClass.name },
				undefined,
				ClusterConHandler.prepareSetForCluster
			);
		}
	}
	
	return keysToRestore;
});

ClusterConHandler.restoreSet =
getF(
new FuncVer( [
	{
		extraItems:
		{
			extraProps: false,
			props:
			{
				set: "+obj/arr",
// It is possible for a set's key to be the empty string
				key: "+str",
// Undefined variables are cleared as part of preparations for
// the cluster. They must therefor be restored and so "value"
// can be undef
				value:
				{
					req: true,
					types:[ Date, Id, Link, Binary, Cache, "undef" ]
				}
			}
		}
	}
]),
function( keysToRestore )
{
	for( var pos = 0; pos < keysToRestore.length; pos++ )
	{
		var currKey = keysToRestore[ pos ];
		currKey.set[ currKey.key ] = currKey.value;
	}
});

ClusterConHandler.throwRestoreErr =
getF(
new FuncVer( [ Error, "obj/arr", "obj" ] ),
function( err, restoringSet, systemObj )
{
	if( err instanceof ClusterDataRuntimeError === true )
	{
		var ourGlobeVar = err.ourGlobeVar;
		
		if( ourGlobeVar === undefined )
		{
			ourGlobeVar = {};
		}
		
		ourGlobeVar.restoringSet = restoringSet;
		ourGlobeVar.systemObj = systemObj;
		
		err =
			new ClusterDataRuntimeError(
				"An error occurred while restoring a system obj in the "+
				"set from the cluster: "+err.message,
				ourGlobeVar,
				undefined,
				ClusterConHandler.restoreSetFromCluster
			)
		;
	}
	
	throw err;
});

ClusterConHandler.restoreSetFromCluster =
getF(
new FuncVer( [
	"obj/arr",
	{
		extraProps: false,
		props:
		{
			restoreId: "func/undef",
			restoreBinary: "+func",
			restoreDate: "func/undef"
		}
	}
]),
function( set, handlers )
{
	var restoreId = handlers.restoreId;
	var restoreBinary = handlers.restoreBinary;
	var restoreDate = handlers.restoreDate;
	
	if( restoreId === undefined )
	{
		restoreId = ClusterConHandler.restoreId;
	}
	
	if( restoreDate === undefined )
	{
		restoreDate = ClusterConHandler.restoreDate;
	}
	
	var stack = [ { init: set }, "init" ];
	
	while( stack.length > 0 )
	{
		var pointingKey = stack.pop();
		var holdingSet = stack.pop();
		
		var currVar = holdingSet[ pointingKey ];
		
		if(
			sys.hasType(
				currVar, "null", "bool", "number", "str"
			) === true
		)
		{
			continue;
		}
		else if(
			sys.hasType( currVar, "obj", "arr" ) === true &&
			currVar[ ClusterConHandler.OUR_GLOBE_SYS_KEY ] !==
				ClusterConHandler.OUR_GLOBE_SYS_VALUE
		)
		{
			for( var key in currVar )
			{
				stack.push( currVar );
				stack.push( key );
			}
		}
		else if( sys.hasType( currVar, "obj" ) === true )
		{
			var typeValue = currVar[ "type" ];
			
			if( typeValue === "Date" )
			{
				var date = undefined;
				try
				{
					date = restoreDate( currVar[ "date" ] );
				}
				catch( e )
				{
					ClusterConHandler.throwRestoreErr( e, set, currVar );
				}
				
				holdingSet[ pointingKey ] = date;
			}
			else if( typeValue === "Id" )
			{
				var idStr = undefined;
				try
				{
					idStr = restoreId( currVar[ "id" ] );
				}
				catch( e )
				{
					ClusterConHandler.throwRestoreErr( e, set, currVar );
				}
				
				if( Id.verClusterVars( idStr ) === false )
				{
					throw new ClusterDataRuntimeError(
						"A system obj (in the set that is to be restored) "+
						"represents an Id but the id str is invalid",
						{ restoringSet: set, systemObj: currVar },
						undefined,
						ClusterConHandler.restoreSetFromCluster
					);
				}
				
				holdingSet[ pointingKey ] = new Id( idStr );
			}
			else if( typeValue === "Link" )
			{
				var idStr = undefined;
				try
				{
					idStr = restoreId( currVar[ "id" ] );
				}
				catch( e )
				{
					ClusterConHandler.throwRestoreErr( e, set, currVar );
				}
				
				var collection = currVar[ "collection" ];
				
				if(
					Id.verClusterVars( idStr ) === false ||
					Link.verClusterVars( collection ) === false
				)
				{
					throw new ClusterDataRuntimeError(
						"A system obj (in the set that is to be restored) "+
						"represents a Link but its props have invalid "+
						"values",
						{ restoringSet: set, systemObj: currVar },
						undefined,
						ClusterConHandler.restoreSetFromCluster
					);
				}
				
				holdingSet[ pointingKey ] =
					new Link( collection, new Id( idStr ) )
				;
			}
			else if( typeValue === "Cache" )
			{
				var idStr = undefined;
				try
				{
					idStr = restoreId( currVar[ "id" ] );
				}
				catch( e )
				{
					ClusterConHandler.throwRestoreErr( e, set, currVar );
				}
				
				var refreshedDate = undefined;
				try
				{
					refreshedDate =
						restoreDate( currVar[ "refreshedDate" ] )
					;
				}
				catch( e )
				{
					ClusterConHandler.throwRestoreErr( e, set, currVar );
				}
				
				var cacheVar = currVar[ "cache" ];
				var collection = currVar[ "collection" ];
				
				if(
					Id.verClusterVars( idStr ) === false ||
					Link.verClusterVars( collection ) === false ||
					Cache.verClusterVars( cacheVar, refreshedDate ) ===
						false
				)
				{
					throw new ClusterDataRuntimeError(
						"A system obj (in the set that is to be restored) "+
						"represents a Cache but its props have invalid "+
						"values",
						{ restoringSet: set, systemObj: currVar },
						undefined,
						ClusterConHandler.restoreSetFromCluster
					);
				}
				
				holdingSet[ pointingKey ] =
					new Cache(
						cacheVar,
						new Link( collection, new Id( idStr ) ),
						refreshedDate
					)
				;
				
				stack.push( holdingSet[ pointingKey ] );
				stack.push( "cacheVar" );
			}
			else if( typeValue === "Binary" )
			{
				var contentType = currVar[ "contentType" ];
				var buf = undefined;
				
				var err = false;
				
				if( Binary.verClusterVars( contentType ) === false )
				{
					err = true;
				}
				else
				{
					try
					{
						buf =
							restoreBinary(
								currVar[ "binary" ], contentType
							)
						;
					}
					catch( e )
					{
						ClusterConHandler.throwRestoreErr( e, set, currVar );
					}
					
					if(
						Binary.verClusterVars( buf, contentType ) === false
					)
					{
						err = true;
					}
				}
				
				if( err === true )
				{
					throw new ClusterDataRuntimeError(
						"A system obj (in the set that is to be restored) "+
						"represents a Binary but its props have invalid "+
						"values",
						{ restoringSet: set, systemObj: currVar },
						undefined,
						ClusterConHandler.restoreSetFromCluster
					);
				}
				
				holdingSet[ pointingKey ] =
					new Binary( buf, contentType )
				;
			}
			else
			{
				throw new ClusterDataRuntimeError(
					"A system obj (in the set that is to be restored) "+
					"has the prop 'type' set to an invalid value",
					{
						restoringSet: set,
						systemObj: currVar,
						invalidValue: typeValue
					},
					undefined,
					ClusterConHandler.restoreSetFromCluster
				);
			}
		}
		else
		{
			throw new ClusterDataRuntimeError(
				"A set (in the bigger set that is to be restored) "+
				"contains an invalid value",
				{
					restoringSet: set,
					invalidSet: holdingSet,
					invalidValue: currVar,
					keyToValue: pointingKey,
				},
				undefined,
				ClusterConHandler.restoreSetFromCluster
			);
		}
	}
});

});
