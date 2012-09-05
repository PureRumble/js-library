ourglobe.require(
[
	"ourglobe/dual/testing/suiteruntimeerror",
	"ourglobe/dual/testing/testruntimeerror",
	"ourglobe/dual/testing/testingerror",
	"ourglobe/dual/testing/test",
	"ourglobe/dual/testing/suiteholder",
	"ourglobe/dual/testing/suiterun",
	"ourglobe/dual/testing/cbstep"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var TestRuntimeError = mods.get( "testruntimeerror" );
var TestingError = mods.get( "testingerror" );
var test = mods.get( "test" );
var expectErr = test.expectErr;
var assert = test.assert;
var SuiteHolder = mods.get( "suiteholder" );
var SuiteRun = mods.get( "suiterun" );
var CbStep = mods.get( "cbstep" );

var faultyFunc = function() { throw new TestingError(); };
var healthyFunc = function() {};

var healthySuite =
{
	topic: healthyFunc,
	argsVer: [ "undef" ],
	vows:[ "dango", healthyFunc ]
};

var expectCbErr =
function( testName, errClass, errFunc, refFunc )
{
	test.expectCbErr(
		testName,
		errClass,
		CbStep.DEFAULT_CB_TIMEOUT + 1000,
		errFunc,
		refFunc
	);
};

var expectSingleSuiteCbErr =
getF(
getV()
	.addA( "str", "func", "obj", "obj" ),
function( testName, errClass, faultySuite, healthySuite )
{
	test.expectCbErr(
		testName,
		errClass,
		CbStep.DEFAULT_CB_TIMEOUT + 1000,
		function( cb )
		{
			new SuiteRun( new SuiteHolder( "suite", faultySuite ) )
				.run(
					function( err )
					{
						if( err !== undefined )
						{
							cb( err );
						}
					}
				)
			;
		},
		function( cb )
		{
			new SuiteRun( new SuiteHolder( "suite", healthySuite ) )
				.run( cb )
			;
		}
	);
});

var expectSuiteCbErr =
getF(
getV()
	.addA( "str", "func", "obj", "obj" ),
function( testName, errClass, faultySuiteObj, healthySuiteObj )
{
	expectSingleSuiteCbErr(
		testName+" - plain suite",
		errClass,
		faultySuiteObj,
		healthySuiteObj
	);
	
	expectSingleSuiteCbErr(
		testName+" - nested suite",
		errClass,
		{
			next:[ "nested suite", faultySuiteObj ]
		},
		{
			next:[ "nested suite", healthySuiteObj ]
		}
	);
	
	expectSingleSuiteCbErr(
		testName+" - two nested suites",
		errClass,
		{
			next:
			[
				"first nested suite (healthy)", healthySuiteObj,
				"second nested suite (faulty)", faultySuiteObj
			]
		},
		{
			next:
			[
				"first nested suite (healthy)", healthySuiteObj,
				"second nested suite (healthy)", healthySuiteObj
			]
		}
	);
});

var testSingleSuiteRun =
getF(
getV()
	.addA( "str", "obj", "func" ),
function( testName, suite, cb )
{
	var cbTime = CbStep.DEFAULT_CB_TIMEOUT + 1000;
	
	var suiteRun =
		new SuiteRun( new SuiteHolder( "suite", suite ) )
	;
	
	var cbCalled = false;
	
	console.log( testName );
	
	var errPrefix =
		"An err occurred when testing '"+testName+"':\n"
	;
	
	suiteRun.run(
		getF(
		SuiteRun.RUN_CB_FV,
		function( err, res )
		{
			if( err !== undefined )
			{
				throw err;
			}
			
			if( cbCalled === true )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to SuiteRun.run() has been called twice",
					{ providedArgs: arguments }
				);
			}
			
			cbCalled = true;
			
			cb( suiteRun );
		})
	);
	
	setTimeout(
		function()
		{
			if( cbCalled === false )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to SuiteRun.run() hasnt been called"
				);
			}
		},
		cbTime
	);
});

var testSuiteRun =
getF(
getV()
	.addA( "str", "bool/undef", "func" )
	.addA( "str", "bool/undef", "obj", "func" )
	.addA( "str", "func" )
	.addA( "str", "obj", "func" ),
function( testName, testNested, suiteArg, cbArg )
{
	if( sys.hasType( testNested, "bool", "undef" ) === false )
	{
		cbArg = suiteArg;
		suiteArg = testNested;
		testNested = undefined;
	}
	
	if( testNested === undefined )
	{
		testNested = true;
	}
	
	var testFunc = undefined;
	
	if( sys.hasType( suiteArg, "func" ) )
	{
		testFunc = suiteArg;
	}
	else
	{
		testFunc =
		function()
		{
			return { suite: suiteArg, cb: cbArg };
		};
	}
	
	var getTestObj =
	function()
	{
		var returnVar = testFunc();
		
		if(
			sys.hasType( returnVar, "obj" ) === false ||
			sys.hasType( returnVar.suite, "obj" ) === false ||
			sys.hasType( returnVar.cb, "func" ) === false
		)
		{
			throw new TestRuntimeError(
				"The test func must return an obj with the props suite "+
				"and cb set to an obj and func respectively",
				{ returnVar: returnVar }
			);
		}
		
		return returnVar;
	};
	
	var returnVar = getTestObj();
	var suite = returnVar.suite;
	var cbOne = returnVar.cb;
	
	testSingleSuiteRun(
		testName+" - plain suite",
		suite,
		function( suiteRun )
		{
			cbOne( suiteRun );
			
			if( testNested === false )
			{
				return;
			}
			
			var returnVar = getTestObj();
			var suite = returnVar.suite;
			var cbTwo = returnVar.cb;
			
			testSingleSuiteRun(
				testName+" - nested suite",
				{
					next:
					[
						"nested suite", suite
					]
				},
				function( suiteRun )
				{
					cbTwo( suiteRun.next[ 0 ] );
					
					var returnVar = getTestObj();
					var suiteOne = returnVar.suite;
					var cbThree = returnVar.cb;
					
					var returnVar = getTestObj();
					var suiteTwo = returnVar.suite;
					
					testSingleSuiteRun(
						testName+" - two nested suites",
						{
							next:
							[
								"first nested suite", suiteOne,
								"second nested suite", suiteTwo
							]
						},
						function( suiteRun )
						{
							cbThree( suiteRun.next[ 0 ] );
							cbThree( suiteRun.next[ 1 ] );
						}
					);
				}
			);
		}
	);
});


// testing simple suites with topic and vows

testSuiteRun(
	"healthy topic with single vow",
	function()
	{
		var alphaTopicArgs = undefined;
		
		return(
			{
				suite:
				{
					topic:
					function()
					{
						alphaTopicArgs = arguments;
						
						return "dango";
					},
					argsVer:[ "str" ],
					vows:[ "dongo", healthyFunc ]
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						run.topic.thrownErr === undefined &&
						run.topic.err === undefined &&
						run.topic.result.length === 1 &&
						run.topic.result[ 0 ] === "dango" &&
						run.vows.length === 1 &&
						run.vows[ 0 ].err === undefined &&
						alphaTopicArgs.length === 0,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy topic with healthy and faulty vow",
	{
		topic: function() { return "dango"; },
		argsVer: [ "str" ],
		vows:
		[
			"dongo", healthyFunc,
			"dengo", faultyFunc
		]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.thrownErr === undefined &&
			run.topic.err === undefined &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dango" &&
			run.vows.length === 2 &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 1 ].err.constructor === TestingError,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topic with faulty vow",
	{
		topic: faultyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dongo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.thrownErr === undefined &&
			run.topic.result === undefined &&
			run.vows.length === 1 &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topic (tries to getCb()) with faulty vow",
	{
		topic:
		function()
		{
			this.getCb();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dongo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.err instanceof Error === true &&
			run.topic.thrownErr === undefined &&
			run.topic.result === undefined &&
			run.vows.length === 1 &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing simple suites with topicCb and vows

testSuiteRun(
	"faulty topicCb (tries to return var) with faulty vow",
	{
		topicCb: function() { return "dingo" },
		argsVer: getV().setE( "any" ),
		vows:[ "dongo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.vows.length === 1 &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined
			,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb giving no args and args received by "+
	"two vows",
	function()
	{
		var alphaVowArgsOne = undefined;
		var alphaVowArgsTwo = undefined;
		
		return(
		{
			suite:
			{
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					cb();
				},
				argsVer: [],
				vows:[
					"dingo",
					function()
					{
						alphaVowArgsOne = arguments;
					},
					"dango",
					function()
					{
						alphaVowArgsTwo = arguments;
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.topic.err === undefined &&
					run.topic.result.length === 0 &&
					run.topic.thrownErr === undefined &&
					run.vows[ 0 ].stepOk === true &&
					run.vows[ 0 ].err === undefined &&
					run.vows[ 1 ].stepOk === true &&
					run.vows[ 1 ].err === undefined &&
					alphaVowArgsOne.length === 0 &&
					alphaVowArgsTwo.length === 0,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy topicCb giving four args and args received "+
	"by two vows",
	function()
	{
		var betaVowArgsOne = undefined;
		var betaVowArgsTwo = undefined;
		
		return(
		{
			suite:
			{
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					cb( "dingo", "dango", "dongo", "dingi" );
				},
				argsVer: [ "str", "str", "str", "str" ],
				vows:[
					"dingo",
					function()
					{
						betaVowArgsOne = arguments;
					},
					"dango",
					function()
					{
						betaVowArgsTwo = arguments;
					}
				]
			},
			cb:
			function( run )
			{
				var res = run.topic.result;
				var argsOne = betaVowArgsOne;
				var argsTwo = betaVowArgsTwo;
				
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.topic.err === undefined &&
					run.topic.thrownErr === undefined &&
					run.vows[ 0 ].stepOk === true &&
					run.vows[ 1 ].stepOk === true &&
					run.vows[ 0 ].err === undefined &&
					run.vows[ 1 ].err === undefined &&
					res.length === 4 &&
					betaVowArgsOne.length === 4 &&
					betaVowArgsTwo.length === 4 &&
					res[ 0 ] === "dingo" &&
					argsOne[ 0 ] === "dingo" &&
					argsTwo[ 0 ] === "dingo" &&
					res[ 1 ] === "dango" &&
					argsOne[ 1 ] === "dango" &&
					argsTwo[ 1 ] === "dango" &&
					res[ 2 ] === "dongo" &&
					argsOne[ 2 ] === "dongo" &&
					argsTwo[ 2 ] === "dongo" &&
					res[ 3 ] === "dingi" &&
					argsOne[ 3 ] === "dingi" &&
					argsTwo[ 3 ] === "dingi",
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy topicCb with call cb() and with faulty vow "+
	"and healthy vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
		},
		argsVer: [],
		vows:[
			"dingo", faultyFunc,
			"dango", healthyFunc
		]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.vows[ 0 ].stepOk === false &&
			run.vows[ 0 ].err.constructor === TestingError &&
			run.vows[ 1 ].stepOk === true &&
			run.vows[ 1 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb (err via cb) with faulty vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
		},
		argsVer: getV().setE( "any" ),
		vows: [ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.thrownErr === undefined &&
			run.topic.cbErr === undefined &&
			run.topic.result === undefined &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb() and with "+
	"faulty vow and healthy vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
		},
		argsVer:[],
		vows:
		[
			"dingo", faultyFunc,
			"dango", healthyFunc
		]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.result.length === 0 &&
			run.vows[ 0 ].stepOk === false &&
			run.vows[ 0 ].err.constructor === TestingError &&
			run.vows[ 1 ].stepOk === true &&
			run.vows[ 1 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb (err via delayed cb) with faulty vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				100
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with err and bool via cb and faulty vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError(), true );
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.result === undefined &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with err and bool via delayed cb and "+
	"faulty cancelled vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( new TestingError(), true );
				},
				100
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

// testing suites with topicCb that signals it is done many times
// by a combination of call(s) to cb() and throwing err

testSuiteRun(
	"faulty topicCb with cb(err) followed by "+
	"throwing an err and faulty cancelled vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError( undefined, undefined, "cbErr" ) );
			
			throw new TestingError(
				undefined, undefined, "thrownErr"
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.err.ourGlobeCode === "thrownErr" &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with thrown err followed by delayed "+
	"cb(err) and faulty cancelled vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb(
						new TestingError( undefined, undefined, "cbErr" )
					);
				},
				100
			);
			
			throw new TestingError(
				undefined, undefined, "thrownErr"
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.err.ourGlobeCode === "thrownErr" &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

expectSuiteCbErr(
	"faulty topicCb with two calls to cb() (gives err) and "+
	"another faulty topicCb with calls to cb(err) and "+
	"delayed cb() (no errs)",
	SuiteRuntimeError,
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			
			cb();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	}
);

expectSuiteCbErr(
	"faulty topicCb calling direct cb(err) and direct cb() "+
	"(gives err) and another faulty topicCb calling cb(err) "+
	"and cb(err) (no errs)",
	SuiteRuntimeError,
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
			
			cb();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				100
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	}
);

expectSuiteCbErr(
	"faulty topicCb with two calls to delayed cb() "+
	"(gives err) and another faulty topicCb throwing err and "+
	"calling delayed cb() (no err)",
	SuiteRuntimeError,
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
			
			setTimeout(
				function()
				{
					cb();
				},
				200
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	}
);

// testing suites with topicCb that doesnt call cb() within
// allowed timeout limit

testSuiteRun(
	"faulty topicCb with no call to cb() and faulty "+
	"cancelled vow",
	{
		topicCb: healthyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with no call to cb() within timeout limit "+
	"and delayed call cb() and cb(err) and faulty cancelled vow",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+100
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing suite step argsVer (using suites with both topic and
// topicCb)

testSuiteRun(
	"healthy topic that returns undef and upholds argsVer",
	{
		topic: healthyFunc,
		argsVer: [ "undef" ],
		vows: [ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === undefined &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic that returns 'dingo' and upholds argsVer",
	{
		topic:
		function()
		{
			return "dingo";
		},
		argsVer: getV( [ { values:[ "dingo" ] } ] ),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dingo" &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic that returns 'dingo' and doesnt uphold argsVer",
	{
		topic:
		function()
		{
			return "dingo";
		},
		argsVer: getV( [ { values:[ "dengo" ] } ] ),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dingo" &&
			run.argsVer.stepOk === false &&
			run.argsVer.err.constructor === SuiteRuntimeError &&
			run.argsVer.err.ourGlobeCode === "ArgsAreNotValid" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb() that upholds argsVer",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
		},
		argsVer: getV( [ "str" ] ).addA(),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb('dingo',42,true) that "+
	"upholds argsVer with multiple args",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( "dingo", 42, true );
				},
				100
			);
		},
		argsVer: getV( [ "str" ] ).addA( "str", "int", "bool" ),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb('dengo') that fails "+
	"argsVer with multiple args",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( "dengo" );
				},
				100
			);
		},
		argsVer: getV( [] ).addA( "int" ).addA( "bool" ),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === false &&
			run.argsVer.err.constructor === SuiteRuntimeError &&
			run.argsVer.err.ourGlobeCode === "ArgsAreNotValid" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing suites where suite prop conf forbids suite step
// argsVer

testSuiteRun(
	"healthy topic and vow with no argsVer",
	{
		conf:
		{
			verifyArgs: false
		},
		topic:
		function()
		{
			return "dingo";
		},
		argsVer: undefined,
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

// testing that err thrown by cb given to SuiteRuns bubble up
// through suite steps that use direct call to their own cb funcs
// and that err reaches the call of SuiteRun.run()

expectErr(
	"SuiteRun given faulty cb and topicCb with direct call of cb "+
	"(gives err) and SuiteRun given healthy cb "+
	"(no err)",
	TestingError,
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					vows:[ "dingo", healthyFunc ]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						throw err;
					}
					
					throw new TestingError();
				}
			)
		;
	},
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					vows:[ "dingo", healthyFunc ]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						throw err;
					}
				}
			)
		;
	}
);

expectErr(
	"SuiteRun given faulty cb and nested suites with topicCbs "+
	"with direct calls cb() (gives err) and SuiteRun given "+
	"healthy cb (no err)",
	TestingError,
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					next:
					[
						"suite",
						{
							topicCb:
							function()
							{
								var cb = this.getCb();
								
								cb();
							},
							argsVer:[],
							vows:[ "dingo", healthyFunc ]
						}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						throw err;
					}
					
					throw new TestingError();
				}
			)
		;
	},
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					next:
					[
						"suite",
						{
							topicCb:
							function()
							{
								var cb = this.getCb();
								
								cb();
							},
							argsVer:[],
							vows:[ "dingo", healthyFunc ]
						}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						throw err;
					}
				}
			)
		;
	}
);

// testing suites with conf prop allowThrownErr set and topic
// that throws err

testSuiteRun(
	"faulty topic allowed to throw err with healthy vow",
	function()
	{
		var charlieVowArgs = undefined;
		
		return(
		{
			suite:
			{
				conf:
				{
					allowThrownErr: true
				},
				topic: faultyFunc,
				argsVer:[ TestingError ],
				vows:
				[
					"dingo",
					function( err )
					{
						charlieVowArgs = arguments;
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.topic.err === undefined &&
					run.topic.thrownErr.constructor === TestingError &&
					run.topic.result.length === 1 &&
					run.topic.result[ 0 ].constructor === TestingError &&
					run.argsVer.stepOk === true &&
					run.vows[ 0 ].stepOk === true &&
					charlieVowArgs.length === 1 &&
					charlieVowArgs[ 0 ].constructor === TestingError,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"faulty topic allowed to throw err but fails argsVer",
	{
		conf:
		{
			allowThrownErr: true
		},
		topic: faultyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.thrownErr.constructor === TestingError &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ].constructor === TestingError &&
			run.argsVer.stepOk === false &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing suites where topicCb is allowed to throw err and/or
// give cb err and where topicCb throws err or gives cb err

testSuiteRun(
	"faulty topicCb allowed to pass err to cb and healthy vow",
	function()
	{
		var deltaVowArgs = undefined;
		
		return(
		{
			suite:
			{
				conf:
				{
					allowCbErr: true
				},
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					setTimeout(
						function()
						{
							cb( new TestingError() );
						},
						100
					);
				},
				argsVer:[ TestingError ],
				vows:
				[
					"dingo",
					function( err )
					{
						deltaVowArgs = arguments;
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.topic.err === undefined &&
					run.topic.cbErr.constructor === TestingError &&
					run.topic.result.length === 1 &&
					run.topic.result[ 0 ].constructor === TestingError &&
					run.argsVer.stepOk === true &&
					run.vows[ 0 ].stepOk === true &&
					deltaVowArgs.length === 1 &&
					deltaVowArgs[ 0 ].constructor === TestingError,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"faulty topicCb throws allowed err and calls cb",
	{
		conf:
		{
			allowThrownErr: true
		},
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			
			throw new TestingError();
		},
		argsVer: getV().addA( TestingError ).addA(),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "ErrThrownAndCbCalled" &&
			run.topic.result === undefined &&
			run.topic.thrownErr === undefined &&
			run.topic.cbErr === undefined &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

expectSuiteCbErr(
	"faulty topicCb allowed to throw err but calls delayed cb "+
	"too (gives err) and faulty topicCb throws unallowed err",
	SuiteRuntimeError,
	{
		conf:
		{
			allowThrownErr: true
		},
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				100
			);
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	}
);

testSuiteRun(
	"faulty topicCb allowed to throw err but instead gives err "+
	"to cb and healthy vow",
	{
		conf:
		{
			allowThrownErr: true
		},
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				100
			);
		},
		argsVer:[ TestingError ],
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.result === undefined &&
			run.topic.cbErr === undefined &&
			run.topic.thrownErr === undefined &&
			run.argsVer.stepOk === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb allowed to give err to cb but instead "+
	"throws err and healthy vow",
	{
		conf:
		{
			allowCbErr: true
		},
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError( undefined, undefined, "cbErr" ) );
			
			throw new TestingError(
				undefined, undefined, "thrownErr"
			);
		},
		argsVer:[ TestingError ],
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.err.ourGlobeCode === "thrownErr" &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb allowed to throw and give err to cb but "+
	"never calls cb and healthy vow",
	{
		conf:
		{
			allowThrownErr: true,
			allowCbErr: true
		},
		topicCb: healthyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", healthyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing suites with child suites where it is alternated if
// parent or child suite has/hasnt a topic

testSuiteRun(
	"healthy suite with healthy child suite",
	function()
	{
		var betaTopicArgs = undefined;
		
		return(
		{
			suite:
			{
				topic: healthyFunc,
				argsVer:[ "undef" ],
				vows:[ "dingo", healthyFunc ],
				next:
				[
					"dingo",
					{
						topic:
						function()
						{
							betaTopicArgs = arguments;
						},
						argsVer:[ "undef" ],
						vows:[ "dingo", healthyFunc ]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.argsVer.stepOk === true &&
					run.vows[ 0 ].stepOk === true &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					betaTopicArgs.length === 1 &&
					betaTopicArgs[ 0 ] === undefined,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topic passes arg to healthy child suite",
	function()
	{
		var charlieTopicArgs = undefined;
		
		return(
		{
			suite:
			{
				topic:
				function()
				{
					return "dango";
				},
				argsVer:[ "str" ],
				vows:[ "dingo", healthyFunc ],
				next:
				[
					"dingo",
					{
						topic:
						function()
						{
							charlieTopicArgs = arguments;
						},
						argsVer:[ "undef" ],
						vows:[ "dingo", healthyFunc ]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.argsVer.stepOk === true &&
					run.vows[ 0 ].stepOk === true &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					charlieTopicArgs.length === 1 &&
					charlieTopicArgs[ 0 ] === "dango",
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topicCb passes arg to healthy child suite",
	function()
	{
		var deltaTopicArgs = undefined;
		
		return(
		{
			suite:
			{
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					cb( "dingo", "dango", "dongo" );
				},
				argsVer:[ "str", "str", "str" ],
				vows:[ "dingo", healthyFunc ],
				next:
				[
					"dingo",
					{
						topic:
						function()
						{
							deltaTopicArgs = arguments;
						},
						argsVer:[ "undef" ],
						vows:[ "dingo", healthyFunc ]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.argsVer.stepOk === true &&
					run.vows[ 0 ].stepOk === true &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					deltaTopicArgs.length === 3 &&
					deltaTopicArgs[ 0 ] === "dingo" &&
					deltaTopicArgs[ 1 ] === "dango" &&
					deltaTopicArgs[ 2 ] === "dongo",
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with delayed topicCb passes arg to healthy "+
	"child suite",
	function()
	{
		var echoTopicArgs = undefined;
		
		return(
		{
			suite:
			{
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					setTimeout(
						function()
						{
							cb( "dingo", "dango", "dongo" );
						},
						100
					);
				},
				argsVer:[ "str", "str", "str" ],
				vows:[ "dingo", healthyFunc ],
				next:
				[
					"dingo",
					{
						topic:
						function()
						{
							echoTopicArgs = arguments;
						},
						argsVer:[ "undef" ],
						vows:[ "dingo", healthyFunc ]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.argsVer.stepOk === true &&
					run.vows[ 0 ].stepOk === true &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					echoTopicArgs.length === 3 &&
					echoTopicArgs[ 0 ] === "dingo" &&
					echoTopicArgs[ 1 ] === "dango" &&
					echoTopicArgs[ 2 ] === "dongo",
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"faulty suite with faulty vow and cancelled child suite",
	{
		topic: healthyFunc,
		argsVer:[ "undef" ],
		vows:[
			"dengo", faultyFunc,
			"dango", healthyFunc
		],
		next:
		[
			"dingo",
			{
				topic: healthyFunc,
				argsVer:[ "undef" ],
				vows:[ "dingo", healthyFunc ]
			}
		]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.vows[ 0 ].stepOk === false &&
			run.vows[ 1 ].stepOk === true &&
			run.next.length === 0,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy suite with no topic and healthy child suite",
	function()
	{
		var fargoTopicArgs = undefined;
		
		return(
		{
			suite:
			{
				next:
				[
					"dingo",
					{
						topic:
						function()
						{
							fargoTopicArgs = arguments;
						},
						argsVer:[ "undef" ],
						vows:[ "dingo", healthyFunc ]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.topic.stepOk === true &&
					run.topic.result.length === 0 &&
					run.topic.thrownErr === undefined &&
					run.topic.cbErr === undefined &&
					run.argsVer.stepOk === true &&
					run.vows.length === 0 &&
					run.next.length === 1 &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows.length === 1 &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					fargoTopicArgs.length === 0,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topic passing args to healthy child "+
	"suite with no topic",
	function()
	{
		var echoVowArgs = undefined;
		
		return(
		{
			suite:
			{
				topic:
				function()
				{
					return "dingo";
				},
				argsVer:[ "str" ],
				next:
				[
					"dingo",
					{
						argsVer:[ "str" ],
						vows:
						[
							"dingo",
							function()
							{
								echoVowArgs = arguments;
							}
						]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.next.length === 1 &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].topic.result.length === 1 &&
					run.next[ 0 ].topic.result[ 0 ] === "dingo" &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows.length === 1 &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					echoVowArgs.length === 1 &&
					echoVowArgs[ 0 ] === "dingo",
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topicCb passing args to healthy child "+
	"suite with no topic",
	function()
	{
		var fargoVowArgs = undefined;
		
		return(
		{
			suite:
			{
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					cb( "dingo", "dango" );
				},
				argsVer:[ "str", "str" ],
				next:
				[
					"dingo",
					{
						argsVer:[ "str", "str" ],
						vows:
						[
							"dingo",
							function()
							{
								fargoVowArgs = arguments;
							}
						]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.next.length === 1 &&
					run.next[ 0 ].runOk === true &&
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].topic.result.length === 2 &&
					run.next[ 0 ].topic.result[ 0 ] === "dingo" &&
					run.next[ 0 ].topic.result[ 1 ] === "dango" &&
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].vows.length === 1 &&
					run.next[ 0 ].vows[ 0 ].stepOk === true &&
					fargoVowArgs.length === 2 &&
					fargoVowArgs[ 0 ] === "dingo" &&
					fargoVowArgs[ 1 ] === "dango",
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topicCb passing args to faulty child "+
	"suite with argsVer that wont approve",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( "dingo", "dango" );
		},
		argsVer:[ "str", "str" ],
		next:
		[
			"dingo",
			{
				argsVer:[ "str", "int" ],
				vows:[ "dingo", healthyFunc ]
			}
		]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.next.length === 1 &&
			run.next[ 0 ].runOk === false &&
			run.next[ 0 ].topic.stepOk === true &&
			run.next[ 0 ].argsVer.stepOk === false &&
			run.next[ 0 ].vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing suites where parent suite has topic/topicCb that
// throws err or gives cb err and where child suite receives the
// resulting err from the parent suite, sometimes the child suite
// has no topic/topicCb

testSuiteRun(
	"healthy suite with topic throwing allowed err and healthy "+
	"child suite",
	function()
	{
		var gammaVowArgs = undefined;
		
		return({
			suite:
			{
				conf:{ allowThrownErr: true },
				topic: faultyFunc,
				argsVer:[ TestingError ],
				next:
				[
					"dingo",
					{
						argsVer:[ TestingError ],
						vows:
						[
							"dingo",
							function()
							{
								gammaVowArgs = arguments;
							}
						]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.next.length === 1 &&
					run.next[ 0 ].runOk === true &&
					gammaVowArgs.length === 1 &&
					gammaVowArgs[ 0 ].constructor === TestingError,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topicCb giving allowed cb err and "+
	"healthy child suite",
	function()
	{
		var heroVowArgs = undefined;
		
		return({
			suite:
			{
				conf:{ allowCbErr: true },
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					cb( new TestingError() );
				},
				argsVer:[ TestingError ],
				next:
				[
					"dingo",
					{
						argsVer:[ TestingError ],
						vows:
						[
							"dingo",
							function()
							{
								heroVowArgs = arguments;
							}
						]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.next.length === 1 &&
					run.next[ 0 ].runOk === true &&
					heroVowArgs.length === 1 &&
					heroVowArgs[ 0 ].constructor === TestingError,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topic throwing allowed err and healthy "+
	"child suite with topic that doesnt allow err",
	function()
	{
		var gammaTopicArgs = undefined;
		
		return(
		{
			suite:
			{
				conf:{ allowThrownErr: true },
				topic: faultyFunc,
				argsVer:[ TestingError ],
				next:
				[
					"dingo",
					{
						conf:{ allowThrownErr: false },
						topic:
						function()
						{
							gammaTopicArgs = arguments;
						},
						argsVer:[ "undef" ],
						vows:[ "dingo", healthyFunc ]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === true &&
					run.next.length === 1 &&
					run.next[ 0 ].runOk === true &&
					gammaTopicArgs.length === 1 &&
					gammaTopicArgs[ 0 ].constructor === TestingError,
					"run result is invalid"
				);
			}
		});
	}
);

testSuiteRun(
	"healthy suite with topicCb (that gives allowed err) and two "+
	"child suites, one with topic and both with healthy and "+
	"faulty vows",
	function()
	{
		var topicArgsOne = undefined;
		var vowArgsOne = undefined;
		var vowArgsTwo = undefined;
		var vowArgsThree = undefined;
		var vowArgsFour = undefined;
		
		return(
		{
			suite:
			{
				conf:{ allowCbErr: true },
				topicCb:
				function()
				{
					var cb = this.getCb();
					
					cb( new TestingError(), [ "dingo" ], {} )
				},
				argsVer:[ TestingError, "arr", "obj" ],
				next:
				[
					"dingo",
					{
						topic:
						function()
						{
							topicArgsOne = arguments;
							
							return healthyFunc;
						},
						argsVer:[ "func" ],
						vows:
						[
							"dingo",
							function()
							{
								vowArgsOne = arguments;
								
								throw new TestingError();
							},
							"dango",
							function()
							{
								vowArgsTwo = arguments;
							},
						]
					},
					"dango",
					{
						argsVer:[ TestingError, "arr", "obj" ],
						vows:
						[
							"dingo",
							function()
							{
								vowArgsThree = arguments;
							},
							"dango",
							function()
							{
								vowArgsFour = arguments;
							},
						]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					run.runOk === false &&
					
					run.topic.stepOk === true &&
					run.topic.thrownErr === undefined &&
					run.topic.cbErr.constructor === TestingError &&
					run.topic.err === undefined &&
					
					run.argsVer.stepOk === true &&
					run.argsVer.err === undefined &&
					
					run.vows.length === 0 &&
					run.next.length === 2 &&
					
					run.next[ 0 ].runOk === false &&
					
					run.next[ 0 ].topic.stepOk === true &&
					run.next[ 0 ].topic.result.length === 1 &&
					sys.hasType(
						run.next[ 0 ].topic.result[ 0 ], "func"
					)
					&&
					topicArgsOne.length === 3 &&
					topicArgsOne[ 0 ].constructor === TestingError &&
					sys.hasType( topicArgsOne[ 1 ], "arr" ) &&
					sys.hasType( topicArgsOne[ 2 ], "obj" ) &&
					
					run.next[ 0 ].argsVer.stepOk === true &&
					run.next[ 0 ].argsVer.err === undefined &&
					
					run.next[ 0 ].vows.length === 2 &&
					
					run.next[ 0 ].vows[ 0 ].stepOk === false &&
					run.next[ 0 ].vows[ 0 ].err.constructor ===
						TestingError
					&&
					
					vowArgsOne.length === 1 &&
					sys.hasType( vowArgsOne[ 0 ], "func" ) &&
					
					vowArgsTwo.length === 1 &&
					sys.hasType( vowArgsTwo[ 0 ], "func" ) &&
					
					run.next[ 0 ].vows[ 1 ].stepOk === true &&
					run.next[ 0 ].vows[ 1 ].err === undefined &&
					
					run.next[ 1 ].runOk === true &&
					
					run.next[ 1 ].topic.stepOk === true &&
					run.next[ 1 ].topic.result.length === 3 &&
					run.next[ 1 ].topic.result[ 0 ].constructor ===
						TestingError
					&&
					sys.hasType( run.next[ 1 ].topic.result[ 1 ], "arr" )
					&&
					sys.hasType( run.next[ 1 ].topic.result[ 2 ], "obj" )
					&&
					
					run.next[ 1 ].argsVer.stepOk === true &&
					
					run.next[ 1 ].vows[ 0 ].stepOk === true &&
					vowArgsThree.length === 3 &&
					vowArgsThree[ 0 ].constructor === TestingError &&
					sys.hasType( vowArgsThree[ 1 ], "arr" ) &&
					sys.hasType( vowArgsThree[ 2 ], "obj" ) &&
					
					run.next[ 1 ].vows[ 1 ].stepOk === true &&
					vowArgsFour.length === 3 &&
					vowArgsFour[ 0 ].constructor === TestingError &&
					sys.hasType( vowArgsFour[ 1 ], "arr" ) &&
					sys.hasType( vowArgsFour[ 2 ], "obj" ),
					"run result is invalid"
				);
			}
		});
	}
);

// testing suites that use get() and set() in many suite steps to
// handle the suite prop local and that have child suites that in
// turn handle parent suite's prop local or their own prop local
// instead

testSuiteRun(
	"suite that uses get()/set() to handle local var, and one "+
	"nested suite that handles outer local var and another "+
	"nested suite that handles itw own local vars with a vow "+
	"that fails on reading a local var that doesnt exist",
	function()
	{
		var topicOneBefore = undefined;
		var topicOneAfter = undefined;
		var topicTwoBefore = undefined;
		var topicTwoAfter = undefined;
		var topicThreeBefore = undefined;
		var topicThreeAfter = undefined;
		var vowOneBefore = undefined;
		var vowOneAfter = undefined;
		var vowTwoBefore = undefined;
		var vowTwoAfter = undefined;
		var vowThreeBefore = undefined;
		var vowThreeAfter = undefined;
		var vowFourBefore = undefined;
		var vowFourAfter = undefined;
		var vowFiveBefore = undefined;
		var vowFiveAfter = undefined;
		
		return(
		{
			suite:
			{
				local:
				{
					dingo: "topicOneGoesFirst"
				},
				topic:
				function()
				{
					topicOneBefore = this.get( "dingo" );
					
					this.set( "dingo", "toBeOverWritten" );
					this.set( "dingo", "toBeOverWrittenAgain" );
					this.set( "dingo", "topicOneWasHere" );
					
					topicOneAfter = this.get( "dingo" );
				},
				argsVer:[ "undef" ],
				vows:
				[
					"vow one",
					function()
					{
						vowOneBefore = this.get( "dingo" );
						this.set( "dingo", "vowOneWasHere" );
						vowOneAfter = this.get( "dingo" );
					},
					"vow two",
					function()
					{
						vowTwoBefore = this.get( "dingo" );
						this.set( "dingo", "vowTwoWasHere" );
						vowTwoAfter = this.get( "dingo" );
					}
				],
				next:
				[
					"next suite one",
					{
						topicCb:
						function()
						{
							topicTwoBefore = this.get( "dingo" );
							this.set( "dingo", "localTopicTwoWasHere" );
							topicTwoAfter = this.get( "dingo" );
							
							var topicCb = this;
							
							setTimeout(
								function()
								{
									topicThreeBefore = topicCb.get( "dingo" );
									
									topicCb.set(
										"dingo", "will be overwritten"
									);
									topicCb.set(
										"dingo", "localTopicThreeWasHere"
									);
									
									topicThreeAfter = topicCb.get( "dingo" );
									
									var cb = topicCb.getCb();
									cb();
								},
								100
							);
						},
						argsVer:[],
						vows:
						[
							"local vow three",
							function()
							{
								vowThreeBefore = this.get( "dingo" );
								this.set( "dingo", "localVowThreeWasHere" );
								vowThreeAfter = this.get( "dingo" );
							}
						]
					},
					"next suite two",
					{
						local:
						{
							dingo: "localTopicFourGoesFirst",
							dango: "localVowFiveGoesFirst"
						},
						topic:
						function()
						{
							topicFourBefore = this.get( "dingo" );
							this.set( "dingo", "localTopicFourWasHere" );
							topicFourAfter = this.get( "dingo" );
						},
						argsVer:[ "undef" ],
						vows:
						[
							"local vow four",
							function()
							{
								vowFourBefore = this.get( "dingo" );
								this.set( "dingo", "localVowFourWasHere" );
								vowFourAfter = this.get( "dingo" );
							},
							"local vow five",
							function()
							{
								vowFiveBefore = this.get( "dango" );
								
								this.set( "dango", "will be overwritten..." );
								this.set( "dango", "localVowFiveWasHere" );
								
								vowFiveAfter = this.get( "dango" );
							},
							"failing local vow six",
							function()
							{
								this.get( "dengo" );
							}
						]
					}
				]
			},
			cb:
			function( run )
			{
				assert(
					topicOneBefore === "topicOneGoesFirst" &&
					topicOneAfter === "topicOneWasHere" &&
					vowOneBefore === "topicOneWasHere" &&
					vowOneAfter === "vowOneWasHere" &&
					vowTwoBefore === "vowOneWasHere" &&
					vowTwoAfter === "vowTwoWasHere" &&
					topicTwoBefore === "vowTwoWasHere" &&
					topicTwoAfter === "localTopicTwoWasHere" &&
					topicThreeBefore === "localTopicTwoWasHere" &&
					topicThreeAfter === "localTopicThreeWasHere" &&
					vowThreeBefore === "localTopicThreeWasHere" &&
					vowThreeAfter === "localVowThreeWasHere" &&
					topicFourBefore === "localTopicFourGoesFirst" &&
					topicFourAfter === "localTopicFourWasHere" &&
					vowFourBefore === "localTopicFourWasHere" &&
					vowFourAfter === "localVowFourWasHere" &&
					vowFiveBefore === "localVowFiveGoesFirst" &&
					vowFiveAfter === "localVowFiveWasHere" &&
					run.next[ 1 ].vows[ 2 ].stepOk === false,
					"run result is invalid"
				);
			}
		});
	}
);

// testing suites where suite checks if it hasParent() and reads
// parent suite result if there is a parent

testSuiteRun(
	"healthy suites at many levels that check if they hasParent()",
	false,
	function()
	{
		var topicHasParent = undefined;
		var vowOneHasParent = undefined;
		var suiteOneTopicHasParent = undefined;
		var suiteOneVowOneHasParent = undefined;
		
		return(
			{
				suite:
				{
					topic:
					function()
					{
						topicHasParent = this.hasParent();
					},
					argsVer:[ "undef" ],
					vows:
					[
						"vowOne",
						function()
						{
							vowOneHasParent = this.hasParent();
						}
					],
					next:
					[
						"suiteOne",
						{
							topic:
							function()
							{
								suiteOneTopicHasParent = this.hasParent();
							},
							argsVer:[ "undef" ],
							vows:
							[
								"suiteOneVowOne",
								function()
								{
									suiteOneVowOneHasParent = this.hasParent();
								}
							]
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						topicHasParent === false &&
						vowOneHasParent === false &&
						suiteOneTopicHasParent === true &&
						suiteOneVowOneHasParent === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with healthy child suites that getParent() "+
	"and read parent suite results at various suite steps and "+
	"another level of child suites that in turn getParent() and "+
	"read parent suite results",
	function()
	{
		var suiteOneTopicParentRes = undefined;
		var suiteOneTopicParentErrOccurred = undefined;
		var suiteOneTopicParentErrThrown = undefined;
		
		var suiteOneOneTopicParentRes = undefined;
		var suiteOneOneTopicParentErrOccurred = undefined;
		var suiteOneOneTopicParentErrThrown = undefined;
		
		var suiteOneVowOneParentRes = undefined;
		var suiteOneVowOneParentErrOccurred = undefined;
		var suiteOneVowOneParentErrThrown = undefined;
		
		var suiteTwoOneTopicParentRes = undefined;
		var suiteTwoOneTopicParentErrOccurred = undefined;
		var suiteTwoOneTopicParentErrThrown = undefined;
		
		return(
			{
				suite:
				{
					topic:
					function()
					{
						return "dingo";
					},
					argsVer:[ "str" ],
					next:
					[
// suite reads parent results in steps topic and vow
						"suite one",
						{
							conf:
							{
								allowCbErr: true
							},
							topicCb:
							function()
							{
								var parent = this.getParent();
								
								suiteOneTopicParentRes = parent.getTopicRes();
								suiteOneTopicParentErrOccurred =
									parent.errOccurred()
								;
								suiteOneTopicParentErrThrown =
									parent.errThrown()
								;
								
								var cb = this.getCb();
								
// gives cb err so child suite can test this result
								cb( new TestingError() );
							},
							argsVer:[ TestingError ],
							vows:
							[
								"suite one vow one",
								function()
								{
									var parent = this.getParent();
									
									suiteOneVowOneParentRes = parent.getTopicRes();
									suiteOneVowOneParentErrOccurred =
										parent.errOccurred()
									;
									suiteOneVowOneParentErrThrown =
										parent.errThrown()
									;
								}
							],
							next:
							[
// suite reads parent results in topic
								"suite one one",
								{
									topic:
									function()
									{
										var parent = this.getParent();
										
										suiteOneOneTopicParentRes =
											parent.getTopicRes()
										;
										suiteOneOneTopicParentErrOccurred =
											parent.errOccurred()
										;
										suiteOneOneTopicParentErrThrown =
											parent.errThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite one one vow one", healthyFunc
									]
								}
							]
						},
// suite throws err in topic so child suite can test result
						"suite two",
						{
							conf:
							{
								allowThrownErr: true
							},
							topic:
							function()
							{
								throw new TestingError();
							},
							argsVer:[ TestingError ],
							next:
							[
// suite reads parent results in topic
								"suite two one",
								{
									topic:
									function()
									{
										var parent = this.getParent();
										
										suiteTwoOneTopicParentRes =
											parent.getTopicRes()
										;
										suiteTwoOneTopicParentErrOccurred =
											parent.errOccurred()
										;
										suiteTwoOneTopicParentErrThrown =
											parent.errThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite two one vow one", healthyFunc
									]
								}
							]
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						suiteOneTopicParentRes.length === 1 &&
						suiteOneTopicParentRes[ 0 ] === "dingo" &&
						suiteOneTopicParentErrOccurred === false &&
						suiteOneTopicParentErrThrown === false &&
						
						suiteOneVowOneParentRes.length === 1 &&
						suiteOneVowOneParentRes[ 0 ] === "dingo" &&
						suiteOneVowOneParentErrOccurred === false &&
						suiteOneVowOneParentErrThrown === false &&
						
						suiteOneOneTopicParentRes.length === 1 &&
						suiteOneOneTopicParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteOneOneTopicParentErrOccurred === true &&
						suiteOneOneTopicParentErrThrown === false &&
						
						suiteTwoOneTopicParentRes.length === 1 &&
						suiteTwoOneTopicParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteTwoOneTopicParentErrOccurred === true &&
						suiteTwoOneTopicParentErrThrown === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with topic that that throws allowed err "+
	"followed by child suite that has no topic followed "+
	"by another child suite that reads results propagated by "+
	"first suite",
	function()
	{
		var suiteOneOneTopicParentRes = undefined;
		var suiteOneOneTopicParentErrOccurred = undefined;
		var suiteOneOneTopicParentErrThrown = undefined;
		
		return(
			{
				suite:
				{
					conf:
					{
						allowThrownErr: true
					},
					topic:
					function()
					{
						throw new TestingError();
					},
					argsVer:[ TestingError ],
					next:
					[
// suite has no topic and so parent suite results are propagated
// to next child suite in line
						"suite one",
						{
							next:
							[
// suite reads results propagated by first suite
								"suite one one",
								{
									topic:
									function()
									{
										var parent = this.getParent();
										
										suiteOneOneTopicParentRes =
											parent.getTopicRes()
										;
										suiteOneOneTopicParentErrOccurred =
											parent.errOccurred()
										;
										suiteOneOneTopicParentErrThrown =
											parent.errThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite one one vow one", healthyFunc
									]
								}
							]
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						suiteOneOneTopicParentRes.length === 1 &&
						suiteOneOneTopicParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteOneOneTopicParentErrOccurred === true &&
						suiteOneOneTopicParentErrThrown === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with topicCb that gives allowed cbErr "+
	"followed by child suite that has no topic followed "+
	"by another child suite that reads results via getParent() "+
	"propagated by first suite",
	function()
	{
		var suiteOneOneTopicParentRes = undefined;
		var suiteOneOneTopicParentErrOccurred = undefined;
		var suiteOneOneTopicParentErrThrown = undefined;
		
		return(
			{
				suite:
				{
					conf:
					{
						allowCbErr: true
					},
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb( new TestingError() );
					},
					argsVer:[ TestingError ],
					next:
					[
// suite has no topic and so parent suite results are propagated
// to next child suite in line
						"suite one",
						{
							next:
							[
// suite reads results propagated by first suite
								"suite one one",
								{
									topic:
									function()
									{
										var parent = this.getParent();
										
										suiteOneOneTopicParentRes =
											parent.getTopicRes()
										;
										suiteOneOneTopicParentErrOccurred =
											parent.errOccurred()
										;
										suiteOneOneTopicParentErrThrown =
											parent.errThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite one one vow one", healthyFunc
									]
								}
							]
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						suiteOneOneTopicParentRes.length === 1 &&
						suiteOneOneTopicParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteOneOneTopicParentErrOccurred === true &&
						suiteOneOneTopicParentErrThrown === false,
						"run result is invalid"
					);
				}
			}
		);
	}
);

// testing suites where vows read their own suite's topic result

testSuiteRun(
	"healthy suite with vow that reads topic results and child "+
	"suites with vows that read topic results too",
	function()
	{
		var vowOneTopicRes = undefined;
		var vowOneErrThrown = undefined;
		var vowOneErrOccurred = undefined;
		
		var suiteOneVowOneTopicRes = undefined;
		var suiteOneVowOneErrThrown = undefined;
		var suiteOneVowOneErrOccurred = undefined;
		
		var suiteOneOneVowOneTopicRes = undefined;
		var suiteOneOneVowOneErrThrown = undefined;
		var suiteOneOneVowOneErrOccurred = undefined;
		
		var suiteTwoVowOneTopicRes = undefined;
		var suiteTwoVowOneErrThrown = undefined;
		var suiteTwoVowOneErrOccurred = undefined;
		
		var suiteTwoOneVowOneTopicRes = undefined;
		var suiteTwoOneVowOneErrThrown = undefined;
		var suiteTwoOneVowOneErrOccurred = undefined;
		
		return(
			{
// topic returns simple result and vow reads topic results
				suite:
				{
					topic:
					function()
					{
						return "dingo";
					},
					argsVer:[ "str" ],
					vows:
					[
						"vow one",
						function()
						{
							vowOneTopicRes = this.getTopicRes();
							vowOneErrOccurred = this.errOccurred();
							vowOneErrThrown = this.errThrown();
						}
					],
					next:
					[
// topic throws allowed err and vow reads topic results
						"suite one",
						{
							conf:
							{
								allowThrownErr: true
							},
							topic: faultyFunc,
							argsVer:[ TestingError ],
							vows:
							[
								"suite one vow one",
								function()
								{
									suiteOneVowOneTopicRes = this.getTopicRes();
									suiteOneVowOneErrOccurred = this.errOccurred();
									suiteOneVowOneErrThrown = this.errThrown();
								}
							],
							next:
							[
// suite has no topic so its vow reads topic res propagated by
// parent
								"suite one one",
								{
									vows:
									[
										"suite one one vow one",
										function()
										{
											suiteOneOneVowOneTopicRes =
												this.getTopicRes()
											;
											suiteOneOneVowOneErrOccurred =
												this.errOccurred()
											;
											suiteOneOneVowOneErrThrown =
												this.errThrown()
											;
										}
									]
								}
							]
						},
// topicCb gives allowed err and vow reads topic results
						"suite two",
						{
							conf:
							{
								allowCbErr: true
							},
							topicCb:
							function()
							{
								var cb = this.getCb();
								
								cb( new TestingError() );
							},
							argsVer:[ TestingError ],
							vows:
							[
								"suite two vow one",
								function()
								{
									suiteTwoVowOneTopicRes = this.getTopicRes();
									suiteTwoVowOneErrOccurred = this.errOccurred();
									suiteTwoVowOneErrThrown = this.errThrown();
								}
							],
							next:
							[
// suite has no topic so its vow reads topic res propagated by
// parent
								"suite two one",
								{
									vows:
									[
										"suite two one vow one",
										function()
										{
											suiteTwoOneVowOneTopicRes =
												this.getTopicRes()
											;
											suiteTwoOneVowOneErrOccurred =
												this.errOccurred()
											;
											suiteTwoOneVowOneErrThrown =
												this.errThrown()
											;
										}
									]
								}
							]
						},
// suite has no topic and vow reads topic results propagated from
// parent suite
						"suite three",
						{
							vows:
							[
								"suite two vow one",
								function()
								{
									suiteThreeVowOneTopicRes = this.getTopicRes();
									suiteThreeVowOneErrOccurred =
										this.errOccurred()
									;
									suiteThreeVowOneErrThrown = this.errThrown();
								}
							]
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						vowOneTopicRes.length === 1 &&
						vowOneTopicRes[ 0 ] === "dingo" &&
						vowOneErrOccurred === false &&
						vowOneErrThrown === false &&
						
						suiteOneVowOneTopicRes.length === 1 &&
						suiteOneVowOneTopicRes[ 0 ].constructor ===
							TestingError
						&&
						suiteOneVowOneErrOccurred === true &&
						suiteOneVowOneErrThrown === true &&
						
						suiteOneOneVowOneTopicRes.length ===
							suiteOneVowOneTopicRes.length
						&&
						suiteOneOneVowOneTopicRes[ 0 ].constructor ===
							suiteOneVowOneTopicRes[ 0 ].constructor
						&&
						suiteOneOneVowOneErrOccurred ===
							suiteOneVowOneErrOccurred
						&&
						suiteOneOneVowOneErrThrown ===
							suiteOneVowOneErrThrown
						&&
						
						suiteTwoVowOneTopicRes.length === 1 &&
						suiteTwoVowOneTopicRes[ 0 ].constructor ===
							TestingError
						&&
						suiteTwoVowOneErrOccurred === true &&
						suiteTwoVowOneErrThrown === false &&
						
						suiteTwoOneVowOneTopicRes.length ===
							suiteTwoVowOneTopicRes.length
						&&
						suiteTwoOneVowOneTopicRes[ 0 ].constructor ===
							suiteTwoVowOneTopicRes[ 0 ].constructor
						&&
						suiteTwoOneVowOneErrOccurred ===
							suiteTwoVowOneErrOccurred
						&&
						suiteTwoOneVowOneErrThrown ===
							suiteTwoOneVowOneErrThrown
						&&
						
						suiteThreeVowOneTopicRes.length === 1 &&
						suiteThreeVowOneTopicRes[ 0 ] === "dingo" &&
						suiteThreeVowOneErrOccurred === false &&
						suiteThreeVowOneErrThrown === false,
						"run result is invalid"
					);
				}
			}
		);
	}
);

});
