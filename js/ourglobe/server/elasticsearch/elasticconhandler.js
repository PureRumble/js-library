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

Class.addStatic(
ElasticConHandler,
{

PREPARING_HANDLERS:
{
	prepareBinary:
	getF(
	getA( Buffer, ClusterConHandler.CONTENT_TYPE_S ),
	getR( "str" ),
	function( buf )
	{
		return buf.toString( "base64" );
	}),
	
	prepareDate:
	getF(
	getA( Date ),
	getR( "str" ),
	function( date )
	{
// Using ISO string representation to preserve millisecond
// precision in elasticsearch
		return date.toISOString();
	})
},

RESTORING_HANDLERS:
{
	restoreBinary:
	getF(
	getA( "any", "any" ),
	getR( Buffer ),
	function( binaryStr, contentType )
	{
		var returnVar = undefined;
		
		try
		{
			returnVar = new Buffer( binaryStr, "base64" );
		}
		catch( e )
		{
			throw new ClusterDataRuntimeError(
				"A valid binary string in base-64 representation wasnt"+
				"provided when restoring a Binary",
				{ providedVar: binaryStr }
			);
		}
		
		return returnVar;
	}),
	
	restoreDate:
	getF(
	getA( "any" ),
	getR( Date ),
	function( date )
	{
		var returnVar = undefined;
		
		try
		{
			returnVar = new Date( date );
		}
		catch( e )
		{
			returnVar = undefined;
		}
		
		if(
			hasT( date, "str" ) === false ||
			date.length !== 24 ||
			returnVar === undefined ||
			returnVar.toString() === "Invalid Date"
		)
		{
			throw new ClusterDataRuntimeError(
				"A string representing a date in a correct form wasnt "+
				"provided when restoring a Date",
				{ providedVar: date }
			);
		}
		
		return returnVar;
	})
}

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
	
	var finalObjs = [];
	
	for( var prop in objs )
	{
		finalObjs.push(
			{ index:{ _id: objs[ prop ].id.toString() } }
		);
		
		finalObjs.push( objs[ prop ] );
	}
	
	if( finalObjs.length === 0 )
	{
		cb( undefined );
		return;
	}
	
	var restoreInfo =
		ClusterConHandler.prepareSetForCluster(
			objs, ElasticConHandler.PREPARING_HANDLERS
		)
	;
	
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
			ClusterConHandler.restoreSet( restoreInfo );
			
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
			
			ClusterConHandler.restoreSetFromCluster(
				hits, ElasticConHandler.RESTORING_HANDLERS
			);
			
			cb( undefined, hits );
		})
	);
}]

});

});
