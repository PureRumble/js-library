var vows = require("vows");

var timers = require("timers");
var crypto = require("crypto");

var Testing = require("ourglobe/testing").Testing;

var RuntimeError = require("ourglobe").RuntimeError;

var assert = require("ourglobe").assert;
var FuncVer = require("ourglobe").FuncVer;

var sys = require("ourglobe").sys;

var MoreHttp = require("ourglobe/utils").MoreHttp;

var Elasticsearch =
	require("ourglobe/elasticsearch").Elasticsearch
;
var ElasticsearchConHandler =
	require("ourglobe/elasticsearch").ElasticsearchConHandler
;
var EsCon = require("ourglobe/elasticsearch/escon").EsCon;

var ClusterMapper =
	require("ourglobe/clusterconhandler").ClusterMapper
;

var Id = require("ourglobe/clusterconhandler").Id;
var Link = require("ourglobe/clusterconhandler").Link;
var Binary = require("ourglobe/clusterconhandler").Binary;
var Cache = require("ourglobe/clusterconhandler").Cache;

var _ELASTICSEARCH_CON_HANDLER = new ElasticsearchConHandler(
	"elasticsearch", [ { host:"127.0.1.1", port:9200 } ]
);

var _INDEX_NAME = "test";

var _CLUSTER_MAPPING = [];
_CLUSTER_MAPPING[ _INDEX_NAME ] = 0;
var _CLUSTER_MAPPER = new ClusterMapper(
		[ _ELASTICSEARCH_CON_HANDLER ], _CLUSTER_MAPPING
);

function _insertQueryTest( objs, timeout )
{
	var objS = { props:{ id:{ req:true, types:Id } } };
	
	new FuncVer(
		[
			{ types:[ "arr", objS ], extraItems:objS },
			[ FuncVer.NON_NEG_INT, "undef" ]
		],
		"obj"
	)
		.verArgs( arguments )
	;
	
	timeout = timeout !== undefined ? timeout : 1000;
	
	var clone = Testing.clone( objs ); 
	
	var objsToInsert = clone;
	
	if( sys.hasType( objsToInsert, "arr" ) === false )
	{
		objsToInsert = [ objsToInsert ];
	}
	
	var ids = [];
	
	for( var pos in objsToInsert )
	{
		ids.push( objsToInsert[ pos ].id );
	}
	
// In order for the test process to be the same even if no objs
// were inserted, a random id is added for the query to be valid
	
	if( ids.length === 0 )
	{
		ids.push( new Id() );
	}
	
	var idStrs = [];
	
	for( var pos in ids )
	{
		idStrs[ pos ] = ids[ pos ].toString();
	}
	
	var returnVar = Testing.getTests(
		
		"topic",
		function()
		{
			_CLUSTER_MAPPER
				.getConHandler( _INDEX_NAME )
				.insert( _INDEX_NAME, objs, this.callback )
			;
		},
		
		"objs are as they were before insertion",
		function( err )
		{
			new FuncVer( [ [ Error, "undef/null" ] ] )
				.verArgs( arguments )
			;
			
			Testing.errorCheckArgs( arguments );
			
			var diff = Testing.compare( clone, objs );
			
			if( diff !== undefined )
			{
				throw new RuntimeError(
					"Objs are not as they were before insertion. The "+
					"objs before and after insertion and their diff are: "+
					Testing.getPrettyStr( {
						before:clone,
						after:objs,
						diff: diff
					} )
				);
			}
		},
		
		"and querying the objs",
		Testing.getTests(
			
			"topic",
			function()
			{
				var outerThis = this;
				
				timers.setTimeout(
					function()
					{
						_CLUSTER_MAPPER
							.getConHandler( _INDEX_NAME )
							.query(
								_INDEX_NAME,
								{ query: { ids:{ values:idStrs } } },
								outerThis.callback
							)
						;
					},
					timeout
				);
			},
			
			"yields all objs as they were before insertion",
			function( err, res )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ 
						"null/undef",
						[
							Error,
							{
								denseItems:true,
								extraItems:
								{
									props:{
										id:{ req:true, types:Id },
										_id:{ badTypes:{} }
									}
								}
							}
						]
					] )
					.verArgs( arguments )
				;
				
				Testing.errorCheckArgs( arguments );
				
				var resById = [];
				
				for( var pos in res )
				{
					var currObj = res[ pos ];
					var currId = currObj.id.toString();
					
					resById[ currId ] = currObj;
				}
				
				var objsById = [];
				
				for( var pos in objsToInsert )
				{
					var currObj = objsToInsert[ pos ];
					var currId = currObj.id.toString();
					
					objsById[ currId ] = currObj;
				}
				
				var diff = Testing.compare( objsById, resById );
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Resulting objs from the query dont equal the "+
						"original objs that were inserted. Resulting and "+
						"original objs and their difference are: "+
						Testing.getPrettyStr( {
							original:objsById,
							resulting:resById,
							diff: diff
						} )
					);
				}
			},
			
			"and then deleting the inserted objs",
			Testing.getTests(
				
				"topic",
				function()
				{
					var idsToDelete = ids;
					
					if( idsToDelete.length === 1 )
					{
						idsToDelete = idsToDelete[ 0 ];
					}
					
					_CLUSTER_MAPPER
						.getConHandler( _INDEX_NAME )
						.delete( _INDEX_NAME, idsToDelete, this.callback )
					;
				},
				
				"turns out OK",
				function( err )
				{
					new FuncVer( [ [ Error, "undef/null" ] ] )
						.verArgs( arguments )
					;
					
					Testing.errorCheckArgs( arguments );
				},
				
				"and making sure there's nothing left",
				Testing.getTests(
					
					"topic",
					function()
					{
						var outerThis = this;
						
						timers.setTimeout(
							function()
							{
								_CLUSTER_MAPPER
								.getConHandler( _INDEX_NAME )
								.query(
									_INDEX_NAME,
									{ query:{ ids:{ values:idStrs } } },
									outerThis.callback
								);
							},
							timeout
						);
					},
					
					"turns out to be true",
					function( err, res )
					{
						new FuncVer()
							.addArgs( [ Error ] )
							.addArgs( [ "null/undef", [ Error, "arr" ] ] )
							.verArgs( arguments )
						;
						
						Testing.errorCheckArgs( arguments );
						
						if( res.length !== 0 )
						{
							throw new RuntimeError(
								"No objs should be left after deletion"
							);
						}
					}
				)
			)
		)
	);
	
	return returnVar;
}

var suite = vows.describe( "elasticsearchconhandler" );

// creating index and mapping type
suite.addBatch( Testing.getTests(
	
	"creating a test index",
	Testing.getTests(
		
		"topic",
		function()
		{
			var outerThis = this;
			
			_ELASTICSEARCH_CON_HANDLER.getCurrCon(
			function( err, esCon )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "undef", EsCon ] )
					.verArgs( arguments )
				;
				
				Testing.errorCheckArgs( arguments );
				
				esCon.request(
					"PUT", "/"+_INDEX_NAME, outerThis.callback
				);
			});
		},
		
		"is OK",
		function( err, res )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "null/undef", [ Error, "obj" ] ] )
				.verArgs( arguments )
			;
			
			Testing.errorCheckArgs( arguments );
		},
		
		"and then a test mappingtype",
		Testing.getTests(
			
			"topic",
			function()
			{
				var outerThis = this;
				
				_ELASTICSEARCH_CON_HANDLER.getCurrCon(
				function( err, esCon )
				{
					new FuncVer()
						.addArgs( [ Error ] )
						.addArgs( [ "undef", EsCon ] )
						.verArgs( arguments )
					;
					
					Testing.errorCheckArgs( arguments );
					
					esCon.request(
						"PUT",
						"/"+_INDEX_NAME+"/"+_INDEX_NAME+"/_mapping",
						{ data: { test: { } } },
						outerThis.callback
					);
				} );
			},
			
			"is OK",
			function( err, res )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "null/undef", [ Error, "obj" ] ] )
					.verArgs( arguments )
				;
				
				Testing.errorCheckArgs( arguments );
			}
		)
	)
	
) );

// inserting simple objs
suite.addBatch( Testing.getTests(
	
	"no objs",
	_insertQueryTest( [] ),
	
	"one empty obj",
	_insertQueryTest( { id:new Id() } ),
	
	"two empty objs",
	_insertQueryTest( [ { id:new Id() }, { id:new Id() } ] ),
	
	"objs with basic types",
	_insertQueryTest( [
		{ id:new Id(), dingo:42, dango:"dango", dongo:true },
		{ id:new Id(), dingi:42.22, dangi:"", dongi:null }
	] ),

	"objs with recursive objs and arrs with basic types",
	_insertQueryTest( [
		{
			id:new Id(),
			dingo:42,
			dango:[],
			dongo:true,
			dengo:
			{
				dingi:"dingi",
				dangi:[ true, false, true ],
				dongi:[ 42.3, 42.4, 42.5 ],
				dengi:[]
			}
		}
		
	] )
	
) );

// inserting and querying class objs and dates
suite.addBatch( Testing.getTests(
	
	"obj with nested id objs",
	_insertQueryTest(
		{ id:new Id(), secondId:new Id(), innerId:{ id:new Id() } }
	),
	
	"obj with nested link objs and ids",
	_insertQueryTest(
		{
			id:new Id(),
			link:new Link( "DingyWork", new Id() ),
			obj:
			{
				setOfIds:{ idOne:new Id(), idTwo:new Id() },
				anotherLink:new Link( "DingaWork", new Id() )
			}
		}
	),
	
	"obj with nested binaries",
	Testing.getVar( function()
	{
		var bufOne = new Buffer( crypto.randomBytes( 256 ) );
		var bufTwo = new Buffer( crypto.randomBytes( 512 ) );
		var bufThree = new Buffer( crypto.randomBytes(128 ) );
		
		return _insertQueryTest(
			{
				id:new Id(),
				binaryOne: new Binary( bufOne, "jpg" ),
				binaries:
				{
					binaryTwo: new Binary( bufTwo, "jpg" ),
					binaryThree: new Binary( bufThree, "jpg" ),
					strs:[ "dingo", "dango", "dongo" ]
				}
			}
		)
	} ),
	
	"obj with nested date objs",
	_insertQueryTest(
		{
			id:new Id(),
			dateOne:new Date(),
			dateTwo:new Date(),
			someBool:false,
			moreDates:
			{
				firstDate:new Date(),
				secondDate:new Date(),
				thirdDate:new Date(),
				fourthDate:new Date()
			}
		}
	),
	
	"obj with nested cache obj containing ids, links, binaries "+
	"and dates",
	Testing.getVar( function()
	{
		var bufOne = new Buffer( crypto.randomBytes( 1024 ) );
		
		return _insertQueryTest(
			{
				id:new Id(),
				dingoCache:new Cache(
					{
						id:new Id(),
						link:new Link( "DinkoWork", new Id() ),
						arr:[ 42, 43, 44, 45, 46 ],
						obj:
						{
							dingo:"dingo",
							dango:"dango",
							dongo:new Binary( bufOne, "jpg" ),
							dingi:new Date(),
							dangi:new Date()
						}
					},
					new Link( "DinkaWork", new Id() )
				)
			}
		);
	} ),
	
	"obj with all kind of class objs",
	Testing.getVar( function()
	{ 
		var bufOne = new Buffer( crypto.randomBytes( 512 ) );
		var bufTwo = new Buffer( crypto.randomBytes( 512 ) );
		
		return _insertQueryTest(
			{
				id:new Id(),
				idOne: new Id(),
				linkOne: new Link( "DinkaWork", new Id() ),
				idTwo: new Id(),
				linkTwo: new Link( "DingaWork", new Id() ),
				idThree: new Id(),
				dateOne: new Date(),
				obj:{
					dateTwo: new Date(),
					cacheOne:new Cache(
						{
							dateThree: new Date(),
							innerCache:new Cache(
								{
									dinga:"dinga",
									binaryOne:new Binary( bufOne, "jpg" ),
									dateFour: new Date(),
									dingo:true
								},
								new Link( "DinkeWork", new Id() )
							)
						},
						new Link( "DinkoWork", new Id() )
					),
					binary:new Binary( bufTwo, "jpg" )
				}
			}
		);
		
	} )
	
) );

// deleting index
suite.addBatch( Testing.getTests(
	
	"deleting the test index",
	Testing.getTests(
		
		"topic",
		function()
		{
			var outerThis = this;
			
			_ELASTICSEARCH_CON_HANDLER.getCurrCon(
			function( err, esCon )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [ "undefined", EsCon ] )
					.verArgs( arguments )
				;
				
				Testing.errorCheckArgs( arguments );
				
				esCon.request(
					"DELETE", "/"+_INDEX_NAME, outerThis.callback
				);
			});
		},
		
		"is OK",
		function( err, res )
		{
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [ "null/undef", [ Error, "obj" ] ] )
				.verArgs( arguments )
			;
			
			Testing.errorCheckArgs( arguments );
		}
		
	)
	
) );

suite.export( module );
