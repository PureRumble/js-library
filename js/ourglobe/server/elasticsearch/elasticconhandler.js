ourglobe.define(
[
	"ourglobe/server/cluster",
	"./elasticsearchconnection"
],
function( mods )
{

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;

var ElasticConHandler =
getF(
ClusterConHandler.CONSTR_FV,
function( clusterName, conParams )
{
	ElasticConHandler.ourGlobeSuper.call(
		this, clusterName, conParams
	);
});
sys.extend( ElasticConHandler, ClusterConHandler );

return ElasticConHandler;

},
function( mods, ElasticConHandler )
{

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;

var ClusterDataRuntimeError =
	mods.get( "cluster" ).ClusterDataRuntimeError
;

var Id = mods.get( "cluster" ).Id;
var Binary = mods.get( "cluster" ).Binary;

var ElasticsearchConnection =
	mods.get( "elasticsearchconnection" )
;

ElasticConHandler.PREPARING_HANDLERS =
{
	prepareBinary:
	getF(
	new FuncVer( [ Buffer, ClusterConHandler.CONTENT_TYPE_S ] )
		.setReturn( "str" ),
	function( buf )
	{
		return buf.toString( "base64" );
	}),
	
	prepareDate:
	getF(
	new FuncVer( [ Date ] ).setReturn( "str" ),
	function( date )
	{
// Using ISO string representation to preserve millisecond
// precision in elasticsearch
		return date.toISOString();
	})
};

ElasticConHandler.RESTORING_HANDLERS =
{
	restoreBinary:
	getF(
	new FuncVer( [ "any", "any" ] ).setReturn( Buffer ),
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
	new FuncVer( [ "any" ] ).setReturn( Date ),
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
			sys.hasType( date, "str" ) === false ||
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
};

ElasticConHandler.prototype.getOpenCon =
getF(
ClusterConHandler.GET_OPEN_CON_FV,
function( params, cb )
{
	cb(
		undefined,
		new ElasticsearchConnection( params.host, params.port )
	);
});

var methodS = { values:[ "GET", "PUT", "POST", "DELETE" ] };

var optsS =
{
	types: "obj/undef",
	props:
	{
		params: "obj/undef",
		data:{ types: "obj/arr/undef", extraItems: "+obj" }
	},
	extraProps: false
};

ElasticConHandler.prototype.request =
getF(
new FuncVer()
	.addArgs( [ methodS, FuncVer.PROPER_STR, optsS, "func" ] )
	.addArgs( [ methodS, FuncVer.PROPER_STR, "func" ] ),
function( method, path, opts, cb )
{
	if( sys.hasType( opts, "func" ) === true )
	{
		cb = opts;
		opts = undefined;
	}
	
	this.getCurrCon(
		getF(
		new FuncVer( [ Error ] )
			.addArgs( [ "undef", ElasticsearchConnection ] ),
		function( err, elasticsearchCon )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			elasticsearchCon.request(
				method,
				path,
				opts,
				getF(
				new FuncVer( [ Error ] )
					.addArgs( [ "undef", "obj/undef" ] ),
				function( err, response )
				{
					if( sys.errorCheck( err, cb ) === true )
					{
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
});

var objsS = { props:{ id:{ req: true, types: Id } } };

ElasticConHandler.prototype.insert =
getF(
new FuncVer( [
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ objsS, "arr" ], extraItems: objsS },
	"func"
]),
function( indexName, objs, cb )
{
	if( sys.hasType( objs, "arr" ) === false )
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
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "undef", "any" ] ),
		function( err, res )
		{
			ClusterConHandler.restoreSet( restoreInfo );
			
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			else
			{
				cb( undefined );
			}
		})
	);
});

ElasticConHandler.prototype.delete =
getF(
new FuncVer( [
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ "arr", Id, FuncVer.PROPER_OBJ ], extraItems: Id },
	"func"
]),
function( indexName, query, cb )
{
	if( query instanceof Id === true )
	{
		query = [ query ];
	}
	
	var finalQuery = undefined;
	var pathEnding = undefined;
	var method = undefined;
	
	if( sys.hasType( query, "arr" ) === true )
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
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "undef", "any" ] ),
		function( err, res )
		{
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			
			cb( undefined );
		})
	);
});

ElasticConHandler.prototype.query =
getF(
new FuncVer( [
	ClusterConHandler.COLLECTION_NAME_S,
	{ types:[ Id, "arr", FuncVer.PROPER_OBJ ], extraItems: Id },
	"func"
]),
function( indexName, query, cb )
{
	if( query instanceof Id === true )
	{
		query = [ query ];
	}
	
	if( sys.hasType( query, "arr" ) === true )
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
		getF(
		new FuncVer( [ Error ] )
			.addArgs( [
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
			]),
		function( err, res )
		{
			
			if( sys.errorCheck( err, cb ) === true )
			{
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
});

});
