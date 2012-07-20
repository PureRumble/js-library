ourglobe.require(
[
	"crypto",
	"ourglobe/lib/server/vows",
	"ourglobe/dual/testing",
	"ourglobe/server/cluster"
],
function( mods )
{

var RuntimeError = ourglobe.RuntimeError;

var conf = ourglobe.conf;
var assert = ourglobe.assert;
var FuncVer = ourglobe.FuncVer;
var sys = ourglobe.sys;
var getF = ourglobe.getF;

vows = mods.get( "vows" );

var crypto = mods.get( "crypto");

var Test = mods.get( "testing").Test;

var ClusterConHandler = mods.get( "cluster").ClusterConHandler;

var Id = mods.get( "cluster" ).Id;
var Binary = mods.get( "cluster" ).Binary;
var Link = mods.get( "cluster" ).Link;
var Cache = mods.get( "cluster" ).Cache;

var suite = vows.describe( "clusterconhandler" );

var _IdCont =
getF(
new FuncVer( [ Buffer ] ),
function( buffer )
{
	this.buffer = buffer;
});

var _BinaryCont =
getF(
new FuncVer( [ Buffer ] ),
function( buffer )
{
	this.buffer = buffer;
});

var _DateCont =
getF(
new FuncVer( [ Date ] ),
function( date )
{
	this.date = date;
});

var _IdPrepareFunc =
getF(
new FuncVer( [ Id ], _IdCont ),
function( id )
{
	return new _IdCont( id.getBuffer() );
});

var _BinaryPrepareFunc =
getF(
new FuncVer( [ Binary ], _BinaryCont ),
function( binary )
{
	return new _BinaryCont( binary.getBuffer() );
});

var _DatePrepareFunc =
getF(
new FuncVer( [ Date ], _DateCont ),
function( date )
{
	return new _DateCont( date );
});

var _IdRestoreFunc =
getF(
new FuncVer( [ _IdCont ], Id ),
function( idCont )
{
	return new Id( idCont.buffer );
});

var _BinaryRestoreFunc =
getF(
new FuncVer( [ _BinaryCont, FuncVer.PROPER_STR ], Binary ),
function( binaryCont, contentType )
{
	return new Binary( binaryCont.buffer, contentType );
});

var _DateRestoreFunc =
getF(
new FuncVer( [ _DateCont ], Date ),
function( dateCont )
{
	return dateCont.date;
});

var _getPreparedCache =
getF(
new FuncVer( [ Cache, "obj", "bool/undef" ], "obj" ),
function( cache, preparedCacheObj, dateFuncUsed )
{
	dateFuncUsed =
		dateFuncUsed !== undefined ?
		dateFuncUsed :
		true
	;
	
	return(
	{
		"::type": "Cache",
		"::link":
		{
			"::type": "Link",
			"::collection": cache.getLink().getCollection(),
			"::id":
			{
				"::type": "Id",
				"::id":
					new _IdCont( cache.getLink().getId().getBuffer() )
			}
		},
		"::refreshedDate":
			dateFuncUsed === false ?
				cache.getRefreshedDate() :
				{
					"::type": "Date",
					"::date": new _DateCont( cache.getRefreshedDate() )
				}
		,
		"::cache": preparedCacheObj
	});
});

var _prepareObjsTest =
getF(
new FuncVer()
	.addArgs( [
		{ extraItems: "obj" },
		{ extraItems: "obj" },
		"bool/undef",
		{ types: "arr/undef", extraItems: "obj" }
	])
	.setReturn( "obj" ),
function(
	objsBeforePrep, objsAfterPrep, useDateFunc, objsAfterRest
)
{
	useDateFunc = useDateFunc !== undefined ? useDateFunc : true;
	
	var clones = Test.clone( objsBeforePrep );
	var firstTopic = undefined;
	
	return(
	{
		topic:
		function()
		{
			firstTopic =
				ClusterConHandler
					.prepareSetForCluster(
						clones,
						{
							Id: _IdPrepareFunc,
							Binary: _BinaryPrepareFunc,
							Date:
								useDateFunc === true ?
									_DatePrepareFunc :
									undefined
						}
					)
			;
			
			return firstTopic;
		},
		"get properly prepared":
		getF(
			new FuncVer( [
				{
					types:[ Error, "arr" ],
					extraItems:
					{
						extraProps: false,
						props:{ set: "+obj/arr", key: "+str", value: "any" }
					}
				}
			]),
			function( topic )
			{
				Test.errorCheckArgs( arguments );
				
				var diff = Test.compare( clones, objsAfterPrep );
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Preparing the objs for cluster doesnt yield "+
						"expected objs",
						{
							result: clones, expected: objsAfterPrep, diff: diff
						}
					);
				}
			}
		),
		"and restoring them":
		{
			topic:
			function()
			{
				var result = ClusterConHandler.restoreSet( firstTopic );
				
				return result === undefined ? false : true;
			},
			"makes them properly restored":
			getF(
				new FuncVer( [
					{ types:[ Error, { values:[ false ] } ] }
				]),
				function( topic )
				{
					Test.errorCheckArgs( arguments );
					
					var diff = Test.compare( clones, objsBeforePrep );
					
					if( diff !== undefined )
					{
						throw new RuntimeError(
							"Restoring objs after preparing them for cluster "+
							"doesnt yield original objs",
							{
								result: clones,
								original: objsBeforePrep,
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
					var result = ClusterConHandler.restoreSetFromCluster(
						objsAfterPrep,
						{
							Id: _IdRestoreFunc,
							Binary: _BinaryRestoreFunc,
							Date:
								useDateFunc === true ?
									_DateRestoreFunc :
									undefined
						}
					);
					
					return result === undefined ? false : true;
				},
				"makes them properly restored":
				getF(
					new FuncVer( [
						{ types:[ Error, { values:[ false ] } ] }
					]),
					function( topic )
					{
						Test.errorCheckArgs( arguments );
						
						var objsToCompare =
							objsAfterRest !== undefined ?
								objsAfterRest :
								objsBeforePrep
						;
						
						var diff =
							Test.compare( objsToCompare, objsAfterPrep )
						;
						
						if( diff !== undefined )
						{
							//d
							console.log({
								restoredObj: objsAfterPrep,
								expectedObj: objsBeforePrep,
								diff: diff
							});
							
							throw new RuntimeError(
								"Restoring objs from cluster doesnt yield "+
								"expected objs",
								{
									restoredObj: objsAfterPrep,
									expectedObj: objsBeforePrep,
									diff: diff
								}
							);
						}
					}
				)
			}
		}
	});
});

// Preparing and restoring simple objs and ars
suite.addBatch( Test.getTests(
	"empty arr", _prepareObjsTest( [], [] ),
	"empty obj in arr", _prepareObjsTest( [ {} ], [ {} ] ),
	
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
		
		var objs =
			[ { dingo: "dingo", dango: "dango", dingi: arr } ]
		;
		
		return _prepareObjsTest(
			[ {
				dingo: "dingo",
				dango: "dango",
				dongo: undefined,
				dingi:[ 42, true, false, undefined, [ undefined ], "" ]
			} ],
			objs,
			undefined,
			objs
		);
		
	} ),
	
	"multiple simple objs",
	_prepareObjsTest(
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
		
		return _prepareObjsTest(
			[ { dingo:[ 0, 1, arr0, 2, 3 ], dango:{ dongo: 1 } } ],
			[ { dingo:[ 0, 1, arr1, 2, 3 ], dango:{ dongo: 1 } } ]
		);
		
	} )
	
) );

// Id/Binary/Date/Link/Cache tests
suite.addBatch( Test.getTests(
	
	"single date with date func",
	Test.getVar(
	function()
	{
		var date = new Date();
		
		return _prepareObjsTest(
			[ { date: date } ],
			[ {
				date:
					{ "::type": "Date", "::date": new _DateCont( date ) }
			} ]
		);
	} ),
	
	"single date without date func",
	Test.getVar(
	function()
	{
		var date = new Date();
		
		return _prepareObjsTest(
			[ { date: date } ], [ { date: date } ], false
		);
	} ),
	
	"single id",
	Test.getVar(
	function()
	{
		var id = new Id();
		
		return _prepareObjsTest(
			[ { id: id } ],
			[
				{
					id:
					{
						"::type": "Id",
						"::id": new _IdCont( id.getBuffer() )
					}
				}
			]
		);
	} ),
	
	"single binary",
	Test.getVar(
	function()
	{
		var binary = new Binary(
			new Buffer( crypto.randomBytes( 64 ) ), "jpg"
		);
		
		return _prepareObjsTest(
			[ { binary: binary } ],
			[ {
				binary:
				{
					"::type": "Binary",
					"::contentType": binary.getContentType(),
					"::content": new _BinaryCont( binary.getBuffer() )
				}
			} ]
		);
	} ),
	
	"single link",
	Test.getVar(
	function()
	{
		var id = new Id();
		var collection = "BogyCollection";
		
		return _prepareObjsTest(
			[ { link: new Link( collection, id ) } ],
			[ {
				link:
				{
					"::type": "Link",
					"::collection": collection,
					"::id":
					{
						"::type": "Id",
						"::id": new _IdCont( id.getBuffer() )
					}
				}
			} ]
		);
	} ),
	
	"single cache with empty cache obj",
	Test.getVar(
	function( )
	{
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cache = new Cache( {}, link, date );
		
		return _prepareObjsTest(
			[ { dingo: cache } ],
			[ { dingo: _getPreparedCache( cache, {}, true ) } ]
		);
	} ),
	
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
		
		return _prepareObjsTest(
			[ { dingo: cache } ],
			[ {
					dingo: _getPreparedCache(
						cache,
						{
							"::type": "Id",
							"::id": new _IdCont( cachedId.getBuffer() )
						},
						true
					)
			} ]
		);
	} ),
	
	"single cache with no date func and nested cache obj",
	Test.getVar(
	function()
	{
		var id = new Id();
		var collection = "DogyCollection";
		
		var link = new Link( collection, id );
		
		var date = new Date();
		
		var cacheObj =
		{
			"dingo": "DINGO",
			"dango": "DANGO",
			"dongo": "DONGO",
			"dengo":
			[
				[],
				[
					42,
					43,
					{ "dengo":[ "dingo", "dango", "dongo" ] },
					42
				],
				{}
			]
		};
		
		var cache = new Cache( cacheObj, link, date );
		
		return _prepareObjsTest(
			[ { dingo: cache } ],
			[ { dingo: _getPreparedCache( cache, cacheObj, false ) } ],
			false
		);
	} ),
	
	"nested obj with caches and ids nested in turn",
	Test.getVar(
	function()
	{
		var idOne = new Id();
		var idTwo = new Id();
		
		var dateOne = new Date();
		var dateTwo = new Date();
		
		var cacheOne = new Cache(
			{
				dingo: "Dingo",
				dango: "Dango",
				dongo: idOne,
				dengo: dateTwo
			},
			new Link( "DingyWork", idOne ),
			dateTwo
		);
		
		var cacheTwo = new Cache(
			{
				dingi: new Link( "DingaWork", idTwo ),
				dangi: "Dangi",
				dongi:
				[
					42,
					true,
					null,
					cacheOne
				]
			},
			new Link( "DingaWork", idTwo ),
			dateOne
		);
		
		return _prepareObjsTest(
			[ {
				"dingo":[ idOne, "dingi", cacheTwo, "dingo" ],
				"dango": 2
			} ],
			[ {
				"dingo":
				[
					{
						"::type": "Id",
						"::id": new _IdCont( idOne.getBuffer() )
					},
					"dingi",
					_getPreparedCache(
						cacheTwo,
						{
							dingi:
							{
								"::type": "Link",
								"::collection": "DingaWork",
								"::id":
								{
									"::type": "Id",
									"::id": new _IdCont( idTwo.getBuffer() )
								}
							},
							dangi: "Dangi",
							dongi:
							[
								42,
								true,
								null,
								_getPreparedCache(
									cacheOne,
									{
										dingo: "Dingo",
										dango: "Dango",
										dongo:
										{
											"::type": "Id",
											"::id": new _IdCont( idOne.getBuffer() )
										},
										dengo:
										{
											"::type": "Date",
											"::date": new _DateCont( dateTwo )
										}
									}
								)
							]
						}
					),
					"dingo"
				],
				"dango": 2
			} ]
		);
	} ),
	
	"id, binary, date and links combined and nested",
	Test.getVar(
	function()
	{
		var dateOne = new Date();
		var dateTwo = new Date();
		var idOne = new Id();
		var idTwo = new Id();
		
		var binaryOne =
			new Binary( new Buffer( crypto.randomBytes( 64 ) ), "jpg" )
		;
		
		var binaryTwo =
			new Binary( new Buffer( crypto.randomBytes( 32 ) ), "jpg" )
		;
		
		var idLinkOne = new Id();
		var idLinkTwo = new Id();
		var collectionOne = "BogyWork";
		var collectionTwo = "DogyWork";
		
		var linkOne = new Link( collectionOne, idLinkOne );
		var linkTwo = new Link( collectionTwo, idLinkTwo );
		
		return _prepareObjsTest(
			[ {
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
			} ],
			[ {
				idOne:
				{
					"::type": "Id",
					"::id": new _IdCont( idOne.getBuffer() )
				},
				ids:
				[
					42,
					{
						"::type": "Id",
						"::id": new _IdCont( idTwo.getBuffer() )
					},
					"dingo"
				],
				dates:
				{
					dingo: "dingo",
					dateOne:
					{
						"::type": "Date",
						"::date": new _DateCont( dateOne )
					},
					dates:
					[
						{
							"::type": "Date",
							"::date": new _DateCont( dateOne )
						},
						{
							"::type": "Date",
							"::date": new _DateCont( dateTwo )
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
								"::type": "Link",
								"::collection": collectionOne,
								"::id":
								{
									"::type": "Id",
									"::id": new _IdCont( idLinkOne.getBuffer() )
								}
							},
							dongo:
							{
								"::type": "Link",
								"::collection": collectionTwo,
								"::id":
								{
									"::type": "Id",
									"::id": new _IdCont( idLinkTwo.getBuffer() )
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
							"::type": "Binary",
							"::contentType": binaryOne.getContentType(),
							"::content":
								new _BinaryCont( binaryOne.getBuffer() )
						},
						date:
						{
							"::type": "Date",
							"::date": new _DateCont( dateOne )
						}
					},
					{
						"::type": "Binary",
						"::contentType": binaryTwo.getContentType(),
						"::content": new _BinaryCont( binaryTwo.getBuffer() )
					}
				]
			}]
		)
		
	} )
	
) );

suite.run();

});
