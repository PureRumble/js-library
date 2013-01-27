ourglobe.define(
[
	"ourglobe/server/cluster",
	"./elasticsearchconnection"
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

var ElasticConHandler =
Class.create(
{

name: "ElasticConHandler",
extends: ClusterConHandler,
constr:
[
ClusterConHandler.CONSTR_V,
function( clusterName, conParams )
{
	this.ourGlobeCallSuper( undefined, clusterName, conParams );
}]

});

return ElasticConHandler;

},
function( mods, ElasticConHandler )
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

var ClusterDataRuntimeError =
	mods.get( "cluster" ).ClusterDataRuntimeError
;

var Id = mods.get( "cluster" ).Id;
var Binary = mods.get( "cluster" ).Binary;

var ElasticsearchConnection =
	mods.get( "elasticsearchconnection" )
;

var methodS = { values:[ "GET", "PUT", "POST", "DELETE" ] };

var objsS = { props:{ id:{ req: true, types: Id } } };

Class.add(
ElasticConHandler,
{

getBinaryStoreObj:
[
ClusterConHandler.GET_BINARY_STORE_OBJ_V,
function( binary )
{
	return binary.getBuffer().toString( "base64" );
}],

restoreBinary:
[
ClusterConHandler.RESTORE_BINARY_V,
function( binaryStr )
{
	var buf = undefined;
	
	try
	{
		buf = new Buffer( binaryStr, "base64" );
	}
	catch( e )
	{
		throw new ClusterDataRuntimeError(
			"A valid binary string in base-64 representation wasnt"+
			"provided when restoring a Binary",
			{ providedVar: binaryStr }
		);
	}
	
	return new Binary( buf );
}],

getOpenCon:
[
ClusterConHandler.GET_OPEN_CON_V,
function( params, cb )
{
	cb(
		undefined,
		new ElasticsearchConnection( params.host, params.port )
	);
}],

request:
[
getA(
	methodS,
	getV.PROPER_STR,
	{
		types: "obj/undef",
		props:
		{
			params: "obj/undef",
			data:{ types: "obj/arr/undef", extraItems: "+obj" }
		},
		extraProps: false
	},
	"func"
),
getA( methodS, getV.PROPER_STR, "func" ),
function( method, path, opts, cb )
{
	if( hasT( opts, "func" ) === true )
	{
		cb = opts;
		opts = undefined;
	}
	
	this.getCurrCon(
		getCb(
		this,
		getA( Error ),
		getA( "undef", ElasticsearchConnection ),
		function( err, elasticsearchCon )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			elasticsearchCon.request(
				method,
				path,
				opts,
				getCb(
				this,
				getA( Error ),
				getA( "undef", "obj/undef" ),
				function( err, response )
				{
					if( err !== undefined )
					{
						cb( err );
						
						return;
					}
					else
					{
						cb( undefined, response );
					}
				})
			);
		})
	);
}],

insert:
[
getA(
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ objsS, "arr" ], extraItems: objsS },
	"func"
),
function( indexName, objs, cb )
{
	if( hasT( objs, "arr" ) === false )
	{
		objs = [ objs ];
	}
	
	var objsToIns = this.getStoreObj( objs );
	
	var finalObjs = [];
	
	for( var prop in objsToIns )
	{
		finalObjs.push(
			{ index:{ _id: objsToIns[ prop ].id.id } }
		);
		
		finalObjs.push( objsToIns[ prop ] );
	}
	
	if( finalObjs.length === 0 )
	{
		cb( undefined );
		return;
	}
	
	var method = "POST";
	
	var path = "/"+indexName+"/"+indexName+"/_bulk";
	
	var reqOpts = { data: finalObjs };
	
	this.request(
		method,
		path,
		reqOpts,
		getCb(
		this,
		getA( Error ),
		getA( "undef", "any" ),
		function( err, res )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			else
			{
				cb( undefined );
			}
		})
	);
}],

delete:
[
getA(
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ "arr", Id, getV.PROPER_OBJ ], extraItems: Id },
	"func"
),
function( indexName, query, cb )
{
	if( query instanceof Id === true )
	{
		query = [ query ];
	}
	
	var finalQuery = undefined;
	var pathEnding = undefined;
	var method = undefined;
	
	if( hasT( query, "arr" ) === true )
	{
		var finalQuery = [];
		pathEnding = "_bulk";
		method = "POST";
		
		for( var prop in query )
		{
			finalQuery.push(
				{ "delete":{ _id: query[ prop ].toString() } }
			);
		}
		
		if( finalQuery.length === 0 )
		{
			cb( undefined );
			return;
		}
	}
	else
	{
		finalQuery = query;
		pathEnding = "_query";
		method = "DELETE";
	}
	
	var path = "/"+indexName+"/"+indexName+"/"+pathEnding;
	
	this.request(
		method,
		path,
		{ data: finalQuery },
		getCb(
		this,
		getA( Error ),
		getA( "undef", "any" ),
		function( err, res )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			cb( undefined );
		})
	);
}],

query:
[
getA(
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ Id, "arr", getV.PROPER_OBJ ], extraItems: Id },
	"func"
),
function( indexName, query, cb )
{
	if( query instanceof Id === true )
	{
		query = [ query ];
	}
	
	if( hasT( query, "arr" ) === true )
	{
		var idStrs = [];
		
		for( var item in query )
		{
			idStrs.push( query[ item ].toString() );
		}
		
		if( idStrs.length === 0 )
		{
			cb( undefined, [] );
			
			return;
		}
		
		query = { query:{ ids:{ values: idStrs } } };
	}
	
	var method = "GET";
	var path = "/"+indexName+"/"+indexName +"/_search";
	
	var opts = { data: query };
	
	this.request(
		method,
		path,
		opts,
		getCb(
		this,
		getA( Error ),
		getA(
			"undef",
			{
				props:
				{
					hits:
					{
						req: true,
						props:
						{
							hits:
							{
								req: true,
								extraItems:{ props:{ _source: "+obj" } }
							}
						}
					}
				}
			}
		),
		function( err, res )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			var resHits = res.hits.hits;
			var hits = [];
			
			for( var pos in resHits )
			{
				hits[ pos ] = resHits[ pos ]._source;
			}
			
			this.restoreObj( hits );
			
			cb( undefined, hits );
		})
	);
}]

});

});
