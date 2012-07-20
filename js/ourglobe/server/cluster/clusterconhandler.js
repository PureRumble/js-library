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
} );

ClusterConHandler.COLLECTION_NAME_S = FuncVer.PROPER_STR_L;

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

// prepareSetForCluster() is used both for inserting and
// updating queries. An updating query can be updating a
// primitive type, a single obj or an entire array. Therefor
// items of objs can be of any type
ClusterConHandler.prepareSetForCluster =
getF(
new FuncVer(
	[
		"obj/arr",
		{
			extraProps: false,
			props: { Id:"+func", Binary:"+func", Date:"func/undef" }
		}
	],
	{
		extraItems:
		{
			extraProps:false,
			props: { set:"+obj/arr", key:"+str", value:"any" }
		}
	}
),
function( set, handlers )
{
	var IdFunc = handlers.Id;
	var BinaryFunc = handlers.Binary;
	var DateFunc = handlers.Date;
	
	var keysToRestore = [];
	
	var stack = [ { init: set }, "init" ];
	
	while( stack.length > 0 )
	{
		var pointingKey = stack.pop();
		var holdingSet = stack.pop();
		
		var currVar = holdingSet[ pointingKey ];
		
		var currVarClass = sys.getClass( currVar );
		
		if(
			currVar === null ||
// Variables set to undefined are to be cleared from the obj as
// part of the preparations of the obj for the cluster
			( currVar !== undefined && currVarClass === undefined )
		)
		{
			continue;
		}
		else if(
			currVarClass === Object || currVarClass === Array
		)
		{
			if(
				currVarClass === Object && "::type" in currVar === true
			)
			{
				continue;
			}
			
			for( var key in currVar )
			{
				stack.push( currVar );
				stack.push( key );
			}
		}
		else if(
			currVarClass === Id ||
			currVarClass === Binary ||
			currVarClass === Date ||
			currVarClass === Link ||
			currVarClass === Cache ||
			currVar === undefined
		)
		{
			keysToRestore[ keysToRestore.length ] =
				{ set: holdingSet, key: pointingKey, value: currVar }
			;
			
			if( currVar === undefined )
			{
				delete holdingSet[ pointingKey ];
			}
			else if( currVarClass === Id )
			{
				holdingSet[ pointingKey ] =
				{
					"::type":"Id",
					"::id":IdFunc( currVar )
				};
			}
			else if( currVarClass === Binary )
			{
				holdingSet[ pointingKey ] =
				{
					"::type":"Binary",
					"::contentType":currVar.getContentType(),
					"::content":BinaryFunc( currVar )
				};
			}
			else if(
				currVarClass === Date && DateFunc !== undefined
			)
			{
				holdingSet[ pointingKey ] =
					{
						"::type":"Date",
						"::date":DateFunc( currVar )
					}
				;
			}
			else if( currVarClass === Link )
			{
				holdingSet[ pointingKey ] =
				{
					"::type":"Link",
					"::collection":currVar.getCollection(),
					"::id":
					{
						"::type":"Id",
						"::id":IdFunc( currVar.getId() )
					}
				};
			}
			else if( currVarClass === Cache )
			{
				var link = currVar.getLink();
				var cache = currVar.getCache();
				
				holdingSet[ pointingKey ] =
				{
					"::type":"Cache",
					"::cache":currVar.getCache(),
					"::link":
					{
						"::type":"Link",
						"::collection":link.getCollection(),
						"::id":{
							"::type":"Id",
							"::id":IdFunc( link.getId() )
						}
					},
					"::refreshedDate":
						DateFunc !== undefined ?
							{
								"::type":"Date",
								"::date":DateFunc(
									currVar.getRefreshedDate()
								)
							} :
							currVar.getRefreshedDate()
				};
				
				stack.push( holdingSet[ pointingKey ] );
				stack.push( "::cache" );
			}
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
// An array's/object's key can be the empty string.
// Undefined variables are cleared as part of preparations for
// the cluster. They must therefore be restored and so "value"
// can be undef
			props:
			{
				set: "+obj/arr",
				key: "+str",
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

ClusterConHandler.restoreSetFromCluster =
getF(
new FuncVer( [
	"obj/arr",
	{
		extraProps: false,
		props:{ Id: "+func", Binary: "+func", Date: "func/undef" }
	}
]),
function( set, handlers )
{
	var IdFunc = handlers.Id;
	var BinaryFunc = handlers.Binary;
	var DateFunc = handlers.Date;
	
	var stack = [ { init: set }, "init" ];
	
	while( stack.length > 0 )
	{
		var pointingKey = stack.pop();
		var holdingSet = stack.pop();
		
		var currVar = holdingSet[ pointingKey ];
		
		var currVarClass = sys.getClass( currVar );
		
		if( currVarClass === undefined )
		{
			continue;
		}
		else if(
			(
				currVarClass === Object &&
				"::type" in currVar === false
			)
			||
			currVarClass === Array
		)
		{
			for( var key in currVar )
			{
				stack.push( currVar );
				stack.push( key );
			}
		}
		else if( currVarClass === Object )
		{
			var typeValue = currVar[ "::type" ];
			
// If ::type equals Date, then DateFunc must be defined in order
// to decode the date. Otherwise something's wrong and the
// throwing of an error is reached
			if( typeValue === "Date" && DateFunc !== undefined )
			{
				holdingSet[ pointingKey ] =
					DateFunc( currVar[ "::date" ] )
				;
			}
			else if( typeValue === "Id" )
			{
				holdingSet[ pointingKey ] =
					IdFunc( currVar[ "::id" ] )
				;
			}
			else if( typeValue === "Link" )
			{
				holdingSet[ pointingKey ] = new Link(
					currVar[ "::collection" ],
					IdFunc( currVar[ "::id" ][ "::id" ] )
				);
			}
			else if( typeValue === "Cache" )
			{
				holdingSet[ pointingKey ] =
				new Cache(
					currVar[ "::cache" ],
					new Link(
						currVar[ "::link" ][ "::collection" ],
						IdFunc( currVar[ "::link" ][ "::id" ][ "::id" ] )
					),
					DateFunc !== undefined ?
						DateFunc(
							currVar[ "::refreshedDate" ][ "::date" ]
						) :
						currVar[ "::refreshedDate" ]
				);
				
				stack.push( holdingSet[ pointingKey ] );
				stack.push( "cacheObj" );
			}
			else if( typeValue === "Binary" )
			{
				holdingSet[ pointingKey ] = BinaryFunc(
					currVar[ "::content" ], currVar[ "::contentType" ]
				);
			}
			else
			{
				throw new ClusterDataRuntimeError(
					"An obj that is to be restored contains an obj "+
					"with the system prop '::type' set to an incorrect "+
					"value",
					{
						objectPos: objsPos,
						object: objs[ objsPos ],
						incorrectValue: typeValue
					},
					undefined,
					ClusterConHandler.restoreSetFromCluster
				);
			}
		}
		else if( currVarClass !== Date || DateFunc !== undefined )
		{
			throw new ClusterDataRuntimeError(
				"An object that is to be restored from the cluster "+
				"contains an instance of a class that isnt allowed",
				{
					objectPos: objsPos,
					object: objs[ objsPos ],
					invalidClass: currVarClass.name
				},
				undefined,
				ClusterConHandler.restoreSetFromCluster
			);
		}
	}
});

});
