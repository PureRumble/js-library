var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var MoreMath = require("ourglobe/utils").MoreMath;
var MoreObject = require("ourglobe/utils").MoreObject;

function ClusterConHandler( clusterName, conParams )
{
	if( conf.doVer() === true )
	{
		new FuncVer(
			[
				FuncVer.R_PROPER_STR_L,
				{ extraItems:{
					req:true, extraProps:true, props:{
						host:FuncVer.R_PROPER_STR, port:FuncVer.R_NON_NEG_INT
					}
				} }
			]
		)
			.verArgs( arguments )
		;
	}
	
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
}

ClusterConHandler.COLLECTION_NAME_S = FuncVer.PROPER_STR_L;

ClusterConHandler.prototype.getCurrCon = function( cb )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ "func" ] ).verArgs( arguments );
	}
	
	var conHolder = this.conHolders[ this.currCon ];
	
	if( conHolder.con !== undefined )
	{
		cb( undefined, conHolder.con );
		
		return;
	}
	
	this.getOpenCon( conHolder.params, function( err, con )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", "obj" ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		else
		{
			conHolder.con = con;
			
			cb( undefined, con );
		}
	});
}

ClusterConHandler.prototype.randCurrCon = function()
{
	if( conf.doVer() === true )
	{
		new FuncVer().verArgs( arguments );
	}
	
	var nrConHolders = this.conHolders.length;
	
	this.currCon = MoreMath.randInt( nrConHolders );
}

ClusterConHandler.prepareObjsForCluster = function(
	objs, handlers
)
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer(
			[
				{ types:"obj/arr", extraItems:"obj" },
				{
					extraProps:false, props:{
						Id:"+func", Binary:"+func", Date:"func/undef"
					}
				}
			],
			{
				extraItems:{
					extraProps:false, props:{
						set:"+obj/arr", key:"+str", value:"any"
					}
				}
			}
		)
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( objs, "arr" ) === false ) { objs = [ objs ]; }
	
	var IdFunc = handlers.Id;
	var BinaryFunc = handlers.Binary;
	var DateFunc = handlers.Date;
	
	var keysToRestore = [];

// Objects that are to be prepared for the cluster (objs[X])
// can be of _any_ type, ranging from objs or arrs,
// Id/Binary/Link/etc objs or simply primitive types such as
// int/str/bool/etc

	for( var objsPos in objs )
	{
		var stack = [ objs, objsPos ];
		var stackPos = 2;
		
		while( stackPos > 0 )
		{
			var holdingSet = stack[ stackPos-2 ];
			var pointingKey = stack[ stackPos-1 ];
			stackPos -= 2;
			
			var currVar = holdingSet[ pointingKey ];
			
			var currVarClass = MoreObject.getClass( currVar );
			
			if(
				currVar === null ||
// Variables set to undefined are to be cleared from the obj as
// part of the preparations of the obj for the cluster
				(
					currVar !== undefined && currVarClass === undefined
				)
			)
			{
				continue;
			}
			else if(
				currVarClass === Object || currVarClass === Array
			)
			{
				if(
					currVarClass === Object &&
					"::type" in currVar === true
				)
				{
					continue;
				}
				
				for( var key in currVar )
				{
					stack[ stackPos++ ] = currVar;
					stack[ stackPos++ ] = key;
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
					{ set:holdingSet, key:pointingKey, value:currVar }
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
					
					stack[ stackPos++ ] = holdingSet[ pointingKey ];
					stack[ stackPos++ ] = "::cache";
				}
			}
			else
			{
				throw new ClusterDataRuntimeError(
					"The following obj on pos "+objsPos+" that is to "+
					"be prepared for the  cluster has an obj of class "+
					currVarClass.name+" which isnt allowed: "+
					MoreObject.getPrettyStr( objs[ objsPos ] ),
					objs[ objsPos ],
					ClusterConHandler.prepareObjsForCluster
				);
			}
		}
	}
	
	var returnVar = keysToRestore;
	
	if( conf.doVer() === true ) { fv.verReturn( returnVar ); }
	
	return returnVar;
}

ClusterConHandler.restoreObjs = function( keysToRestore )
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer(
			[
				{
					extraItems:{
						extraProps:false, props:{
// An array's/object's key can be the empty string
// Undefined variables are cleared as part of preparations for
// the cluster. They must therefore be restored and so "value"
// can be undef
							set:"+obj/arr", key:"+str", value:"+obj/undef"
						}
					}
				}
			]
		)
			.verArgs( arguments )
		;
	}
	
	for( var pos = 0; pos < keysToRestore.length; pos++ )
	{
		var currKey = keysToRestore[ pos ];
		currKey.set[ currKey.key ] = currKey.value;
	}
}

ClusterConHandler.restoreObjsFromCluster = function(
	objs, handlers
)
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			{ types:"obj/arr", extraItems:"obj" },
			{
				extraProps:false, props:{
					Id:"+func", Binary:"+func", Date:"func/undef"
				}
			}
		] )
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( objs, "arr" ) === false ) { objs = [ objs ]; }
	
	var IdFunc = handlers.Id;
	var BinaryFunc = handlers.Binary;
	var DateFunc = handlers.Date;
	
// Objects from the cluster that are to be restored (objs[X])
// can be of _any_ type, ranging from objs or arrs,
// Id/Binary/Link/etc objs or simply primitive types such as
// int/str/bool/etc
	
	for( var objsPos in objs )
	{
		var stack = [ objs, objsPos ];
		var stackPos = 2;
		
		while( stackPos > 0 )
		{
			var holdingSet = stack[ stackPos-2 ];
			var pointingKey = stack[ stackPos-1 ];
			stackPos -= 2;
			
			var currVar = holdingSet[ pointingKey ];
			
			var currVarClass = MoreObject.getClass( currVar );
			
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
					stack[ stackPos++ ] = currVar;
					stack[ stackPos++ ] = key;
				}
			}
			else if( currVarClass === Object )
			{
				var typeValue = currVar[ "::type" ];
				
// NOTE!
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
					holdingSet[ pointingKey ] = new Cache(
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
					
					stack[ stackPos++ ] = holdingSet[ pointingKey ];
					stack[ stackPos++ ] = "cacheObj";
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
						"The following obj on pos "+objsPos+" that is to "+
						"be restored contains an obj with the system "+
						"prop '::type' that is set to the incorrect "+
						"value '"+typeValue+"': "+
						MoreObject.getPrettyStr( objs[ objsPos ] ),
						objs[ objsPos ],
						ClusterConHandler.restoreObjsFromCluster
					);
				}
			}
			else if(
				currVarClass !== Date || DateFunc !== undefined
			)
			{
				throw new ClusterDataRuntimeError(
					"The following obj on pos "+objsPos+" that is to "+
					"be restored from the cluster has an obj of class "+
					currVarClass.name+" which isnt allowed: "+
					MoreObject.getPrettyStr( objs[ objsPos ] ),
					objs[ objsPos ],
					ClusterConHandler.restoreObjsFromCluster
				);
			}
		}
	}
}

exports.ClusterConHandler = ClusterConHandler;

var ClusterDataRuntimeError =
	require("./errors").ClusterDataRuntimeError
;

var Id = require("./id").Id;
var Binary = require("./binary").Binary;
var Link = require("./link").Link;
var Cache = require("./cache").Cache;
