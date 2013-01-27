ourglobe.require(
[
	"timers",
	"crypto",
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing",
	"ourglobe/server/morehttp",
	"ourglobe/server/cluster",
	"ourglobe/server/elasticsearch",
	"ourglobe/server/elasticsearch/elasticsearchconnection",
],
function( mods )
{

debugger;

var vows = mods.get("vows");

var timers = mods.get( "timers" );
var crypto = mods.get( "crypto" );

var Test = mods.get( "testing" ).Test;

var assert = ourglobe.assert;
var FuncVer = ourglobe.FuncVer;
var sys = ourglobe.sys;
var getF = ourglobe.getF;

var MoreHttp = mods.get( "morehttp" ).MoreHttp;

var ElasticConHandler =
	mods.get( "elasticsearch" ).ElasticConHandler
;
var ElasticsearchConnection =
	mods.get( "elasticsearchconnection" )
;

var ClusterMapper = mods.get( "cluster" ).ClusterMapper;

var Id = mods.get( "cluster" ).Id;
var Link = mods.get( "cluster" ).Link;
var Binary = mods.get( "cluster" ).Binary;
var Cache = mods.get( "cluster" ).Cache;

var ELASTICSEARCH_CON_HANDLER =
new ElasticConHandler(
	"elasticsearch", [ { host: "127.0.1.1", port: 9200 } ]
);

var INDEX_NAME = "test";

var CLUSTER_MAPPING = [];
CLUSTER_MAPPING[ INDEX_NAME ] = 0;

var CLUSTER_MAPPER =
new ClusterMapper(
	[ ELASTICSEARCH_CON_HANDLER ], CLUSTER_MAPPING
);

var objS = { props:{ id:{ req: true, types: Id } } };

var insertQueryTest =
getF(
new FuncVer( [
	{ types:[ "arr", objS ], extraItems: objS },
	[ FuncVer.NON_NEG_INT, "undef" ]
])
	.setReturn( "obj" ),
function( objs, timeout )
{
	timeout = timeout !== undefined ? timeout : 1000;
	
	var objsToInsert = Test.clone( objs ); 
	var ids = undefined;
	
	if( sys.hasType( objsToInsert, "arr" ) === false )
	{
		ids = objsToInsert.id;
	}
	else
	{
		ids = [];
		
		for( var item in objsToInsert )
		{
			ids.push( objsToInsert[ item ].id );
		}
	}
	
	return(
	Test.getTests(
		
		"topic",
		function()
		{
			CLUSTER_MAPPER
				.getConHandler( INDEX_NAME )
				.insert( INDEX_NAME, objsToInsert, this.callback )
			;
		},
		
		"objs are as they were before insertion",
		getF(
		new FuncVer( [ [ Error, "undef/null" ] ] ),
		function( err )
		{
			Test.errorCheckArgs( arguments );
			
			var diff = Test.compare( objsToInsert, objs );
			
			assert(
				diff === undefined,
				"Objs are not as they were before insertion",
				{ before: objs, after: objsToInsert, diff: diff }
			);
		}),
		
		"and querying the objs",
		Test.getTests(
			
			"topic",
			function()
			{
				var outerThis = this;
				
				timers.setTimeout(
					function()
					{
						CLUSTER_MAPPER
							.getConHandler( INDEX_NAME )
							.query( INDEX_NAME, ids, outerThis.callback )
						;
					},
					timeout
				);
			},
			
			"yields all objs as they were before insertion",
			getF(
			new FuncVer( [ Error ] )
				.addArgs( [ 
					"null/undef",
					{
						denseItems: true,
						extraItems:
						{
							props:
							{
								id:{ req: true, types: Id },
								_id:{ badTypes:{} }
							}
						}
					}
				]),
			function( err, res )
			{
				Test.errorCheckArgs( arguments );
				
				var resById = [];
				
				for( var item in res )
				{
					var currObj = res[ item ];
					var currId = currObj.id.toString();
					
					resById[ currId ] = currObj;
				}
				
				var arr = objs;
				
				if( sys.hasType( arr, "arr" ) === false )
				{
					arr = [ arr ];
				}
				
				var objsById = [];
				
				for( var item in arr )
				{
					var currObj = arr[ item ];
					var currId = currObj.id.toString();
					
					objsById[ currId ] = currObj;
				}
				
				var diff = Test.compare( objsById, resById );
				
				assert(
					diff === undefined,
					"Resulting objs from the query dont equal the "+
					"original objs that were inserted",
					{ original: objsById, resulting: resById, diff: diff }
				);
			}),
			
			"and then deleting the inserted objs",
			Test.getTests(
				
				"topic",
				function()
				{
					CLUSTER_MAPPER
						.getConHandler( INDEX_NAME )
						.delete( INDEX_NAME, ids, this.callback )
					;
				},
				
				"turns out OK",
				getF(
				new FuncVer( [ [ Error, "undef/null" ] ] ),
				function( err )
				{
					Test.errorCheckArgs( arguments );
				}),
				
				"and making sure there's nothing left",
				Test.getTests(
					
					"topic",
					function()
					{
						var outerThis = this;
						
						timers.setTimeout(
							function()
							{
								CLUSTER_MAPPER
									.getConHandler( INDEX_NAME )
									.query( INDEX_NAME, ids, outerThis.callback )
								;
							},
							timeout
						);
					},
					
					"turns out to be true",
					getF(
					new FuncVer( [ Error ] )
						.addArgs( [ "null/undef", "arr" ] ),
					function( err, res )
					{
						Test.errorCheckArgs( arguments );
						
						assert(
							res.length === 0,
							"No objs should be left after deleting them all"
						);
					})
				)
			)
		)
	));
});

var suite = vows.describe( "elasticsearchconhandler" );
suite.options.error = false;

// creating index and mapping type
suite.addBatch(
Test.getTests(
	
	"creating a test index",
	Test.getTests(
		
		"topic",
		function()
		{
			var outerThis = this;
			
			ELASTICSEARCH_CON_HANDLER.getCurrCon(
				getF(
				new FuncVer( [ Error ] )
					.addArgs( [ "undef", ElasticsearchConnection ] ),
				function( err, elasticsearchCon )
				{
					Test.errorCheckArgs( arguments );
					
					elasticsearchCon.request(
						"PUT", "/"+INDEX_NAME, outerThis.callback
					);
				})
			);
		},
		
		"is OK",
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "null/undef", "obj" ] ),
		function( err, res )
		{
			Test.errorCheckArgs( arguments );
		}),
		
		"and then a test mappingtype",
		Test.getTests(
			
			"topic",
			function()
			{
				var outerThis = this;
				
				ELASTICSEARCH_CON_HANDLER.getCurrCon(
					getF(
					new FuncVer( [ Error ] )
						.addArgs( [ "undef", ElasticsearchConnection ] ),
					function( err, elasticsearchCon )
					{
						Test.errorCheckArgs( arguments );
						
						elasticsearchCon.request(
							"PUT",
							"/"+INDEX_NAME+"/"+INDEX_NAME+"/_mapping",
							{ data:{ test:{} } },
							outerThis.callback
						);
					})
				);
			},
			
			"is OK",
			getF(
			new FuncVer( [ Error ] )
				.addArgs( [ "null/undef", "obj" ] ),
			function( err, res )
			{
				Test.errorCheckArgs( arguments );
			})
		)
	)
));

// inserting simple objs
suite.addBatch(
Test.getTests(
	
	"no objs",
	insertQueryTest( [] ),
	
	"one empty obj",
	insertQueryTest( { id: new Id() } ),
	
	"two empty objs",
	insertQueryTest( [ { id: new Id() }, { id: new Id() } ] ),
	
	"objs with basic types",
	insertQueryTest( [
		{ id: new Id(), dingo: 42, dango: "dango", dongo: true },
		{ id: new Id(), dingi: 42.22, dangi: "", dongi: null }
	]),

	"objs with recursive objs and arrs with basic types",
	insertQueryTest( [
		{
			id: new Id(),
			dingo: 42,
			dango:[],
			dongo: true,
			dengo:
			{
				dingi: "dingi",
				dangi:[ true, false, true ],
				dongi:[ 42.3, 42.4, 42.5 ],
				dengi:[]
			}
		}
	])
));

// inserting and querying class objs and dates
suite.addBatch(
Test.getTests(
	
	"obj with nested id objs",
	insertQueryTest(
		{
			id: new Id(),
			secondId: new Id(),
			innerId:{ id: new Id() }
		}
	),
	
	"obj with nested link objs and ids",
	insertQueryTest(
		{
			id: new Id(),
			link: new Link( "DingyWork", new Id() ),
			obj:
			{
				setOfIds:{ idOne: new Id(), idTwo: new Id() },
				anotherLink: new Link( "DingaWork", new Id() )
			}
		}
	),
	
	"obj with nested binaries",
	Test.getVar( function()
	{
		var bufOne = new Buffer( crypto.randomBytes( 256 ) );
		var bufTwo = new Buffer( crypto.randomBytes( 512 ) );
		var bufThree = new Buffer( crypto.randomBytes(128 ) );
		
		return(
		insertQueryTest(
			{
				id: new Id(),
				binaryOne: new Binary( bufOne ),
				binaries:
				{
					binaryTwo: new Binary( bufTwo ),
					binaryThree: new Binary( bufThree ),
					strs:[ "dingo", "dango", "dongo" ]
				}
			}
		));
	}),
	
	"obj with nested date objs",
	insertQueryTest(
		{
			id: new Id(),
			dateOne: new Date(),
			dateTwo: new Date(),
			someBool: false,
			moreDates:
			{
				firstDate: new Date(),
				secondDate: new Date(),
				thirdDate: new Date(),
				fourthDate: new Date()
			}
		}
	),
	
	"obj with nested cache obj containing ids, links, binaries "+
	"and dates",
	Test.getVar(
	function()
	{
		var bufOne = new Buffer( crypto.randomBytes( 1024 ) );
		
		return(
		insertQueryTest(
			{
				id: new Id(),
				dingoCache:
					new Cache(
						{
							id: new Id(),
							link: new Link( "DinkoWork", new Id() ),
							arr:[ 42, 43, 44, 45, 46 ],
							obj:
							{
								dingo: "dingo",
								dango: "dango",
								dongo: new Binary( bufOne ),
								dingi: new Date(),
								dangi: new Date()
							}
						},
						new Link( "DinkaWork", new Id() )
					)
			}
		));
	}),
	
	"obj with all kind of class objs",
	Test.getVar( function()
	{ 
		var bufOne = new Buffer( crypto.randomBytes( 512 ) );
		var bufTwo = new Buffer( crypto.randomBytes( 512 ) );
		
		return(
		insertQueryTest(
			{
				id: new Id(),
				idOne: new Id(),
				linkOne: new Link( "DinkaWork", new Id() ),
				idTwo: new Id(),
				linkTwo: new Link( "DingaWork", new Id() ),
				idThree: new Id(),
				dateOne: new Date(),
				obj:{
					dateTwo: new Date(),
					cacheOne:
						new Cache(
							{
								dateThree: new Date(),
								innerCache:
									new Cache(
										{
											dinga: "dinga",
											binaryOne: new Binary( bufOne ),
											dateFour: new Date(),
											dingo: true
										},
										new Link( "DinkeWork", new Id() )
									)
							},
							new Link( "DinkoWork", new Id() )
						),
					binary: new Binary( bufTwo )
				}
			}
		));
	})
));

// deleting index
suite.addBatch(
Test.getTests(
	
	"deleting the test index",
	Test.getTests(
		
		"topic",
		function()
		{
			var outerThis = this;
			
			ELASTICSEARCH_CON_HANDLER.getCurrCon(
				getF(
				new FuncVer( [ Error ] )
					.addArgs( [ "undefined", ElasticsearchConnection ] ),
				function( err, elasticsearchCon )
				{
					Test.errorCheckArgs( arguments );
					
					elasticsearchCon.request(
						"DELETE", "/"+INDEX_NAME, outerThis.callback
					);
				})
			);
		},
		
		"is OK",
		getF(
		new FuncVer( [ Error ] ).addArgs( [ "null/undef", "obj" ] ),
		function( err, res )
		{
			Test.errorCheckArgs( arguments );
		})
	)
));

suite.run();

});
