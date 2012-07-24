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

var crypto = mods.get( "crypto" );

var Test = mods.get( "testing" ).Test;

var ClusterConHandler = mods.get( "cluster" ).ClusterConHandler;
var ClusterDataRuntimeError =
	mods.get( "cluster" ).ClusterDataRuntimeError
;

var Id = mods.get( "cluster" ).Id;
var Binary = mods.get( "cluster" ).Binary;
var Link = mods.get( "cluster" ).Link;
var Cache = mods.get( "cluster" ).Cache;

var sysValue = ClusterConHandler.OUR_GLOBE_SYS_VALUE;

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

var prepareId =
getF(
new FuncVer( [ ClusterConHandler.ID_STR_S ] )
	.setReturn( IdCont ),
function( id )
{
	return new IdCont( id.toString() );
});

var prepareBinary =
getF(
new FuncVer( [ Buffer, ClusterConHandler.CONTENT_TYPE_S ] )
	.setReturn( BinaryCont ),
function( buf, contentType )
{
	return new BinaryCont( buf );
});

var prepareDate =
getF(
new FuncVer( [ Date ] ).setReturn( DateCont ),
function( date )
{
	return new DateCont( date );
});

var restoreId =
getF(
new FuncVer( [ "any" ] ).setReturn( "str" ),
function( idCont )
{
	if( idCont instanceof IdCont === false )
	{
		throw new ClusterDataRuntimeError(
			"An IdCont must be provided when restoring an Id",
			{ providedVar: idCont }
		);
	}
	
	return idCont.idStr;
});

var restoreBinary =
getF(
new FuncVer( [ "any", "any" ] ).setReturn( Buffer ),
function( binaryCont, contentType )
{
	if( binaryCont instanceof BinaryCont === false )
	{
		throw new ClusterDataRuntimeError(
			"A BinaryCont must be provided when restoring a Binary",
			{ providedVar: binaryCont }
		);
	}
	
	return binaryCont.buffer;
});

var restoreDate =
getF(
new FuncVer( [ "any" ] ).setReturn( Date ),
function( dateCont )
{
	if( dateCont instanceof DateCont === false )
	{
		throw new ClusterDataRuntimeError(
			"A DateCont must be provided when restoring a Date",
			{ providedVar: dateCont }
		);
	}
	
	return dateCont.date;
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
		"type": "Cache",
		"cache": preparedCacheObj,
		"collection": cache.getLink().getCollection(),
		"id":
			preparingIdUsed === false ?
				cache.getLink().getId().toString() :
				new IdCont( cache.getLink().getId().toString() ),
		"refreshedDate":
			preparingDateUsed === false ?
				cache.getRefreshedDate() :
				new DateCont( cache.getRefreshedDate() )
	};
	
	returnVar[ ClusterConHandler.OUR_GLOBE_SYS_KEY ] =
		ClusterConHandler.OUR_GLOBE_SYS_VALUE
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
	
	return(
	{
		topic:
		function()
		{
			firstTopic =
				ClusterConHandler
					.prepareSetForCluster(
						cloneOne,
						{
							prepareBinary: prepareBinary,
							prepareId:
								useIdFuncs === true ?
									prepareId :
									undefined,
							prepareDate:
								useDateFuncs === true ?
									prepareDate :
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
				
				var diff =
					Test.compare( cloneOne, setAfterPrep )
				;
				
				if( diff !== undefined )
				{
					throw new RuntimeError(
						"Preparing the objs for cluster doesnt yield "+
						"expected objs",
						{
							result: cloneOne,
							expected: setAfterPrep,
							diff: diff
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
				ClusterConHandler.restoreSet( firstTopic );
				
				return true;
			},
			"makes them properly restored":
			getF(
				new FuncVer( [ [ Error, "bool" ] ] ),
				function( topic )
				{
					Test.errorCheckArgs( arguments );
					
					var diff =
						Test.compare( cloneOne, setBeforePrep )
					;
					
					if( diff !== undefined )
					{
						throw new RuntimeError(
							"Restoring objs after preparing them for cluster "+
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
					var result =
						ClusterConHandler.restoreSetFromCluster(
							cloneTwo,
							{
								restoreBinary: restoreBinary,
								restoreId:
									useIdFuncs === true ?
										restoreId :
										undefined,
								restoreDate:
									useDateFuncs === true ?
										restoreDate :
										undefined
							}
						)
					;
					
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
								"Restoring objs from cluster doesnt yield "+
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
		}
	});
});

var suite = vows.describe( "clusterconhandler" );
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
					date: date
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
			new Buffer( crypto.randomBytes( 64 ) ), "jpg"
		);
		
		return prepareObjsTest(
			{ binary: binary },
			{
				binary:
				{
					ourGlobeSysSet: sysValue,
					type: "Binary",
					binary: new BinaryCont( binary.getBuffer() ),
					contentType: binary.getContentType()
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
					id: new IdCont( id.toString() )
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
					id: id.toString()
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
								id: new IdCont( idTwo.toString() )
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
								id: new IdCont( idLinkOne.toString() )
							},
							dongo:
							{
								ourGlobeSysSet: sysValue,
								type: "Link",
								collection: collectionTwo,
								id: new IdCont( idLinkTwo.toString() )
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
							contentType: binaryOne.getContentType(),
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
						contentType: binaryTwo.getContentType(),
						binary: new BinaryCont( binaryTwo.getBuffer() )
					}
				]
			}
		)
	})
));

suite.run();

});
