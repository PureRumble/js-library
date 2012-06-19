var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var ClusterConHandler =
	require("ourglobe/clusterconhandler").ClusterConHandler
;

var ClusterDataRuntimeError =
	require("ourglobe/clusterconhandler").ClusterDataRuntimeError
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
				new FuncVer( [ Id ], Id.ID_STR_S ).verArgs( arguments )
			;
		}
		
		var returnVar = id.toString();
		
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
				new FuncVer( [ Binary ], "str" ).verArgs( arguments )
			;
		}
		
		var returnVar = binary.getBuffer().toString( "base64" );
		
		if( conf.doVer() === true )
		{
			fv.verReturn( returnVar );
		}
		
		return returnVar;
	},
	
	Date:function( date )
	{
		if( conf.doVer() === true )
		{
			new FuncVer( [ Date ], FuncVer.PROPER_STR )
				.verArgs( arguments )
			;
		}
		
// Using ISO string representation to preserve millisecond
// precision in elasticsearch
		
		return date.toISOString();
	} 
};

var _restoringHandlers =
{
	Id:function( idStr )
	{
		if( conf.doVer() === true )
		{
			var fv =
				new FuncVer( [ "any" ], Id ).verArgs( arguments )
			;
		}
		
		var returnVar = undefined;
		
		try
		{
			returnVar = new Id( idStr );
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
				new FuncVer( [ "str", Binary.CONTENT_TYPE_S ], Binary )
					.verArgs( arguments )
			;
		}
		
		var returnVar = undefined;
		
		try
		{
			returnVar = new Binary(
				new Buffer( content, "base64" ), contentType
			);
		}
		catch( e )
		{
			throw new ClusterDataRuntimeError(
				"Valid content or content type hasnt been provided",
				{ content:content, contentType:contentType }
			);
		}
		
		return returnVar;
	},
	
	Date:function( date )
	{
		if( conf.doVer() === true )
		{
			new FuncVer( [ "any" ], Date ).verArgs( arguments );
		}
		
		var returnVar = new Date( date );
		
		if( returnVar.toString() === "Invalid Date" )
		{
			throw new ClusterDataRuntimeError(
				"'"+date+"' isnt a valid date", date
			);
		}
		
		return returnVar;
	}
};

function ElasticsearchConHandler( clusterName, conParams )
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
	
	ElasticsearchConHandler.super_.call(
		this, clusterName, conParams
	);
}
sys.inherits( ElasticsearchConHandler, ClusterConHandler );

ElasticsearchConHandler.prototype.getOpenCon = function(
	params, cb
)
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
	
	cb( undefined, new EsCon( params.host, params.port ) );
}

ElasticsearchConHandler.prototype.request = function(
	method, path, opts, cb
)
{
	if( conf.doVer() === true )
	{
		var methodS = { values:[ "GET", "PUT", "POST", "DELETE" ] };
		
		var optsS = {
			types:"obj/undef",
			props:{
				params:"obj/undef",
				data:{ types:"obj/arr/undef", extraItems:"+obj" }
			},
			extraProps: false
		};
		
		new FuncVer()
			.addArgs( [ methodS, FuncVer.PROPER_STR, optsS, "func" ] )
			.addArgs( [ methodS, FuncVer.PROPER_STR, "func" ] )
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( opts, "func" ) === true )
	{
		cb = opts;
		opts = undefined;
	}
	
	this.getCurrCon( function( err, esCon )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", EsCon ] )
				.verArgs( arguments )
			;
		}
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		
		esCon.request( method, path, opts, function( err, response )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "undef", "obj/undef" ] )
					.verArgs( arguments )
				;
			}
			
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			else
			{
				cb( undefined, response );
			}
		} );
	} );
}

ElasticsearchConHandler.prototype.insert = function(
	indexName, objs, cb
)
{
	if( conf.doVer() === true )
	{
		var objsS = { props:{ id:{ req:true, types:Id } } };
		
		new FuncVer()
			.addArgs( [
				ClusterConHandler.COLLECTION_NAME_S,
				{ types:[ objsS, "arr" ], extraItems:objsS },
				"func"
			] )
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( objs, "arr" ) === false )
	{
		objs = [ objs ];
	}
	
	var finalObjs = [];
	
	for( var prop in objs )
	{
		finalObjs.push(
			{ index:{ _id:objs[ prop ].id.toString() } }
		);
		finalObjs.push( objs[ prop ] );
	}
	
	if( finalObjs.length === 0 )
	{
		cb( undefined );
		
		return;
	}
	
	var restoreInfo =
		ClusterConHandler.prepareObjsForCluster(
			objs, _preparingHandlers
		)
	;
	
	var method = "POST";
	
	var path = "/"+indexName+"/"+indexName+"/_bulk";
	
	var reqOpts = { data:finalObjs };
	
	this.request( method, path, reqOpts, function( err, res )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "undef", "any" ] )
				.verArgs( arguments )
			;
		}
		
		ClusterConHandler.restoreObjs( restoreInfo );
		
		if( sys.errorCheck( err, cb ) === true )
		{
			return;
		}
		else
		{
			cb( undefined );
		}
	});
}

ElasticsearchConHandler.prototype.delete = function(
	indexName, query, cb
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
				{ "delete":{ _id:query[ prop ].toString() } }
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
		{ data:finalQuery },
		function( err, res )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "undef", "any" ] )
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
}

ElasticsearchConHandler.prototype.query = function(
	indexName, query, cb
)
{
	if( conf.doVer() === true )
	{
// Performing a query with an empty queryObj would be most odd.
// Therefore queryObj is required to be a proper obj
		new FuncVer()
			.addArgs( [
				ClusterConHandler.COLLECTION_NAME_S,
				{
					types:[ Id, "arr", FuncVer.PROPER_OBJ ], extraItems:Id
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
		var idStrs = [];
		
		for( var item in query )
		{
			idStrs.push( query[ item ].toString() );
		}
		
		if( idStrs.length === 0 )
		{
			cb( undefined, [] );
		}
		
		query = { ids:{ values:idStrs } };
	}
	
	var method = "GET";
	var path = "/" + indexName + "/" + indexName + "/_search";
	
	var opts = { data: query };
	
	this.request( method, path, opts, function( err, res )
	{
		if( conf.doVer() === true )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [
					"undef",
					{
						props: {
							hits: {
								req:true,
								props: {
									hits: {
										req:true,
										extraItems:{ props:{ _source:"+obj" } }
									}
								}
							}
						}
					}
				] )
				.verArgs( arguments )
			;
		}
		
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
		
		ClusterConHandler.restoreObjsFromCluster(
			hits, _restoringHandlers
		);
		
		cb( undefined, hits );
	});
}

exports.ElasticsearchConHandler = ElasticsearchConHandler;

var EsCon = require("./escon").EsCon;
var Elasticsearch = require("./elasticsearch").Elasticsearch;
