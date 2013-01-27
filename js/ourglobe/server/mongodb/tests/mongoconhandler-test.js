ourglobe.require(
[
	"timers",
	"crypto",
	"ourglobe/lib/server/vows",
	"ourglobe/lib/server/mongodb",
	"ourglobe/dual/testing",
	"ourglobe/server/store",
	"ourglobe/server/mongodb",
	"ourglobe/server/morehttp"
],
function( mods )
{

var RuntimeError = ourglobe.RuntimeError;
var assert = ourglobe.assert;
var FuncVer = ourglobe.FuncVer;
var sys = ourglobe.sys;
var getF = ourglobe.getF;

var vows = mods.get( "vows" );

var timers = mods.get( "timers" );
var crypto = mods.get( "crypto" );

var Test = mods.get( "testing" ).Test;

var mongoDbLib = mods.get( "lib/server/mongodb" );

var Db = mongoDbLib.Db;
var Collection = mongoDbLib.Collection;
var MongoDbBinary = mongoDbLib.Binary;

var MoreHttp = mods.get( "morehttp" ).MoreHttp;

var mongoDbServer = mods.get( "ourglobe/server/mongodb" );

var MongoDb = mongoDbServer.MongoDb;
var MongoConHandler = mongoDbServer.MongoConHandler;

var StoreMapper = mods.get( "store" ).StoreMapper;
var Id = mods.get( "store" ).Id;
var Link = mods.get( "store" ).Link;
var Binary = mods.get( "store" ).Binary;
var Cache = mods.get( "store" ).Cache;

var MONGO_CON_HANDLER =
new MongoConHandler(
	"mongodb", [ { host: "localhost", port: 27017 } ]
);

var COLLECTION_NAME = "test";

var STORE_MAPPING = [];
STORE_MAPPING[ COLLECTION_NAME ] = 0;
var STORE_MAPPER =
	new StoreMapper( [ MONGO_CON_HANDLER ], STORE_MAPPING )
;

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
	
	if( sys.hasType( objsToInsert, "arr" ) === true )
	{
		ids = [];
		
		for( var item in objsToInsert )
		{
			ids.push( objsToInsert[ item ].id );
		}
	}
	else
	{
		ids = objsToInsert.id;
	}
	
	var returnVar =
	Test.getTests(
		
		"topic",
		function()
		{
			STORE_MAPPER
				.getConHandler( COLLECTION_NAME )
				.insert( COLLECTION_NAME, objsToInsert, this.callback )
			;
		},
		
		"objs are as they were before insertion",
		getF(
		new FuncVer( [ [ Error, "undef" ] ] ),
		function( err )
		{
			Test.errorCheckArgs( arguments );
			
			var diff = Test.compare( objs, objsToInsert );
			
			if( diff !== undefined )
			{
				throw new RuntimeError(
					"Objs are not as they were before insertion",
					{ beforeIns: objs, afterIns: objsToInsert, diff: diff }
				);
			}
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
						STORE_MAPPER
							.getConHandler( COLLECTION_NAME )
							.query( COLLECTION_NAME, ids, outerThis.callback )
						;
					},
					timeout
				);
			},
			
			"yields all objs as they were before insertion",
			getF(
			new FuncVer()
				.addArgs( [ Error ] )
				.addArgs( [
					"undef",
					{
						denseItems: true,
						extraItems:
						{
							props:
							{
								id:{ req: true, types: Id }, _id:{ badTypes:{} }
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
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Resulting objs from the query dont equal the "+
						"original objs that were inserted",
						{
							original: objsById, resulting: resById, diff: diff
						}
					);
				}
			}),
			
			"and then deleting the inserted objs",
			Test.getTests(
				
				"topic",
				function()
				{
					STORE_MAPPER
						.getConHandler( COLLECTION_NAME )
						.delete( COLLECTION_NAME, ids, this.callback )
					;
				},
				
				"turns out OK",
				getF(
				new FuncVer( [ [ Error, "undef" ] ] ),
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
								STORE_MAPPER
								.getConHandler( COLLECTION_NAME )
								.query(
									COLLECTION_NAME, ids, outerThis.callback
								);
							},
							timeout
						);
					},
					
					"turns out to be true",
					getF(
					new FuncVer()
						.addArgs( [ Error ] )
						.addArgs( [ "undef", "arr" ] ),
					function( err, res )
					{
						Test.errorCheckArgs( arguments );
						
						if( res.length !== 0 )
						{
							throw new RuntimeError(
								"No objs should be left after deletion"
							);
						}
					})
				)
			)
		)
	);
	
	return returnVar;
});

var suite = vows.describe( "mongodbconhandler" );
suite.options.error = false;

suite.addBatch( Test.getTests(
	
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
	Test.getVar(
	function()
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
					strs:[ "dingo", "dango", "dongo" ],
					extraBinaries:
					[
						new Binary( bufOne ),
						new Binary( bufTwo ),
						new Binary( bufThree ),
						{
							dingo: "dingo",
							dango: "dango",
							dongo: false
						}
					]
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
				fourthDate: new Date(),
				extraDates:
					[ new Date(), new Date(), new Date(), "dingo" ]
			},
			dateArray:[ new Date(), new Date(), 42, new Date() ]
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
				dingoCache: new Cache(
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
	Test.getVar(
	function()
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
							innerCache: new Cache(
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

suite.addBatch(
Test.getTests(
	
	"deleting the test collection",
	Test.getTests(
		
		"topic",
		function()
		{
			var outerThis = this;
			
			var conHandler = 
				STORE_MAPPER.getConHandler( COLLECTION_NAME )
			;
			
			conHandler.getCurrCon(
				getF(
				new FuncVer( [ Error ] ).addArgs( [ "undefined", Db ] ),
				function( err, db )
				{
					Test.errorCheckArgs( arguments );
					
					db.collectionNames(
						getF(
						new FuncVer()
							.addArgs( [ Error ] )
							.addArgs( [
								"null/undef",
								{
									extraItems:
									{
										props:{ name: FuncVer.R_PROPER_STR }
									}
								}
							]),
						function( err, collNames )
						{
							Test.errorCheckArgs( arguments );
							
							for( var item in collNames )
							{
								var currColl = collNames[ item ].name;
								
								var dbName =
									MongoDb.getStandardDbName()+
									"."+
									COLLECTION_NAME
								;
								
								if( currColl === dbName )
								{
									db.dropCollection(
										currColl, outerThis.callback
									);
								}
							}
							
							outerThis.callback();
						})
					);
				})
			);
		},
		
		"gets rid of it",
		getF(
		new FuncVer( [ [ Error, "null/undef" ] ] ),
		function( err )
		{
			Test.errorCheckArgs( arguments );
		}),
		
		"and then closing the db con",
		Test.getTests(
			
			"topic",
			function()
			{
				var outerThis = this;
				
				var conHandler = 
					STORE_MAPPER.getConHandler( COLLECTION_NAME )
				;
			
				conHandler.getCurrCon(
					getF(
					new FuncVer( [ Error ] )
						.addArgs( [ "null/undef", Db ] ),
					function( err, db )
					{
						Test.errorCheckArgs( arguments );
						
						db.close( outerThis.callback );
					})
				);
			},
			
			"closes it",
			getF(
			new FuncVer( [ [ Error, "null/undef" ], "undef" ] ),
			function( err )
			{
				Test.errorCheckArgs( arguments );
			})
		)
	)
));

suite.run();

});
