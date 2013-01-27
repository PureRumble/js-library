ourglobe.require(
[
	"crypto",
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing",
	"ourglobe/server/store"
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

var conf = ourglobe.conf;
var assert = ourglobe.assert;
var FuncVer = ourglobe.FuncVer;

vows = mods.get( "vows" );

var crypto = mods.get( "crypto" );

var Test = mods.get( "testing" ).Test;

var StoreConHandler = mods.get( "store" ).StoreConHandler;
var StoreDataRuntimeError =
	mods.get( "store" ).StoreDataRuntimeError
;

var Id = mods.get( "store" ).Id;
var Binary = mods.get( "store" ).Binary;
var Link = mods.get( "store" ).Link;
var Cache = mods.get( "store" ).Cache;

var sysValue = StoreConHandler.OUR_GLOBE_SYS_VALUE;

var IdCont =
getF(
new FuncVer( [ "str" ] ),
function( idStr )
{
	this.idStr = idStr;
});

var BinaryCont =
getF(
new FuncVer( [ Buffer ] ),
function( buffer )
{
	this.buffer = buffer;
});

var DateCont =
getF(
new FuncVer( [ Date ] ),
function( date )
{
	this.date = date;
});

var getPreparedCache =
getF(
new FuncVer( [
	Cache,
	"obj/arr/null/bool/number/str",
	"bool/undef",
	"bool/undef"
])
	.setReturn( "obj" ),
function(
	cache, preparedCacheObj, preparingDateUsed, preparingIdUsed
)
{
	if( preparingDateUsed === undefined )
	{
		preparingDateUsed = true;
	}
	
	if( preparingIdUsed === undefined )
	{
		preparingIdUsed = true;
	}
	
	var returnVar =
	{
		type: "Cache",
		cache: preparedCacheObj,
		link:
		{
			type: "Link",
			collection: cache.getLink().getCollection(),
			id:
			{
				type: "Id",
				id:
					preparingIdUsed === false ?
						cache.getLink().getId().toString() :
						new IdCont( cache.getLink().getId().toString() )
			}
		},
		refreshedDate:
		{
			type: "Date",
			date: 
				preparingDateUsed === false ?
					cache.getRefreshedDate().toISOString() :
					new DateCont( cache.getRefreshedDate() )
		}
	};
	
	returnVar[ StoreConHandler.OUR_GLOBE_SYS_KEY ] =
		StoreConHandler.OUR_GLOBE_SYS_VALUE
	;
	
	var link = returnVar[ "link" ];
	var refreshedDate = returnVar[ "refreshedDate" ];
	
	link[ StoreConHandler.OUR_GLOBE_SYS_KEY ] =
		StoreConHandler.OUR_GLOBE_SYS_VALUE
	;
	
	link[ "id" ][ StoreConHandler.OUR_GLOBE_SYS_KEY ] =
		StoreConHandler.OUR_GLOBE_SYS_VALUE
	;
	
	refreshedDate[ StoreConHandler.OUR_GLOBE_SYS_KEY ] =
		StoreConHandler.OUR_GLOBE_SYS_VALUE
	;
	
	return returnVar;
});

var prepareObjsTest =
getF(
new FuncVer()
	.addArgs( [
		"obj/arr",
		"obj/arr",
		"obj/arr/undef",
		"bool/undef",
		"bool/undef"
	])
	.setReturn( "obj" ),
function(
	setBeforePrep,
	setAfterPrep,
	setAfterRest,
	useDateFuncs,
	useIdFuncs
)
{
	if( useDateFuncs === undefined )
	{
		useDateFuncs = true;
	}
	
	if( useIdFuncs === undefined )
	{
		useIdFuncs = true;
	}
	
	var cloneOne = Test.clone( setBeforePrep );
	var cloneTwo = Test.clone( setAfterPrep );
	var firstTopic = undefined;
	
	var TestStoreConHandler =
	Class.create(
	{
		name: "TestStoreConHandler",
		extends: StoreConHandler
	});
	
	var addObj = {};
	
	addObj.getBinaryStoreObj =
	[
		StoreConHandler.GET_BINARY_STORE_OBJ_V,
		function( binary )
		{
			return new BinaryCont( binary.getBuffer() );
		}
	];
	
	addObj.restoreBinary =
	[
		StoreConHandler.RESTORE_BINARY_V,
		function( binaryCont )
		{
			if( binaryCont instanceof BinaryCont === false )
			{
				throw new StoreDataRuntimeError(
					"A BinaryCont must be provided when restoring "+
					"a Binary",
					{ providedVar: binaryCont }
				);
			}
			
			return new Binary( binaryCont.buffer );
		}
	];
	
	if( useIdFuncs === true )
	{
		addObj.getIdStoreObj =
		[
			StoreConHandler.GET_ID_STORE_OBJ_V,
			function( id )
			{
				return new IdCont( id.toString() );
			}
		];
		
		addObj.restoreId =
		[
			StoreConHandler.RESTORE_ID_V,
			function( idCont )
			{
				if( idCont instanceof IdCont === false )
				{
					throw new StoreDataRuntimeError(
						"An IdCont must be provided when restoring an Id",
						{ providedVar: idCont }
					);
				}
				
				return new Id( idCont.idStr );
			}
		];
	}
	
	if( useDateFuncs === true )
	{
		addObj.getDateStoreObj =
		[
			StoreConHandler.GET_DATE_STORE_OBJ_V,
			function( date )
			{
				return new DateCont( date );
			}
		];
		
		addObj.restoreDate =
		[
			StoreConHandler.RESTORE_DATE_V,
			function( dateCont )
			{
				if( dateCont instanceof DateCont === false )
				{
					throw new StoreDataRuntimeError(
						"A DateCont must be provided when restoring a Date",
						{ providedVar: dateCont }
					);
				}
				
				return dateCont.date;
			}
		];
	}
	
	Class.add( TestStoreConHandler, addObj );
	
	var testConHandler =
		new TestStoreConHandler(
			"testStore", [ { host: "testHost", port: 0 } ]
		)
	;
	
	return(
	{
		topic:
		function()
		{
			firstTopic = testConHandler.getStoreObj( cloneOne );
			
			return firstTopic;
		},
		"get properly prepared":
		getF(
			new FuncVer( [ "any" ] ),
			function( topic )
			{
				Test.errorCheckArgs( arguments );
				
				var diff = Test.compare( topic, setAfterPrep );
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Preparing the objs for store doesnt yield "+
						"expected objs",
						{
							result: topic,
							expected: setAfterPrep,
							diff: diff
						}
					);
				}
			}
		),
		"while the set itself is intact":
		getF(
			new FuncVer( [ "any" ] ),
			function( topic )
			{
				Test.errorCheckArgs( arguments );
				
				var diff =
					Test.compare( cloneOne, setBeforePrep )
				;
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Restoring objs after preparing them for store "+
						"doesnt yield original objs",
						{
							result: cloneOne,
							original: setBeforePrep,
							diff: diff
						}
					);
				}
			}
		),
		"and finally restoring the objs":
		{
			topic:
			function()
			{
				testConHandler.restoreObj( cloneTwo );
				
				return true;
			},
			"makes them properly restored":
			getF(
				new FuncVer( [ [ Error, "bool" ] ] ),
				function( topic )
				{
					Test.errorCheckArgs( arguments );
					
					var objsToCompare =
						setAfterRest !== undefined ?
							setAfterRest :
							setBeforePrep
					;
					
					var diff =
						Test.compare( objsToCompare, cloneTwo )
					;
					
					if( diff !== undefined )
					{
						throw new RuntimeError(
							"Restoring objs from store doesnt yield "+
							"expected objs",
							{
								restoredObj: cloneTwo,
								expectedObj: objsToCompare,
								diff: diff
							}
						);
					}
				}
			)
		}
	});
});

var suite = vows.describe( "storeconhandler" );
suite.options.error = false;

// Preparing and restoring simple objs and ars
suite.addBatch( Test.getTests(
	"empty arr", prepareObjsTest( [], [] ),
	"empty obj", prepareObjsTest( {}, {} ),
	
	"objs and arrs with undefs",
	Test.getVar(
	function()
	{
		var arr = [];
		
		arr[ 0 ] = 42;
		arr[ 1 ] = true;
		arr[ 2 ] = false;
		arr[ 4 ] = [];
		arr[ 5 ] = "";
		
		var obj =
			{ dingo: "dingo", dango: "dango", dingi: arr }
		;
		
		return prepareObjsTest(
			{
				dingo: "dingo",
				dango: "dango",
				dongo: undefined,
				dingi:[ 42, true, false, undefined, [ undefined ], "" ]
			},
			obj,
			obj
		);
		
	} ),
	
	"multiple simple objs",
	prepareObjsTest(
		[
			{ dingo: "dingo" },
			{ dingi: null, dangi: false },
			{ 0: 000, 1: 111 }
		],
		[
			{ dingo: "dingo" },
			{ dingi: null, dangi: false },
			{ 0: 000, 1: 111 }
		]
	),
	
	"nested objs",
	Test.getVar(
	function() { 
		
		var arr0 = [];
		arr0[ "dingi" ] = true;
		arr0[ "dangi" ] = { a: 1, b:{ danga: false }, c: 3 };
		
		var arr1 = [];
		arr1[ "dingi" ] = true;
		arr1[ "dangi" ] = { a: 1, b:{ danga: false }, c: 3 };
		
		return prepareObjsTest(
			[ { dingo:[ 0, 1, arr0, 2, 3 ], dango:{ dongo: 1 } } ],
			[ { dingo:[ 0, 1, arr1, 2, 3 ], dango:{ dongo: 1 } } ]
		);
	})
));

// Id/Binary/Date/Link/Cache tests
suite.addBatch( Test.getTests(
	
	"single date with date func",
	Test.getVar(
	function()
	{
		var date = new Date();
		
		return prepareObjsTest(
			{ date: date },
			{
				date:
				{
					ourGlobeSysSet: sysValue,
					type: "Date",
					date: new DateCont( date )
				}
			}
		);
	}),
	
	"single date without date funcs",
	Test.getVar(
	function()
	{
		var date = new Date();
		
		return prepareObjsTest(
			{ date: date },
			{
				date:
				{
					ourGlobeSysSet: sysValue,
					type: "Date",
					date: date.toISOString()
				}
			},
			undefined,
			false
		);
	}),
	
	"single id with id funcs",
	Test.getVar(
	function()
	{
		var id = new Id();
		
		return prepareObjsTest(
			{ id: id },
			{
				id:
				{
					ourGlobeSysSet: sysValue,
					type: "Id",
					id: new IdCont( id.toString() )
				}
			}
		);
	}),
	
	"single id without id funcs",
	Test.getVar(
	function()
	{
		var id = new Id();
		
		return prepareObjsTest(
			{ id: id },
			{
				id:
				{
					ourGlobeSysSet: sysValue,
					type: "Id",
					id: id.toString()
				}
			},
			undefined,
			undefined,
			false
		);
	}),
	
	"single binary",
	Test.getVar(
	function()
	{
		var binary = new Binary(
			new Buffer( crypto.randomBytes( 64 ) )
		);
		
		return prepareObjsTest(
			{ binary: binary },
			{
				binary:
				{
					ourGlobeSysSet: sysValue,
					type: "Binary",
					binary: new BinaryCont( binary.getBuffer() )
				}
			}
		);
	}),
	
	"single link with id funcs",
	Test.getVar(
	function()
	{
		var id = new Id();
		var collection = "BogyCollection";
		
		return prepareObjsTest(
			[ { link: new Link( collection, id ) } ],
			[ {
				link:
				{
					ourGlobeSysSet: sysValue,
					type: "Link",
					collection: collection,
					id:
					{
						ourGlobeSysSet: sysValue,
						type: "Id",
						id: new IdCont( id.toString() )
					}
				}
			}]
		);
	}),
	
	"single link without id funcs",
	Test.getVar(
	function()
	{
		var id = new Id();
		var collection = "BogyCollection";
		
		return prepareObjsTest(
			[ { link: new Link( collection, id ) } ],
			[ {
				link:
				{
					ourGlobeSysSet: sysValue,
					type: "Link",
					collection: collection,
					id:
					{
						ourGlobeSysSet: sysValue,
						type: "Id",
						id: id.toString()
					}
				}
			}],
			undefined,
			true,
			false
		);
	}),
	
	"single cache with empty cache obj",
	Test.getVar(
	function( )
	{
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cache = new Cache( {}, link, date );
		
		return prepareObjsTest(
			{ dingo: cache },
			{ dingo: getPreparedCache( cache, {}, true ) }
		);
	}),
	
	"single cache with immediate id as cache obj",
	Test.getVar(
	function( )
	{
		var cachedId = new Id();
		
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cache = new Cache( cachedId, link, date );
		
		return prepareObjsTest(
			{ dingo: cache },
			{
				dingo:
					getPreparedCache(
						cache,
						{
							ourGlobeSysSet: sysValue,
							type: "Id",
							id: new IdCont( cachedId.toString() )
						}
					)
			}
		);
	}),
	
	"single cache without date funcs",
	Test.getVar(
	function( )
	{
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cache = new Cache( 42, link, date );
		
		return prepareObjsTest(
			{ dingo: cache },
			{ dingo: getPreparedCache( cache, 42, false ) },
			undefined,
			false
		);
	}),
	
	"single cache without date funcs nor id funcs",
	Test.getVar(
	function( )
	{
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cache = new Cache( 42, link, date );
		
		return prepareObjsTest(
			{ dingo: cache },
			{ dingo: getPreparedCache( cache, 42, false, false ) },
			undefined,
			false,
			false
		);
	}),
	
	"single cache with no date funcs and nested cache obj",
	Test.getVar(
	function()
	{
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cacheObj =
		{
			dingo: "DINGO",
			dango: "DANGO",
			dongo: "DONGO",
			dengo:
			[
				[],
				[ 42, 43, { dengo:[ "dingo", "dango", "dongo" ] }, 42 ],
				{}
			]
		};
		
		var cache = new Cache( cacheObj, link, date );
		
		return prepareObjsTest(
			{ dingo: cache },
			{ dingo: getPreparedCache( cache, cacheObj, false ) },
			undefined,
			false
		);
	}),
	
	"nested obj with caches and ids nested in turn",
	Test.getVar(
	function()
	{
		var idOne = new Id();
		var idTwo = new Id();
		
		var dateOne = new Date();
		var dateTwo = new Date();
		
		var cacheOne =
		new Cache(
			{
				dingo: "Dingo",
				dango: "Dango",
				dongo: idOne,
				dengo: dateTwo
			},
			new Link( "DingyWork", idOne ),
			dateTwo
		);
		
		var cacheTwo =
		new Cache(
			{
				dingi: new Link( "DingaWork", idTwo ),
				dangi: "Dangi",
				dongi: [ 42, true, null, cacheOne ]
			},
			new Link( "DingaWork", idTwo ),
			dateOne
		);
		
		return prepareObjsTest(
			{
				dingo:[ idOne, "dingi", cacheTwo, "dingo" ],
				dango: 2
			},
			{
				dingo:
				[
					{
						ourGlobeSysSet: sysValue,
						type: "Id",
						id: new IdCont( idOne.toString() )
					},
					"dingi",
					getPreparedCache(
						cacheTwo,
						{
							dingi:
							{
								ourGlobeSysSet: sysValue,
								type: "Link",
								collection: "DingaWork",
								id:
								{
									ourGlobeSysSet: sysValue,
									type: "Id",
									id: new IdCont( idTwo.toString() )
								}
							},
							dangi: "Dangi",
							dongi:
							[
								42,
								true,
								null,
								getPreparedCache(
									cacheOne,
									{
										dingo: "Dingo",
										dango: "Dango",
										dongo:
										{
											ourGlobeSysSet: sysValue,
											type: "Id",
											id: new IdCont( idOne.toString() )
										},
										dengo:
										{
											ourGlobeSysSet: sysValue,
											type: "Date",
											date: new DateCont( dateTwo )
										}
									}
								)
							]
						}
					),
					"dingo"
				],
				"dango": 2
			}
		);
	}),
	
	"id, binary, date and links combined and nested",
	Test.getVar(
	function()
	{
		debugger;
		
		var dateOne = new Date();
		var dateTwo = new Date();
		var idOne = new Id();
		var idTwo = new Id();
		
		var binaryOne =
			new Binary( new Buffer( crypto.randomBytes( 64 ) ) )
		;
		
		var binaryTwo =
			new Binary( new Buffer( crypto.randomBytes( 32 ) ) )
		;
		
		var idLinkOne = new Id();
		var idLinkTwo = new Id();
		var collectionOne = "BogyWork";
		var collectionTwo = "DogyWork";
		
		var linkOne = new Link( collectionOne, idLinkOne );
		var linkTwo = new Link( collectionTwo, idLinkTwo );
		
		return prepareObjsTest(
			{
				idOne: idOne,
				ids:[ 42, idTwo, "dingo" ],
				dates:
				{
					dingo: "dingo",
					dateOne: dateOne,
					dates:[ dateOne, dateTwo ]
				},
				links:
				{
					dingo:
					[
						-42, "dingo", 42, { dango: linkOne, dongo: linkTwo }
					]
				},
				binaries:
				[
					{ binaryOne: binaryOne, date: dateOne },
					binaryTwo
				]
			},
			{
				idOne:
				{
					ourGlobeSysSet: sysValue,
					type: "Id",
					id: new IdCont( idOne.toString() )
				},
				ids:
				[
					42,
					{
						ourGlobeSysSet: sysValue,
						type: "Id",
						id: new IdCont( idTwo.toString() )
					},
					"dingo"
				],
				dates:
				{
					dingo: "dingo",
					dateOne:
					{
						ourGlobeSysSet: sysValue,
						type: "Date",
						date: new DateCont( dateOne )
					},
					dates:
					[
						{
							ourGlobeSysSet: sysValue,
							type: "Date",
							date: new DateCont( dateOne )
						},
						{
							ourGlobeSysSet: sysValue,
							type: "Date",
							date: new DateCont( dateTwo )
						}
					]
				},
				links:
				{
					dingo:
					[
						-42,
						"dingo",
						42,
						{
							dango:
							{
								ourGlobeSysSet: sysValue,
								type: "Link",
								collection: collectionOne,
								id:
								{
									ourGlobeSysSet: sysValue,
									type: "Id",
									id: new IdCont( idLinkOne.toString() )
								}
							},
							dongo:
							{
								ourGlobeSysSet: sysValue,
								type: "Link",
								collection: collectionTwo,
								id:
								{
									ourGlobeSysSet: sysValue,
									type: "Id",
									id: new IdCont( idLinkTwo.toString() )
								}
							}
						}
					]
				},
				binaries:
				[
					{
						binaryOne:
						{
							ourGlobeSysSet: sysValue,
							type: "Binary",
							binary: new BinaryCont( binaryOne.getBuffer() )
						},
						date:
						{
							ourGlobeSysSet: sysValue,
							type: "Date",
							date: new DateCont( dateOne )
						}
					},
					{
						ourGlobeSysSet: sysValue,
						type: "Binary",
						binary: new BinaryCont( binaryTwo.getBuffer() )
					}
				]
			}
		)
	})
));

suite.run();

});
