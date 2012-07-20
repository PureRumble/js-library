ourglobe.require(
[
	"timers",
	"crypto",
	"ourglobe/lib/server/vows",
	"ourglobe/lib/server/mongodb",
	"ourglobe/dual/testing",
	"ourglobe/server/cluster",
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

var ClusterMapper = mods.get( "cluster" ).ClusterMapper;
var Id = mods.get( "cluster" ).Id;
var Link = mods.get( "cluster" ).Link;
var Binary = mods.get( "cluster" ).Binary;
var Cache = mods.get( "cluster" ).Cache;

var _MONGO_CON_HANDLER = new MongoConHandler(
	"mongodb", [ { host:"localhost", port:27017 } ]
);

var _COLLECTION_NAME = "test";

var _CLUSTER_MAPPING = [];
_CLUSTER_MAPPING[ _COLLECTION_NAME ] = 0;
var _CLUSTER_MAPPER = new ClusterMapper(
		[ _MONGO_CON_HANDLER ], _CLUSTER_MAPPING
);

var objS = { props:{ id:{ req: true, types: Id } } };

var _insertQueryTest =
getF(
new FuncVer( [
	{ types:[ "arr", objS ], extraItems: objS },
	[ FuncVer.NON_NEG_INT, "undef" ]
])
	.setReturn( "obj" ),
function( objs, timeout )
{
	timeout = timeout !== undefined ? timeout : 1000;
	
	var clone = Test.clone( objs ); 
	
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
	
	var idBinaries = [];
	
	for( var pos in ids )
	{
		idBinaries[ pos ] =
			new MongoDbBinary( ids[ pos ].getBuffer() )
		;
	}
	
	var returnVar = Test.getTests(
		
		"topic",
		function()
		{
			_CLUSTER_MAPPER
				.getConHandler( _COLLECTION_NAME )
				.insert( _COLLECTION_NAME, objs, this.callback )
			;
		},
		
		"objs are as they were before insertion",
		getF(
		new FuncVer( [ [ Error, "undef/null" ] ] ),
		function( err )
		{
			Test.errorCheckArgs( arguments );
			
			var diff = Test.compare( clone, objs );
			
			if( diff !== undefined )
			{
				throw new RuntimeError(
					"Objs are not as they were before insertion",
					{ beforeIns:clone, afterIns:objs, diff: diff }
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
						_CLUSTER_MAPPER
							.getConHandler( _COLLECTION_NAME )
							.query(
								_COLLECTION_NAME,
								{ _id:{ "$in": idBinaries } },
								outerThis.callback
							)
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
				
				var diff = Test.compare( objsById, resById );
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Resulting objs from the query dont equal the "+
						"original objs that were inserted",
						{
							original: objsById,
							resulting: resById,
							diff: diff
						}
					);
				}
			}),
			
			"and then deleting the inserted objs",
			Test.getTests(
				
				"topic",
				function()
				{
					var idsToDelete = ids;
					
					if( idsToDelete.length === 1 )
					{
						idsToDelete = idsToDelete[ 0 ];
					}
					
					_CLUSTER_MAPPER
						.getConHandler( _COLLECTION_NAME )
						.delete(
							_COLLECTION_NAME,
							idsToDelete,
							this.callback
						)
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
								_CLUSTER_MAPPER
								.getConHandler( _COLLECTION_NAME )
								.query(
									_COLLECTION_NAME,
									{ ids:idBinaries },
									outerThis.callback
								);
							},
							timeout
						);
					},
					
					"turns out to be true",
					getF(
					new FuncVer()
						.addArgs( [ Error ] )
						.addArgs( [ "null/undef", "arr" ] ),
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

suite.addBatch( Test.getTests(
	
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
	Test.getVar( function()
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
					strs:[ "dingo", "dango", "dongo" ],
					extraBinaries:
					[
						new Binary( bufOne, "jpg" ),
						new Binary( bufTwo, "jpg" ),
						new Binary( bufThree, "jpg" ),
						{
							dingo:"dingo",
							dango:"dango",
							dongo:false
						}
					]
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
				fourthDate:new Date(),
				extraDates:
					[ new Date(), new Date(), new Date(), "dingo" ]
			},
			dateArray:[ new Date(), new Date(), 42, new Date() ]
		}
	),
	
	"obj with nested cache obj containing ids, links, binaries "+
	"and dates",
	Test.getVar( function()
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
	Test.getVar( function()
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

suite.addBatch( Test.getTests(
	
	"deleting the test collection",
	Test.getTests(
		
		"topic",
		function()
		{
			var outerThis = this;
			
			var conHandler = 
				_CLUSTER_MAPPER.getConHandler( _COLLECTION_NAME )
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
							
							for( var prop in collNames )
							{
								var currColl = collNames[ prop ].name;
								
								var dbName =
									MongoDb.getStandardDbName()+
									"."+
									_COLLECTION_NAME
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
					_CLUSTER_MAPPER.getConHandler( _COLLECTION_NAME )
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
