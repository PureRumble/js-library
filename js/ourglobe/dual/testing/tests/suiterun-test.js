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
var emptyFunc = function() {};
var undefVer = [ "undef" ];

var healthySuite =
{
	topic: emptyFunc,
	argsVer: [ "undef" ],
	vows:[ "dango", emptyFunc ]
};

var expectSingleSuiteCbErr =
getF(
getV()
	.addA( "str", "func", "str", "obj", "obj" ),
function(
	testName, errClass, errCode, faultySuite, healthySuite
)
{
	test.expectCbErr(
		testName,
		errClass,
		errCode,
		CbStep.DEFAULT_CB_TIMEOUT+2000,
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
	.addA( "str", "func", "str", "obj", "obj" ),
function(
	testName, errClass, errCode, faultySuiteObj, healthySuiteObj
)
{
	expectSingleSuiteCbErr(
		testName+" - plain suite",
		errClass,
		errCode,
		faultySuiteObj,
		healthySuiteObj
	);
	
	expectSingleSuiteCbErr(
		testName+" - nested suite",
		errClass,
		errCode,
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
		errCode,
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

var nrCurrentTests = 0;
var testStack = [];

function popTest()
{
	if( nrCurrentTests < 20 )
	{
		if( testStack.length > 0 )
		{
			nrCurrentTests++;
			
			var func = testStack.shift();
			
			func();
		}
	}
}

function pushTest( func )
{
	testStack.push( func );
	popTest();
}

function markStepDone()
{
	nrCurrentTests--;
	popTest();
}

var testSingleSuiteRun =
getF(
getV()
	.addA( "str", "obj", "func" ),
function( testName, suite, verify )
{
	var cbTime = CbStep.DEFAULT_CB_TIMEOUT+2000;
	
	var suiteRun =
		new SuiteRun( new SuiteHolder( "suite", suite ) )
	;
	
	console.log( testName );
	
	var cbCalled = false;
	
	var errPrefix =
		"An err occurred when testing '"+testName+"':\n"
	;
	
	pushTest(
	function()
	{
		try
		{
			suiteRun.run(
				getF(
				SuiteRun.RUN_CB_FV,
				function( err, resSuiteRun )
				{
					if( err !== undefined )
					{
						console.log( errPrefix );
						throw err;
					}
					
					if( cbCalled === true )
					{
						throw new TestRuntimeError(
							errPrefix+
							"The cb given to SuiteRun.run() has been called "+
							"twice",
							{ providedArgs: arguments }
						);
					}
					
					cbCalled = true;
					
					try
					{
						verify( suiteRun );
					}
					catch( e )
					{
						console.log( errPrefix );
						throw e;
					}
				})
			);
		}
		catch( e )
		{
			console.log( errPrefix );
			throw e;
		}
		
		setTimeout(
			function()
			{
				if( cbCalled === false )
				{
					console.log( errPrefix );
					throw new TestRuntimeError(
						"The cb given to SuiteRun.run() hasnt been called"
					);
				}
				
				markStepDone();
			},
			cbTime
		);
	});
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
					vows:[ "dongo", emptyFunc ]
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
			"dongo", emptyFunc,
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
			run.topic.thrownErr.constructor === TestingError &&
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
			run.topic.thrownErr instanceof Error === true &&
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
			"dango", emptyFunc
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
			run.topic.cbErr.constructor === TestingError &&
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
			"dango", emptyFunc
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

expectSuiteCbErr(
	"testing faulty topicCb with two direct calls to cb() "+
	"(terminates suite test with err) and another faulty topicCb "+
	"with direct call to cb() (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			cb();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb calling direct cb(err) and direct "+
	"cb() (terminates suite test with err) and another faulty "+
	"topicCb calling direct cb(err) (doesnt terminate test)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
			
			cb();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb with two delayed calls to cb() "+
	"(terminates suite test with err) and another faulty topicCb "+
	"calling delayed cb() (doesnt terminate test)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
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
				300
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
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
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb allowed to throw err and give cb err "+
	"and that throws err and calls direct cb() (terminates "+
	"suite test with err) and faulty topicCb that throws err "+
	"(doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		conf:
		{
			allowThrownErr: true,
			allowCbErr: true
		},
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb allowed to throw err and give cb err "+
	"and that throws err and calls delayed cb() (terminates "+
	"suite test with err) and faulty topicCb that throws err "+
	"(doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		conf:
		{
			allowThrownErr: true,
			allowCbErr: true
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
		vows:[ "dingo", emptyFunc ]
	},
	{
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb allowed to throw err and give cb err "+
	"and that throws err and gives delayed cb err (terminates "+
	"suite test with err) and faulty topicCb that gives delayed "+
	"cb err (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		conf:
		{
			allowThrownErr: true,
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
			
			throw new TestingError();
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
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
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb allowed to throw err and give cb "+
	"err but never calls cb within timeout limit and then gives "+
	"errs to two delayed cbs (terminates all tests with err) and "+
	"another faulty topicCb that also never calls cb within "+
	"allowed timeout period and then calls delayed cb (doesnt "+
	"terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		conf:
		{
			allowThrownErr: true,
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
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+1500
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
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
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty topicCb allowed to throw err and give cb "+
	"err and that makes multiple calls to delayed cbs with and "+
	"without errs (terminates all tests with err, but yields "+
	"only one such err) and another faulty topicCb that also "+
	"never calls cb within allowed timeout period and then calls "+
	"delayed cb (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		conf:
		{
			allowThrownErr: true,
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
				CbStep.DEFAULT_CB_TIMEOUT+100
			);
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+200
			);
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+300
			);
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+400
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
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
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		},
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

// testing suites with topicCb that doesnt call cb() within
// allowed timeout limit

testSuiteRun(
	"faulty topicCb with no call to cb() and faulty "+
	"cancelled vow",
	{
		topicCb: emptyFunc,
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
	"testing faulty topicCb with no call to cb() within timeout "+
	"limit and then delayed call cb() and faulty cancelled vow",
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
				CbStep.DEFAULT_CB_TIMEOUT+1000
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
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows: [ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
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

// testing that err thrown by cb given to SuiteRun bubble up
// through suite steps that use direct call to their own cb funcs
// and that the err reaches the call of SuiteRun.run()

expectErr(
	"Testing SuiteRun given a faulty cb when calling run(). "+
	"The suite is healthy and and it and its child suite have "+
	"all cb suite steps, and they all make direct calls to their "+
	"cb. Making sure the err thrown by the cb given to run() "+
	"bubbles all the way up, trough all cb suite steps, "+
	"to the call of run()",
	TestingError,
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					beforeCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					afterCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					vows:[ "dingo", emptyFunc ],
					next:
					[
						"suite one",
						{
							beforeCb:
							function()
							{
								var cb = this.getCb();
								
								cb();
							},
							topicCb:
							function()
							{
								var cb = this.getCb();
								
								cb();
							},
							afterCb:
							function()
							{
								var cb = this.getCb();
								
								cb();
							},
							argsVer:[],
							vows:[ "dingo", emptyFunc ]
						}
					]
				}
			)
		)
			.run(
				function( err, run )
				{
					if( err !== undefined )
					{
						throw err;
					}
					
// Making sure all cb suite steps were executed successfully.
// assert() throws a TestRuntimeError which this call to
// expectErr() doesnt expect
					assert(
						run.runOk === true &&
						run.before.stepOk === true &&
						run.topic.stepOk === true &&
						run.after.stepOk === true &&
						run.next[ 0 ].runOk === true &&
						run.next[ 0 ].before.stepOk === true &&
						run.next[ 0 ].topic.stepOk === true &&
						run.next[ 0 ].after.stepOk === true,
						"run result is invalid"
					);
					
					throw new TestingError();
				}
			)
		;
	},
	function() { }
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
		vows:[ "dingo", emptyFunc ]
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
		vows:[ "dingo", emptyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.result === undefined &&
			run.topic.cbErr.constructor === TestingError &&
			run.topic.thrownErr === undefined &&
			run.argsVer.stepOk === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"testing faulty topicCb and healthy vow where topicCb is "+
	"allowed to give cb err but instead throws err",
	{
		conf:
		{
			allowCbErr: true
		},
		topicCb:
		function()
		{
			var cb = this.getCb();
			
			throw new TestingError();
		},
		argsVer:[ TestingError ],
		vows:[ "dingo", emptyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.cbErr === undefined &&
			run.topic.thrownErr.constructor === TestingError &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"testing faulty topicCb and healthy cancelled vow where "+
	"topicCb is allowed to throw and give cb er but never calls "+
	"cb",
	{
		conf:
		{
			allowThrownErr: true,
			allowCbErr: true
		},
		topicCb: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
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
				topic: emptyFunc,
				argsVer:[ "undef" ],
				vows:[ "dingo", emptyFunc ],
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
						vows:[ "dingo", emptyFunc ]
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
				vows:[ "dingo", emptyFunc ],
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
						vows:[ "dingo", emptyFunc ]
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
				vows:[ "dingo", emptyFunc ],
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
						vows:[ "dingo", emptyFunc ]
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
				vows:[ "dingo", emptyFunc ],
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
						vows:[ "dingo", emptyFunc ]
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
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[
			"dengo", faultyFunc,
			"dango", emptyFunc
		],
		next:
		[
			"dingo",
			{
				topic: emptyFunc,
				argsVer:[ "undef" ],
				vows:[ "dingo", emptyFunc ]
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
						vows:[ "dingo", emptyFunc ]
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
				vows:[ "dingo", emptyFunc ]
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
						vows:[ "dingo", emptyFunc ]
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
							
							return emptyFunc;
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
	"nested suite that handles its own local vars with a vow "+
	"that fails on reading a local var that doesnt exist",
	function()
	{
		var beforeRead = undefined;
		var beforeWritten = undefined;
		var topicRead = undefined;
		var topicWritten = undefined;
		
		var vowOneRead = undefined;
		var vowOneWritten = undefined;
		var vowTwoRead = undefined;
		var vowTwoWritten = undefined;
		
		var suiteOneBeforeRead = undefined;
		var suiteOneBeforeWritten = undefined;
		var suiteOneTopicRead = undefined;
		var suiteOneTopicWritten = undefined;
		var suiteOneTopicDelayedRead = undefined;
		var suiteOneTopicDelayedWritten = undefined;
		var suiteOneVowOneRead = undefined;
		var suiteOneVowOneWritten = undefined;
		var suiteOneAfterRead = undefined;
		var suiteOneAfterWritten = undefined;
		
		var suiteTwoBeforeRead = undefined;
		var suiteTwoBeforeWritten = undefined;
		var suiteTwoTopicRead = undefined;
		var suiteTwoTopicWritten = undefined;
		var suiteTwoVowOneRead = undefined;
		var suiteTwoVowOneWritten = undefined;
		var suiteTwoVowTwoRead = undefined;
		var suiteTwoVowTwoWritten = undefined;
		var suiteTwoAfterRead = undefined;
		var suiteTwoAfterWritten = undefined;
		
		return(
		{
			suite:
			{
				local:
				{
					dingo: "beforeGoesFirst"
				},
				before:
				function()
				{
					beforeRead = this.get( "dingo" );
					
					this.set( "dingo", "beforeWasHere" );
					
					beforeWritten = this.get( "dingo" );
				},
				topic:
				function()
				{
					topicRead = this.get( "dingo" );
					
					this.set( "dingo", "toBeOverWritten" );
					this.set( "dingo", "toBeOverWrittenAgain" );
					this.set( "dingo", "topicWasHere" );
					
					topicWritten = this.get( "dingo" );
				},
				argsVer:[ "undef" ],
				vows:
				[
					"vow one",
					function()
					{
						vowOneRead = this.get( "dingo" );
						this.set( "dingo", "vowOneWasHere" );
						vowOneWritten = this.get( "dingo" );
					},
					"vow two",
					function()
					{
						vowTwoRead = this.get( "dingo" );
						this.set( "dingo", "vowTwoWasHere" );
						vowTwoWritten = this.get( "dingo" );
					}
				],
				next:
				[
// this suite reads only local vars of its parent suite
					"suite one",
					{
						beforeCb:
						function()
						{
							suiteOneBeforeRead = this.get( "dingo" );
							this.set( "dingo", "suiteOneBeforeWasHere" );
							suiteOneBeforeWritten = this.get( "dingo" );
							
							var cb = this.getCb();
							cb();
						},
						topicCb:
						function()
						{
							suiteOneTopicRead = this.get( "dingo" );
							this.set( "dingo", "suiteOneTopicWasHere" );
							suiteOneTopicWritten = this.get( "dingo" );
							
							var topicCb = this;
							
							setTimeout(
								function()
								{
									suiteOneTopicDelayedRead =
										topicCb.get( "dingo" )
									;
									
									topicCb.set(
										"dingo", "will be overwritten"
									);
									topicCb.set(
										"dingo", "suiteOneTopicDelayedWasHere"
									);
									
									suiteOneTopicDelayedWritten =
										topicCb.get( "dingo" )
									;
									
									var cb = topicCb.getCb();
									cb();
								},
								100
							);
						},
						argsVer:[],
						vows:
						[
							"suite one vow one",
							function()
							{
								suiteOneVowOneRead = this.get( "dingo" );
								this.set( "dingo", "suiteOneVowOneWasHere" );
								suiteOneVowOneWritten = this.get( "dingo" );
							}
						],
						afterCb:
						function()
						{
							suiteOneAfterRead = this.get( "dingo" );
							this.set( "dingo", "suiteOneAfterWasHere" );
							suiteOneAfterWritten = this.get( "dingo" );
							
							var cb = this.getCb();
							cb();
						},
					},
// this suite over shadows its parent suite's local var and
// also handles another local var of its own
					"suite two",
					{
						local:
						{
							dingo: "suiteTwoBeforeGoesFirst",
							dango: "suiteTwoVowTwoGoesFirst"
						},
						before:
						function()
						{
							suiteTwoBeforeRead = this.get( "dingo" );
							this.set( "dingo", "suiteTwoBeforeWasHere" );
							suiteTwoBeforeWritten = this.get( "dingo" );
						},
						topic:
						function()
						{
							suiteTwoTopicRead = this.get( "dingo" );
							this.set( "dingo", "suiteTwoTopicWasHere" );
							suiteTwoTopicWritten = this.get( "dingo" );
						},
						argsVer:[ "undef" ],
						vows:
						[
							"suite two vow one",
							function()
							{
								suiteTwoVowOneRead = this.get( "dingo" );
								this.set( "dingo", "suiteTwoVowOneWasHere" );
								suiteTwoVowOneWritten = this.get( "dingo" );
							},
							"suite two vow two",
							function()
							{
								suiteTwoVowTwoRead = this.get( "dango" );
								
								this.set( "dango", "will be overwritten..." );
								this.set( "dango", "suiteTwoVowTwoWasHere" );
								
								suiteTwoVowTwoWritten = this.get( "dango" );
							}
						],
						after:
						function()
						{
							suiteTwoAfterRead = this.get( "dango" );
							this.set( "dango", "suiteTwoAfterWasHere" );
							suiteTwoAfterWritten = this.get( "dango" );
						},
					},
// This suite fails in one vow when trying to read a local var
// that doesnt exist and also in another vow where it tries to
// write to a local var that doesnt exist
					"suite three",
					{
						vows:
						[
							"suite three vow one",
							function()
							{
								this.set( "dengo", "cant write this.." );
							},
							"suite three vow two",
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
					beforeRead === "beforeGoesFirst" &&
					beforeWritten === "beforeWasHere" &&
					topicRead === "beforeWasHere" &&
					topicWritten === "topicWasHere" &&
					vowOneRead === "topicWasHere" &&
					vowOneWritten === "vowOneWasHere" &&
					vowTwoRead === "vowOneWasHere" &&
					vowTwoWritten === "vowTwoWasHere" &&
					
					suiteOneBeforeRead === "vowTwoWasHere" &&
					suiteOneBeforeWritten === "suiteOneBeforeWasHere" &&
					suiteOneTopicRead === "suiteOneBeforeWasHere" &&
					suiteOneTopicWritten === "suiteOneTopicWasHere" &&
					suiteOneTopicDelayedRead === "suiteOneTopicWasHere" &&
					suiteOneTopicDelayedWritten ===
						"suiteOneTopicDelayedWasHere"
					&&
					suiteOneVowOneRead === "suiteOneTopicDelayedWasHere" &&
					suiteOneVowOneWritten === "suiteOneVowOneWasHere" &&
					suiteOneAfterRead === "suiteOneVowOneWasHere" &&
					suiteOneAfterWritten === "suiteOneAfterWasHere" &&
					
					suiteTwoBeforeRead === "suiteTwoBeforeGoesFirst" &&
					suiteTwoBeforeWritten === "suiteTwoBeforeWasHere" &&
					suiteTwoTopicRead === "suiteTwoBeforeWasHere" &&
					suiteTwoTopicWritten === "suiteTwoTopicWasHere" &&
					suiteTwoVowOneRead === "suiteTwoTopicWasHere" &&
					suiteTwoVowOneWritten === "suiteTwoVowOneWasHere" &&
					suiteTwoVowTwoRead === "suiteTwoVowTwoGoesFirst" &&
					suiteTwoVowTwoWritten === "suiteTwoVowTwoWasHere" &&
					suiteTwoVowTwoRead === "suiteTwoVowTwoGoesFirst" &&
					suiteTwoVowTwoWritten === "suiteTwoVowTwoWasHere" &&
					suiteTwoAfterRead === "suiteTwoVowTwoWasHere" &&
					suiteTwoAfterWritten === "suiteTwoAfterWasHere" &&
					
					run.next[ 2 ].vows[ 0 ].stepOk === false &&
					run.next[ 2 ].vows[ 0 ].err.constructor ===
						SuiteRuntimeError
					&&
					run.next[ 2 ].vows[ 0 ].err.ourGlobeCode ===
						"LocalVarNotDeclared"
					&&
					
					run.next[ 2 ].vows[ 1 ].stepOk === false &&
					run.next[ 2 ].vows[ 1 ].err.constructor ===
						SuiteRuntimeError
					&&
					run.next[ 2 ].vows[ 1 ].err.ourGlobeCode ===
						"LocalVarNotDeclared"
					,
					"run result is invalid"
				);
			}
		});
	}
);

// testing suites where suite checks if it hasParent() and reads
// parent suite result if there is a parent

testSuiteRun(
	"testing healthy suites at many levels that check if they "+
	"have a parent",
	false,
	function()
	{
		var beforeHasParent = undefined;
		var topicHasParent = undefined;
		var afterHasParent = undefined;
		var vowOneHasParent = undefined;
		var suiteOneBeforeHasParent = undefined;
		var suiteOneTopicHasParent = undefined;
		var suiteOneVowOneHasParent = undefined;
		var suiteOneAfterHasParent = undefined;
		
		return(
			{
				suite:
				{
					before:
					function()
					{
						beforeHasParent = this.hasParent();
					},
					topic:
					function()
					{
						topicHasParent = this.hasParent();
					},
					after:
					function()
					{
						afterHasParent = this.hasParent();
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
							beforeCb:
							function()
							{
								suiteOneBeforeHasParent = this.hasParent();
								
								var cb = this.getCb();
								cb();
							},
							topicCb:
							function()
							{
								suiteOneTopicHasParent = this.hasParent();
								
								var cb = this.getCb();
								cb();
							},
							argsVer:[ "undef" ],
							vows:
							[
								"suiteOneVowOne",
								function()
								{
									suiteOneVowOneHasParent = this.hasParent();
								}
							],
							afterCb:
							function()
							{
								suiteOneAfterHasParent = this.hasParent();
								
								var cb = this.getCb();
								cb();
							}
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						beforeHasParent === false &&
						topicHasParent === false &&
						afterHasParent === false &&
						vowOneHasParent === false &&
						suiteOneBeforeHasParent === true &&
						suiteOneTopicHasParent === true &&
						suiteOneVowOneHasParent === true &&
						suiteOneAfterHasParent === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing healthy suite with healthy child suites that "+
	"getParent() and read parent suite results at various suite "+
	"steps and another level of child suites that in turn "+
	"getParent() and read parent suite results. Making suire "+
	"results are correct even if topic/topicCb throws/gives err",
	function()
	{
		var suiteOneBeforeParentRes = undefined;
		var suiteOneBeforeParentErrOccurred = undefined;
		var suiteOneBeforeParentErrThrown = undefined;
		
		var suiteOneTopicParentRes = undefined;
		var suiteOneTopicParentErrOccurred = undefined;
		var suiteOneTopicParentErrThrown = undefined;
		
		var suiteOneAfterParentRes = undefined;
		var suiteOneAfterParentErrOccurred = undefined;
		var suiteOneAfterParentErrThrown = undefined;
		
		var suiteOneOneTopicParentRes = undefined;
		var suiteOneOneTopicParentErrOccurred = undefined;
		var suiteOneOneTopicParentErrThrown = undefined;
		
		var suiteOneVowOneParentRes = undefined;
		var suiteOneVowOneParentErrOccurred = undefined;
		var suiteOneVowOneParentErrThrown = undefined;
		
		var suiteTwoOneBeforeParentRes = undefined;
		var suiteTwoOneBeforeParentErrOccurred = undefined;
		var suiteTwoOneBeforeParentErrThrown = undefined;
		
		var suiteTwoOneTopicParentRes = undefined;
		var suiteTwoOneTopicParentErrOccurred = undefined;
		var suiteTwoOneTopicParentErrThrown = undefined;
		
		var suiteTwoOneAfterParentRes = undefined;
		var suiteTwoOneAfterParentErrOccurred = undefined;
		var suiteTwoOneAfterParentErrThrown = undefined;
		
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
// suite reads parent results
						"suite one",
						{
							conf:
							{
								allowCbErr: true
							},
							beforeCb:
							function()
							{
								var parent = this.getParent();
								
								suiteOneBeforeParentRes = parent.getTopicRes();
								suiteOneBeforeParentErrOccurred =
									parent.topicErrOccurred()
								;
								suiteOneBeforeParentErrThrown =
									parent.topicErrThrown()
								;
								
								var cb = this.getCb();
								cb();
							},
							topicCb:
							function()
							{
								var parent = this.getParent();
								
								suiteOneTopicParentRes = parent.getTopicRes();
								suiteOneTopicParentErrOccurred =
									parent.topicErrOccurred()
								;
								suiteOneTopicParentErrThrown =
									parent.topicErrThrown()
								;
								
								var cb = this.getCb();
								
// gives cb err so child suite can test this result
								cb( new TestingError() );
							},
							afterCb:
							function()
							{
								var parent = this.getParent();
								
								suiteOneAfterParentRes = parent.getTopicRes();
								suiteOneAfterParentErrOccurred =
									parent.topicErrOccurred()
								;
								suiteOneAfterParentErrThrown =
									parent.topicErrThrown()
								;
								
								var cb = this.getCb();
								cb();
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
										parent.topicErrOccurred()
									;
									suiteOneVowOneParentErrThrown =
										parent.topicErrThrown()
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
											parent.topicErrOccurred()
										;
										suiteOneOneTopicParentErrThrown =
											parent.topicErrThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite one one vow one", emptyFunc
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
									before:
									function()
									{
										var parent = this.getParent();
										
										suiteTwoOneBeforeParentRes =
											parent.getTopicRes()
										;
										suiteTwoOneBeforeParentErrOccurred =
											parent.topicErrOccurred()
										;
										suiteTwoOneBeforeParentErrThrown =
											parent.topicErrThrown()
										;
									},
									topic:
									function()
									{
										var parent = this.getParent();
										
										suiteTwoOneTopicParentRes =
											parent.getTopicRes()
										;
										suiteTwoOneTopicParentErrOccurred =
											parent.topicErrOccurred()
										;
										suiteTwoOneTopicParentErrThrown =
											parent.topicErrThrown()
										;
									},
									after:
									function()
									{
										var parent = this.getParent();
										
										suiteTwoOneAfterParentRes =
											parent.getTopicRes()
										;
										suiteTwoOneAfterParentErrOccurred =
											parent.topicErrOccurred()
										;
										suiteTwoOneAfterParentErrThrown =
											parent.topicErrThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite two one vow one", emptyFunc
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
						suiteOneBeforeParentRes.length === 1 &&
						suiteOneBeforeParentRes[ 0 ] === "dingo" &&
						suiteOneBeforeParentErrOccurred === false &&
						suiteOneBeforeParentErrThrown === false &&
						
						suiteOneTopicParentRes.length === 1 &&
						suiteOneTopicParentRes[ 0 ] === "dingo" &&
						suiteOneTopicParentErrOccurred === false &&
						suiteOneTopicParentErrThrown === false &&
						
						suiteOneAfterParentRes.length === 1 &&
						suiteOneAfterParentRes[ 0 ] === "dingo" &&
						suiteOneAfterParentErrOccurred === false &&
						suiteOneAfterParentErrThrown === false &&
						
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
						
						suiteTwoOneBeforeParentRes.length === 1 &&
						suiteTwoOneBeforeParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteTwoOneBeforeParentErrOccurred === true &&
						suiteTwoOneBeforeParentErrThrown === true &&
						
						suiteTwoOneTopicParentRes.length === 1 &&
						suiteTwoOneTopicParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteTwoOneTopicParentErrOccurred === true &&
						suiteTwoOneTopicParentErrThrown === true &&
						
						suiteTwoOneAfterParentRes.length === 1 &&
						suiteTwoOneAfterParentRes[ 0 ].constructor ===
							TestingError
						&&
						suiteTwoOneAfterParentErrOccurred === true &&
						suiteTwoOneAfterParentErrThrown === true
						,
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
											parent.topicErrOccurred()
										;
										suiteOneOneTopicParentErrThrown =
											parent.topicErrThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite one one vow one", emptyFunc
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
											parent.topicErrOccurred()
										;
										suiteOneOneTopicParentErrThrown =
											parent.topicErrThrown()
										;
									},
									argsVer:[ "undef" ],
									vows:
									[
										"suite one one vow one", emptyFunc
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
							vowOneErrOccurred = this.topicErrOccurred();
							vowOneErrThrown = this.topicErrThrown();
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
									suiteOneVowOneErrOccurred = this.topicErrOccurred();
									suiteOneVowOneErrThrown = this.topicErrThrown();
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
												this.topicErrOccurred()
											;
											suiteOneOneVowOneErrThrown =
												this.topicErrThrown()
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
									suiteTwoVowOneErrOccurred = this.topicErrOccurred();
									suiteTwoVowOneErrThrown = this.topicErrThrown();
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
												this.topicErrOccurred()
											;
											suiteTwoOneVowOneErrThrown =
												this.topicErrThrown()
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
										this.topicErrOccurred()
									;
									suiteThreeVowOneErrThrown = this.topicErrThrown();
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

// testing suites and child suites with suite step before and it
// in relation to other suite steps (in the same suite or parent
// suite)

testSuiteRun(
	"healthy suite with suite step before that receives no args",
	function()
	{
		var beforeArgs = undefined;
		
		return(
			{
				suite:
				{
					before:
					function()
					{
						beforeArgs = arguments;
					},
					topic: emptyFunc,
					argsVer:[ "undefined" ],
					vows:
					[
						"vow one", emptyFunc,
						"vow two", emptyFunc
					],
					next:
					[
						"suite one", healthySuite
					]
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						run.before.stepOk === true &&
						run.before.err === undefined &&
						beforeArgs.length === 0 &&
						
						run.topic.stepOk === true &&
						
						run.argsVer.stepOk === true &&
						
						run.vows[ 0 ].stepOk === true &&
						run.vows[ 1 ].stepOk === true &&
						
						run.next[ 0 ].runOk === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with suite step before that returns var and "+
	"making sure returned var is ignored by suite",
	function()
	{
		var topicArgs = undefined;
		
		return(
			{
				suite:
				{
					before:
					function()
					{
// the return var is ignored by the suite
						return "dingo";
					},
					topic:
					function()
					{
						topicArgs = arguments;
					},
					argsVer:[ "undefined" ],
					vows:
					[
						"vow one", emptyFunc
					]
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						run.before.stepOk === true &&
						run.topic.stepOk === true &&
						topicArgs.length === 0,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"faulty suite with faulty suite step before",
	{
		before: faultyFunc,
		topic: emptyFunc,
		argsVer:[ "undefined" ],
		vows:[ "vow one", emptyFunc ],
		next:[ "suite one", healthySuite ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.before.stepOk === false &&
			run.before.err.constructor === TestingError &&
			
			run.topic.stepOk === undefined &&
			
			run.argsVer.stepOk === undefined &&
			
			run.vows[ 0 ].stepOk === undefined &&
			run.next.length === 0,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy suite without suite step before but making sure "+
	"the step is marked as ok by suite run",
	{
		topic: emptyFunc,
		argsVer:[ "undefined" ],
		vows:[ "vow one", emptyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			run.before.stepOk === true &&
			run.before.err === undefined &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy suite with topicCb that passes args to child suite "+
	"that has suite step before and making sure that child "+
	"suites suite steps before and topic receive args",
	function()
	{
		var suiteOneBeforeArgs = undefined;
		var suiteOneTopicArgs = undefined;
		
		return(
			{
				suite:
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb( "dingo", 42, true );
					},
					argsVer:[ "str", "int", "bool" ],
					next:
					[
						"suite one",
						{
							before:
							function()
							{
								suiteOneBeforeArgs = arguments;
								
// return var is ignored by child suite
								return 42;
							},
							topic:
							function()
							{
								suiteOneTopicArgs = arguments;
							},
							argsVer:[ "undefined" ],
							vows:[ "suite one vow one", emptyFunc ]
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						
						run.next[ 0 ].runOk === true &&
						
						run.next[ 0 ].before.stepOk === true &&
						suiteOneBeforeArgs.length === 3 &&
						suiteOneBeforeArgs[ 0 ] === "dingo" &&
						suiteOneBeforeArgs[ 1 ] === 42 &&
						suiteOneBeforeArgs[ 2 ] === true &&
						
						run.next[ 0 ].topic.stepOk === true &&
						suiteOneTopicArgs.length === 3 &&
						suiteOneTopicArgs[ 0 ] === "dingo" &&
						suiteOneTopicArgs[ 1 ] === 42 &&
						suiteOneTopicArgs[ 2 ] === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with child suite that has only suite step "+
	"before and vows and making sure vows get correct args",
	function()
	{
		var suiteOneVowOne = undefined;
		
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
						"suite one",
						{
							before:
							function()
							{
// return var is ignored by child suite
								return 42;
							},
							vows:
							[
								"suite one vow one",
								function()
								{
									suiteOneVowOne = arguments;
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
						
						run.next[ 0 ].runOk === true &&
						
						run.next[ 0 ].before.stepOk === true &&
						
						run.next[ 0 ].vows[ 0 ].stepOk === true &&
						suiteOneVowOne.length === 1 &&
						suiteOneVowOne[ 0 ] === "dingo",
						"run result is invalid"
					);
				}
			}
		);
	}
);

// testing suites with beforeCb and it in relation to other
// suite steps

testSuiteRun(
	"healthy suite with beforeCb that receives args and making "+
	"sure the args passed to cb by beforeCb are ignored",
	function()
	{
		var suiteOneBeforeCbArgs = undefined;
		var suiteOneTopicArgs = undefined;
		
		return(
			{
				suite:
				{
					beforeCb:
					function()
					{
						suiteOneBeforeCbArgs = arguments;
						
						var cb = this.getCb();
// args given to cb are ignored
						cb( "dingo", "dango", "dongo" );
					},
					topic:
					function()
					{
						suiteOneTopicArgs = arguments;
					},
					argsVer:[ "undef" ],
					vows:[ "vow one", emptyFunc ]
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						
						run.before.stepOk === true &&
						run.before.err === undefined &&
						suiteOneBeforeCbArgs.length === 0 &&
						
						run.topic.stepOk === true &&
						suiteOneTopicArgs.length === 0,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with beforeCb that makes delayed call to cb()",
	{
		beforeCb:
		function()
		{
			var beforeCb = this;
			
			setTimeout(
				function()
				{
					var cb = beforeCb.getCb();
					
// Passing err as second arg doesnt make beforeCb to break
					cb( "dingo", new TestingError() );
				},
				100
			);
		},
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "vow one", emptyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			
			run.before.stepOk === true &&
			run.before.err === undefined &&
			
			run.topic.stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty suite with faulty beforeCb that passes err to "+
	"delayed cb()",
	{
		beforeCb:
		function()
		{
			var beforeCb = this;
			
			setTimeout(
				function()
				{
					var cb = beforeCb.getCb();
					
					cb( new TestingError() );
				},
				100
			);
		},
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "vow one", emptyFunc ],
		next:[ "suite one", healthySuite ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			
			run.before.stepOk === false &&
			run.before.err.constructor === TestingError &&
			
			run.topic.stepOk === undefined &&
			run.argsVer.stepOk === undefined &&
			run.vows[ 0 ].stepOk === undefined &&
			run.next.length === 0,
			"run result is invalid"
		);
	}
);

// testing suites with beforeCb that signals it is done many
// times by a combination of call(s) to cb() and throwing err

expectSuiteCbErr(
	"testing faulty beforeCb with two direct calls to cb() "+
	"(terminates suite test with err) and another faulty "+
	"beforeCb with direct call to cb() (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			cb();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb calling direct cb(err) and direct "+
	"cb() (terminates suite test with err) and another faulty "+
	"beforeCb calling direct cb(err) (doesnt terminate test)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
			
			cb();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			cb( new TestingError() );
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb with two delayed calls to cb() "+
	"(terminates suite test with err) and another faulty "+
	"beforeCb calling delayed cb() (doesnt terminate test)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		beforeCb:
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
				300
			);
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
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
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb that throws err and calls direct "+
	"cb() (terminates suite test with err) and another faulty "+
	"beforeCb that throws err (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			
			throw new TestingError();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
		function()
		{
			throw new TestingError();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb that throws err and calls delayed "+
	"cb() (terminates suite test with err) and another faulty "+
	"beforeCb that throws err (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		beforeCb:
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
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
		function()
		{
			throw new TestingError();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb that throws err and gives delayed "+
	"cb err (terminates suite test with err) and another faulty "+
	"beforeCb that gives delayed cb err (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		beforeCb:
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
			
			throw new TestingError();
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
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
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb "+
	"that never calls cb within timeout limit and then gives "+
	"errs to two delayed cbs (terminates all tests with err) and "+
	"another faulty beforeCb that also never calls cb within "+
	"allowed timeout period and then calls delayed cb (doesnt "+
	"terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+1500
			);
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

expectSuiteCbErr(
	"testing faulty beforeCb that makes multiple calls to "+
	"delayed cbs with and without errs (terminates all tests "+
	"with err, but yields only one such err) and another faulty "+
	"beforeCb that also never calls cb within allowed timeout "+
	"period and then calls delayed cb (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+100
			);
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+200
			);
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+300
			);
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+400
			);
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ]
	}
);

// testing suites with beforeCb that doesnt call cb() within
// allowed timeout limit

testSuiteRun(
	"testing faulty beforeCb that makes no call to cb()",
	{
		beforeCb: emptyFunc,
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.before.stepOk === false &&
			run.before.err.constructor === SuiteRuntimeError &&
			run.before.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.topic.stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"testing faulty beforeCb with no call to cb within timeout "+
	"limit and then calls delayed cb",
	{
		beforeCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		},
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ]
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.before.stepOk === false &&
			run.before.err.constructor === SuiteRuntimeError &&
			run.before.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.topic.stepOk === undefined,
			"run result is invalid"
		);
	}
);

// testing suites with suite step after

testSuiteRun(
	"testing healthy suite with suite step after that receives "+
	"no args",
	function()
	{
		var afterArgs = undefined;
		
		return(
			{
				suite:
				{
					topic: emptyFunc,
					argsVer:[ "undefined" ],
					vows:[ "vow one", emptyFunc, ],
					next:[ "suite one", healthySuite ],
					after:
					function()
					{
						afterArgs = arguments;
					},
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						run.before.stepOk === true &&
						
						run.topic.stepOk === true &&
						
						run.argsVer.stepOk === true &&
						
						run.vows[ 0 ].stepOk === true &&
						
						run.next[ 0 ].runOk === true &&
						run.after.stepOk === true &&
						run.after.err === undefined &&
						afterArgs.length === 0,
						
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing faulty suite with faulty suite step after",
	{
		topic: emptyFunc,
		argsVer:[ "undefined" ],
		vows:[ "vow one", emptyFunc ],
		next:[ "suite one", healthySuite ],
		after: faultyFunc
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.before.stepOk === true &&
			
			run.topic.stepOk === true &&
			
			run.argsVer.stepOk === true &&
			
			run.vows[ 0 ].stepOk === true &&
			
			run.next[ 0 ].runOk === true &&
			
			run.after.stepOk === false &&
			run.after.err.constructor === TestingError,
			
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"testing healthy suite with topicCb that passes args to "+
	"child suite that has suite step after, making sure that "+
	"step after receives args",
	function()
	{
		var suiteOneAfterArgs = undefined;
		
		return(
			{
				suite:
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb( "dingo", 42 );
					},
					argsVer:[ "str", "int" ],
					next:
					[
						"suite one",
						{
							vows:[ "suite one vow one", emptyFunc ],
							after:
							function()
							{
								suiteOneAfterArgs = arguments;
							},
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						run.runOk === true &&
						
						run.next[ 0 ].runOk === true &&
						
						run.next[ 0 ].vows[ 0 ].stepOk === true &&
						
						run.next[ 0 ].after.stepOk === true &&
						suiteOneAfterArgs.length === 2 &&
						suiteOneAfterArgs[ 0 ] === "dingo" &&
						suiteOneAfterArgs[ 1 ] === 42,
						
						"run result is invalid"
					);
				}
			}
		);
	}
);

// testing suites with suite step after where the step reads the
// suite's results

testSuiteRun(
	"testing suite with suite step after that reads its own "+
	"suite's results",
	function()
	{
		var afterTopicRes = undefined;
		var afterErrOccurred = undefined;
		var afterErrThrown = undefined;
		var suiteOneAfterTopicRes = undefined;
		var suiteOneAfterErrOccurred = undefined;
		var suiteOneAfterErrThrown = undefined;
		var suiteTwoAfterTopicRes = undefined;
		var suiteTwoAfterErrOccurred = undefined;
		var suiteTwoAfterErrThrown = undefined;
		var suiteThreeAfterTopicRes = undefined;
		var suiteThreeAfterErrOccurred = undefined;
		var suiteThreeAfterErrThrown = undefined;
		
		return(
			{
// topic returns simple result and suite step after reads the
// result
				suite:
				{
					topic:
					function()
					{
						return "dingo";
					},
					argsVer:[ "str" ],
					vows:[ "vow one", emptyFunc ],
					after:
					function()
					{
						afterTopicRes = this.getTopicRes();
						afterErrOccurred = this.topicErrOccurred();
						afterErrThrown = this.topicErrThrown();
					},
					next:
					[
// topic throws allowed err and suite step after reads topic
// results
						"suite one",
						{
							conf:
							{
								allowThrownErr: true
							},
							topic: faultyFunc,
							argsVer:[ TestingError ],
							vows:[ "vow one", emptyFunc ],
							after:
							function()
							{
								suiteOneAfterTopicRes = this.getTopicRes();
								suiteOneAfterErrOccurred =
									this.topicErrOccurred()
								;
								suiteOneAfterErrThrown =
									this.topicErrThrown()
								;
							}
						},
// topicCb gives allowed err and suite step after reads topic
// results
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
								
								cb( new TestingError(), 43 );
							},
							argsVer:[ TestingError, "int" ],
							vows:[ "vow one", emptyFunc ],
							after:
							function()
							{
								suiteTwoAfterTopicRes = this.getTopicRes();
								suiteTwoAfterErrOccurred =
									this.topicErrOccurred()
								;
								suiteTwoAfterErrThrown =
									this.topicErrThrown()
								;
							}
						},
// suite has no topic and suite step after reads topic results
// propagated from parent suite
						"suite three",
						{
							vows:[ "vow one", emptyFunc ],
							after:
							function()
							{
								suiteThreeAfterTopicRes = this.getTopicRes();
								suiteThreeAfterErrOccurred =
									this.topicErrOccurred()
								;
								suiteThreeAfterErrThrown =
									this.topicErrThrown()
								;
							}
						}
					]
				},
				cb:
				function( run )
				{
					assert(
						afterTopicRes.length === 1 &&
						afterTopicRes[ 0 ] === "dingo" &&
						afterErrOccurred === false &&
						afterErrThrown === false &&
						
						suiteOneAfterTopicRes.length === 1 &&
						suiteOneAfterTopicRes[ 0 ].constructor ===
							TestingError
						&&
						suiteOneAfterErrOccurred === true &&
						suiteOneAfterErrThrown === true &&
						
						suiteTwoAfterTopicRes.length === 2 &&
						suiteTwoAfterTopicRes[ 0 ].constructor ===
							TestingError
						&&
						suiteTwoAfterTopicRes[ 1 ] === 43 &&
						suiteTwoAfterErrOccurred === true &&
						suiteTwoAfterErrThrown === false &&
						
						suiteThreeAfterTopicRes.length === 1 &&
						suiteThreeAfterTopicRes[ 0 ] === "dingo" &&
						suiteThreeAfterErrOccurred === false &&
						suiteThreeAfterErrThrown === false,
						
						"run result is invalid"
					);
				}
			}
		);
	}
);

// test group
// testing suites with suite step after where the suite fails at
// some step and step after commences and reads the results

testSuiteRun(
	"testing faulty suite that fails at step before and suite "+
	"step after reads the results",
	function()
	{
		var afterSuiteOk = undefined;
		var afterBeforeOk = undefined;
		var afterBeforeCbOk = undefined;
		var afterTopicOk = undefined;
		var afterArgsVerOk = undefined;
		var afterVowsOk = undefined;
		var afterNextOk = undefined;
		var afterGetTopicResErr = undefined;
		var afterErrOccurredErr = undefined;
		var afterErrThrownErr = undefined;
		
		return(
			{
				suite:
				{
					before: faultyFunc,
					topic: emptyFunc,
					argsVer:[ "undef" ],
					vows:[ "vow one", emptyFunc ],
					next:[ "suite one", healthySuite ],
					after:
					function()
					{
						afterSuiteOk = this.suiteOk();
						afterBeforeOk = this.stepOk( "before" );
						afterBeforeCbOk = this.stepOk( "beforeCb" );
						afterTopicOk = this.stepOk( "topic" );
						afterArgsVerOk = this.stepOk( "argsVer" );
						afterVowsOk = this.stepOk( "vows" );
						afterNextOk = this.stepOk( "next" );
						
						try
						{
							this.getTopicRes();
						}
						catch( e )
						{
							afterGetTopicResErr = e;
						}
						
						try
						{
							this.topicErrOccurred();
						}
						catch( e )
						{
							afterErrOccurredErr = e;
						}
						
						try
						{
							this.topicErrThrown();
						}
						catch( e )
						{
							afterErrThrownErr = e;
						}
					}
				},
				cb:
				function( run )
				{
					assert(
						afterSuiteOk === false &&
						afterBeforeOk === false &&
						afterBeforeCbOk === false &&
						afterTopicOk === undefined &&
						afterArgsVerOk === undefined &&
						afterVowsOk === undefined &&
						afterNextOk === undefined &&
						afterGetTopicResErr.constructor ===
							SuiteRuntimeError
						&&
						afterErrOccurredErr.constructor ===
							SuiteRuntimeError
						&&
						afterErrThrownErr.constructor ===
							SuiteRuntimeError,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing faulty suite that fails at step topic and suite "+
	"step after reads the results",
	function()
	{
		var afterSuiteOk = undefined;
		var afterBeforeOk = undefined;
		var afterTopicOk = undefined;
		var afterTopicCbOk = undefined;
		var afterArgsVerOk = undefined;
		var afterVowsOk = undefined;
		var afterNextOk = undefined;
		var afterGetTopicResErr = undefined;
		var afterErrOccurredErr = undefined;
		var afterErrThrownErr = undefined;
		
		return(
			{
				suite:
				{
					topic: faultyFunc,
					argsVer:[ TestingError ],
					vows:[ "vow one", emptyFunc ],
					next:[ "suite one", healthySuite ],
					after:
					function()
					{
						afterSuiteOk = this.suiteOk();
						afterBeforeOk = this.stepOk( "before" );
						afterTopicOk = this.stepOk( "topic" );
						afterTopicCbOk = this.stepOk( "topicCb" );
						afterArgsVerOk = this.stepOk( "argsVer" );
						afterVowsOk = this.stepOk( "vows" );
						afterNextOk = this.stepOk( "next" );
						
						try
						{
							this.getTopicRes();
						}
						catch( e )
						{
							afterGetTopicResErr = e;
						}
						
						try
						{
							this.topicErrOccurred();
						}
						catch( e )
						{
							afterErrOccurredErr = e;
						}
						
						try
						{
							this.topicErrThrown();
						}
						catch( e )
						{
							afterErrThrownErr = e;
						}
					}
				},
				cb:
				function( run )
				{
					assert(
						afterSuiteOk === false &&
						afterBeforeOk === true &&
						afterTopicOk === false &&
						afterTopicCbOk === false &&
						afterArgsVerOk === undefined &&
						afterVowsOk === undefined &&
						afterNextOk === undefined &&
						afterGetTopicResErr.constructor ===
							SuiteRuntimeError
						&&
						afterErrOccurredErr.constructor ===
							SuiteRuntimeError
						&&
						afterErrThrownErr.constructor ===
							SuiteRuntimeError,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing faulty suite that fails at step argsVer and suite "+
	"step after reads the results",
	function()
	{
		var afterSuiteOk = undefined;
		var afterBeforeOk = undefined;
		var afterTopicOk = undefined;
		var afterArgsVerOk = undefined;
		var afterVowsOk = undefined;
		var afterNextOk = undefined;
		var afterGetTopicRes = undefined;
		var afterErrOccurred = undefined;
		var afterErrThrown = undefined;
		
		return(
			{
				suite:
				{
					topic: emptyFunc,
					argsVer:[ "str" ],
					vows:[ "vow one", emptyFunc ],
					next:[ "suite one", healthySuite ],
					after:
					function()
					{
						afterSuiteOk = this.suiteOk();
						afterBeforeOk = this.stepOk( "before" );
						afterTopicOk = this.stepOk( "topic" );
						afterArgsVerOk = this.stepOk( "argsVer" );
						afterVowsOk = this.stepOk( "vows" );
						afterNextOk = this.stepOk( "next" );
						afterGetTopicRes = this.getTopicRes();
						afterErrOccurred = this.topicErrOccurred();
						afterErrThrown = this.topicErrThrown();
					}
				},
				cb:
				function( run )
				{
					assert(
						afterSuiteOk === false &&
						afterBeforeOk === true &&
						afterTopicOk === true &&
						afterArgsVerOk === false &&
						afterVowsOk === undefined &&
						afterNextOk === undefined &&
						afterGetTopicRes.length === 1 &&
						afterErrOccurred === false &&
						afterErrThrown === false,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing faulty suite that fails at step vows and suite "+
	"step after reads the results",
	function()
	{
		var afterSuiteOk = undefined;
		var afterBeforeOk = undefined;
		var afterTopicOk = undefined;
		var afterArgsVerOk = undefined;
		var afterVowsOk = undefined;
		var afterVowOk = undefined;
		var afterNextOk = undefined;
		
		return(
			{
				suite:
				{
					topic: emptyFunc,
					argsVer:[ "undef" ],
					vows:
					[
						"vow one", emptyFunc,
						"vow two", faultyFunc
					],
					next:[ "suite one", healthySuite ],
					after:
					function()
					{
						afterSuiteOk = this.suiteOk();
						afterBeforeOk = this.stepOk( "before" );
						afterTopicOk = this.stepOk( "topic" );
						afterArgsVerOk = this.stepOk( "argsVer" );
						afterVowOk = this.stepOk( "vow" );
						afterVowsOk = this.stepOk( "vows" );
						afterNextOk = this.stepOk( "next" );
					}
				},
				cb:
				function( run )
				{
					assert(
						afterSuiteOk === false &&
						afterBeforeOk === true &&
						afterTopicOk === true &&
						afterArgsVerOk === true &&
						afterVowOk === false &&
						afterVowsOk === false &&
						afterNextOk === undefined,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing faulty suite that fails at step next and suite "+
	"step after reads the results",
	function()
	{
		var afterSuiteOk = undefined;
		var afterBeforeOk = undefined;
		var afterTopicOk = undefined;
		var afterArgsVerOk = undefined;
		var afterVowsOk = undefined;
		var afterNextOk = undefined;
		
		return(
			{
				suite:
				{
					topic: emptyFunc,
					argsVer:[ "undef" ],
					vows:[ "vow one", emptyFunc ],
					next:
					[
						"suite one", healthySuite,
						"suite two",
						{
							vows:[ "suite two vow one", faultyFunc ]
						}
					],
					after:
					function()
					{
						afterSuiteOk = this.suiteOk();
						afterBeforeOk = this.stepOk( "before" );
						afterTopicOk = this.stepOk( "topic" );
						afterArgsVerOk = this.stepOk( "argsVer" );
						afterVowsOk = this.stepOk( "vows" );
						afterNextOk = this.stepOk( "next" );
					}
				},
				cb:
				function( run )
				{
					assert(
						afterSuiteOk === false &&
						afterBeforeOk === true &&
						afterTopicOk === true &&
						afterArgsVerOk === true &&
						afterVowsOk === true &&
						afterNextOk === false,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"testing healthy suite and suite step after that reads the "+
	"results",
	function()
	{
		var afterSuiteOk = undefined;
		var afterBeforeOk = undefined;
		var afterTopicOk = undefined;
		var afterArgsVerOk = undefined;
		var afterVowsOk = undefined;
		var afterNextOk = undefined;
		
		return(
			{
				suite:
				{
					topic: emptyFunc,
					argsVer:[ "undef" ],
					vows:[ "vow one", emptyFunc ],
					next:[ "suite one", healthySuite ],
					after:
					function()
					{
						afterSuiteOk = this.suiteOk();
						afterBeforeOk = this.stepOk( "before" );
						afterTopicOk = this.stepOk( "topic" );
						afterArgsVerOk = this.stepOk( "argsVer" );
						afterVowsOk = this.stepOk( "vows" );
						afterNextOk = this.stepOk( "next" );
					}
				},
				cb:
				function( run )
				{
					assert(
						afterSuiteOk === true &&
						afterBeforeOk === true &&
						afterTopicOk === true &&
						afterArgsVerOk === true &&
						afterVowsOk === true &&
						afterNextOk === true,
						"run result is invalid"
					);
				}
			}
		);
	}
);

// test group
// testing suites with suite step afterCb and it in relation to
// other suite steps

testSuiteRun(
	"healthy suite with afterCb that receives args and making "+
	"sure the args passed to cb by afterCb are ignored",
	function()
	{
		var suiteOneAfterCbArgs = undefined;
		
		return(
			{
				suite:
				{
					topic: emptyFunc,
					argsVer:[ "undef" ],
					vows:[ "vow one", emptyFunc ],
					next:[ "suite one", healthySuite ],
					afterCb:
					function()
					{
						suiteOneAfterCbArgs = arguments;
						
						var cb = this.getCb();
						cb();
					}
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
						run.next[ 0 ].before.stepOk === true &&
						run.next[ 0 ].topic.stepOk === true &&
						run.next[ 0 ].argsVer.stepOk === true &&
						run.next[ 0 ].vows[ 0 ].stepOk === true &&
						run.next[ 0 ].after.stepOk === true &&
						
						run.after.stepOk === true &&
						run.after.err === undefined &&
						suiteOneAfterCbArgs.length === 0,
						"run result is invalid"
					);
				}
			}
		);
	}
);

testSuiteRun(
	"healthy suite with afterCb that makes delayed call to cb()",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "vow one", emptyFunc ],
		afterCb:
		function()
		{
			var afterCb = this;
			
			setTimeout(
				function()
				{
					var cb = afterCb.getCb();
					
// Passing err as second arg doesnt make afterCb to fail
					cb( "dingo", new TestingError() );
				},
				100
			);
		},
	},
	function( run )
	{
		assert(
			run.runOk === true &&
			
			run.after.stepOk === true &&
			run.after.err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty suite with faulty afterCb that passes err to "+
	"delayed cb()",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "vow one", emptyFunc ],
		next:[ "suite one", healthySuite ],
		afterCb:
		function()
		{
			var afterCb = this;
			
			setTimeout(
				function()
				{
					var cb = afterCb.getCb();
					
					cb( new TestingError() );
				},
				100
			);
		}
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			
			run.after.stepOk === false &&
			run.after.err.constructor === TestingError,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty suite with faulty afterCb that never calls cb()",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "vow one", emptyFunc ],
		next:[ "suite one", healthySuite ],
		afterCb: emptyFunc
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			
			run.after.stepOk === false &&
			run.after.err.constructor === SuiteRuntimeError &&
			run.after.err.ourGlobeCode === "SuiteStepCbNotCalled",
			"run result is invalid"
		);
	}
);

// testing suites with afterCb that signals it is done many
// times by a combination of call(s) to cb() and throwing err

expectSuiteCbErr(
	"testing faulty afterCb with two direct calls to cb() "+
	"(terminates suite test with err) and a healthy afterCb "+
	"with direct call to cb() (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			cb();
		}
	},
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
		}
	}
);

expectSuiteCbErr(
	"testing faulty afterCb with two delayed calls to cb() "+
	"(terminates suite test with err) and a healthy afterCb "+
	"calling delayed cb() (doesnt terminate test)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
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
				300
			);
		}
	},
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
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
		}
	}
);

expectSuiteCbErr(
	"testing faulty afterCb that throws err and calls direct "+
	"cb() (terminates suite test with err) and a healthy afterCb "+
	"that throws err (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
		function()
		{
			var cb = this.getCb();
			
			cb();
			throw new TestingError();
		}
	},
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
		function()
		{
			throw new TestingError();
		},
	}
);

expectSuiteCbErr(
	"testing faulty afterCb that throws err and gives delayed "+
	"cb err (terminates suite test with err) and another faulty "+
	"afterCb that gives delayed cb err (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledAndErrThrown",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
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
			
			throw new TestingError();
		},
	},
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
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
	}
);

expectSuiteCbErr(
	"testing faulty afterCb that never calls cb within timeout "+
	"limit and then gives errs to two delayed cbs (terminates "+
	"all tests with err) and another faulty afterCb that also "+
	"never calls cb within allowed timeout period and then calls "+
	"delayed cb (doesnt terminate tests)",
	SuiteRuntimeError,
	"SuiteStepCbCalledTwice",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
			
			setTimeout(
				function()
				{
					cb( new TestingError() );
				},
				CbStep.DEFAULT_CB_TIMEOUT+1500
			);
		}
	},
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", emptyFunc ],
		afterCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		}
	}
);

// testing suites with afterCb that doesnt call cb() within
// allowed timeout limit

testSuiteRun(
	"testing faulty afterCb that makes no call to cb()",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ],
		afterCb: emptyFunc
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.after.stepOk === false &&
			run.after.err.constructor === SuiteRuntimeError &&
			run.after.err.ourGlobeCode === "SuiteStepCbNotCalled",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"testing faulty afterCb with no call to cb within timeout "+
	"limit and then calls delayed cb",
	{
		topic: emptyFunc,
		argsVer: getV().setE( "any" ),
		vows:[ "dingo", faultyFunc ],
		afterCb:
		function()
		{
			var cb = this.getCb();
			
			setTimeout(
				function()
				{
					cb();
				},
				CbStep.DEFAULT_CB_TIMEOUT+1000
			);
		}
	},
	function( run )
	{
		assert(
			run.runOk === false &&
			run.after.stepOk === false &&
			run.after.err.constructor === SuiteRuntimeError &&
			run.after.err.ourGlobeCode === "SuiteStepCbNotCalled",
			"run result is invalid"
		);
	}
);

});
