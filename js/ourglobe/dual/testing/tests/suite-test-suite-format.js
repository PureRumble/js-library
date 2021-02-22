ourglobe.require(
[
	"ourglobe/dual/testing"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;
var getF = ourGlobe.getF;
var FuncVer = ourglobe.FuncVer;

var SuiteRuntimeError = mods.get( "testing" ).SuiteRuntimeError;
var TestRuntimeError = mods.get( "testing" ).TestRuntimeError;
var test = mods.get( "testing" ).Test;
var Suite = mods.get( "testing" ).Suite;
var TestQueue = mods.get( "testing" ).TestQueue;

var TEST_TIME_LIMIT = Suite.DEFAULT_CB_TIMEOUT + 1000;

var testQueue = new TestQueue( 10 );

var emptyFunc = function() {};
var emptyCbFunc =
function()
{
	var cb = this.getCb();
	cb();
};

var healthySuite =
{
	topic: emptyFunc,
	argsVer: [ "undef" ],
	vows:[ "dango", emptyFunc ]
};

var expectErr =
getF(
getV()
	.addA(
		"str",
		"str/undef",
		"obj",
		"obj",
		"bool/undef"
	)
	.addA(
		"str",
		"str/undef",
		{
			types: "obj/undef",
			props:
			{
				testAsChild: "bool/undef",
				testWithGetSuite: "bool/undef"
			}
		},
		"obj",
		"obj"
	)
	.addA( "str", "str/undef", "func" ),
function(
	testName, errCode, opts, faultySuite, healthySuite
)
{
	var func = undefined;
	
	if( hasT( opts, "func" ) === true )
	{
		func = opts;
	}
	else if( hasT( healthySuite, "bool", "undef" ) === true )
	{
		var testAsChild = healthySuite;
		healthySuite = faultySuite;
		faultySuite = opts;
		
		opts = { testAsChild: testAsChild };
	}
	
	var testAsChild = undefined;
	var testWithGetSuite = undefined;
	
	if( hasT( opts, "obj" ) === true )
	{
		testAsChild = opts.testAsChild;
		testWithGetSuite = opts.testWithGetSuite;
		
		if( testAsChild === undefined )
		{
			testAsChild = true;
		}
		
		if( testWithGetSuite === undefined )
		{
			testWithGetSuite = true;
		}
	}
	
	testQueue.pushTest(
	function()
	{
		if( func !== undefined )
		{
			var returnVar = func();
			
			faultySuite = returnVar.faulty;
			healthySuite = returnVar.healthy;
			
			test.expectErr(
				testName,
				SuiteRuntimeError,
				errCode,
				function()
				{
					faultySuite.run( emptyFunc );
				},
				function()
				{
					healthySuite.run( emptyFunc );
				}
			);
			
			return;
		}
		
		test.expectErr(
			testName + " - testing with ordinary suite",
			SuiteRuntimeError,
			errCode,
			function()
			{
				new Suite( "suite for testing purposes" )
					.add( "faulty suite", faultySuite )
				;
			},
			function()
			{
				new Suite( "suite for testing purposes" )
					.add( "healthy suite", healthySuite )
				;
			}
		);
		
		if( testAsChild === true )
		{
			test.expectErr(
				testName + " - testing with child suites",
				SuiteRuntimeError,
				errCode,
				function()
				{
					var suite = new Suite( "suite for testing purposes" );
					
					suite.add(
						"recursive suite obj",
						{
							topic: emptyFunc,
							argsVer:[ "undef" ],
							vows:[ "vow one", emptyFunc ],
							next:[ "faulty suite", faultySuite ]
						}
					);
				},
				function()
				{
					var suite = new Suite( "suite for testing purposes" );
					
					suite.add(
						"recursive suite obj",
						{
							topic: emptyFunc,
							argsVer:[ "undef" ],
							vows:[ "vow one", emptyFunc ],
							next:[ "healthy suite", healthySuite ]
						}
					);
				}
			);
		}
		
		if( testWithGetSuite === true )
		{
			test.expectCbErr(
				testName + " - test suite is returned by suite step "+
				"getSuite",
				SuiteRuntimeError,
				errCode,
				TEST_TIME_LIMIT,
				function( cb )
				{
					var suite =
						new Suite( "test suite created by expectErr()" )
					;
					
					suite.add(
						"nested suite added by expectErr()",
						{ getSuite: function() { return faultySuite; } }
					);
					
					suite.run(
						function( err, suiteRun )
						{
							if( err !== undefined )
							{
								cb(
									new TestRuntimeError(
										"An unexpected err occurred when the suite "+
										"was run. This fails the test",
										{ err: err }
									)
								);
								
								return;
							}
							
							if(
								suiteRun.next[ 0 ].getSuite.err !== undefined &&
								suiteRun.next[ 0 ].getSuite.err.suiteErr !==
									undefined
							)
							{
								cb( suiteRun.next[ 0 ].getSuite.err.suiteErr );
								
								return;
							}
						}
					);
				},
				function( cb )
				{
					var suite =
						new Suite( "test suite created by expectErr()" )
					;
					
					suite.add(
						"nested suite added by expectErr()",
						{ getSuite: function() { return healthySuite; } }
					);
					
					suite.run(
						function( err, suiteRun )
						{
							if( err !== undefined )
							{
								cb(
									new TestRuntimeError(
										"An unexpected err occurred when the suite "+
										"was run. This fails the test",
										{ err: err }
									)
								);
								
								return;
							}
							
							if( suiteRun.next[ 0 ].getSuite.err !== undefined )
							{
								cb(
									new TestRuntimeError(
										"Suite step getSuite failed by an err",
										{
											suiteStepErr:
												suiteRun.next[ 0 ].getSuite.err
										}
									)
								);
								
								return;
							}
							
							cb();
						}
					);
				},
				function()
				{
					testQueue.markTestDone();
				}
			);
		}
		else
		{
			testQueue.markTestDone();
		}
	});
});

// testing verification of that a suite has necessary props

expectErr(
	"A Suite may not be empty",
	"SuiteHasNoRequiredProp",
	{},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ]
	}
);

expectErr(
	"A Suite may not only have a topic (solved by adding argsVer)",
	"SuiteHasNoRequiredProp",
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ]
	}
);

expectErr(
	"A Suite may not only have a topic (solved by adding a vow)",
	"SuiteHasNoRequiredProp",
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc
	},
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		vows:[ "vow one", emptyFunc ]
	}
);

expectErr(
	"A Suite may not only have a topic and a child suite with "+
	"only a topic (solved by adding argsVer to the child suite)",
	"SuiteHasNoRequiredProp",
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		next:
		[
			"suite one",
			{
				conf:{ verifyArgs: false },
				topic: emptyFunc
			}
		]
	},
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		next:
		[
			"suite one",
			{
				topic: emptyFunc,
				argsVer:[ "undef" ]
			}
		]
	}
);

// testing verification of suite steps before and beforeCb

expectErr(
	"Suite prop before must be a func",
	"BeforeIsNotValid",
	{
		before:[ emptyFunc ],
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

expectErr(
	"Suite prop beforeCb must be a func",
	"BeforeIsNotValid",
	{
		beforeCb:[ emptyCbFunc ],
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	{
		beforeCb: emptyCbFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

expectErr(
	"A suite may not have both props before and beforeCb set",
	"BeforeIsNotValid",
	{
		before: emptyFunc,
		beforeCb: emptyCbFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	{
		before: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

// testing verification of topic and topicCb

expectErr(
	"topic must be a func",
	"TopicIsNotValid",
	{
		topic: null,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

expectErr(
	"A Suite may not have both topic and topicCb",
	"TopicIsNotValid",
	{
		topic: emptyFunc,
		topicCb: emptyCbFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of vows

expectErr(
	"vows may not be empty in a Suite",
	"VowsAreNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[]
	},
	{
		topic:emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", emptyFunc ]
	}
);

expectErr(
	"Every second item in vows must be a func",
	"VowsAreNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", "dongo" ]
	},
	{
		topic:emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", emptyFunc ]
	}
);

expectErr(
	"Every second item (starting from first) in vows must be a "+
	"vow-name",
	"VowsAreNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ emptyFunc, "dongo", emptyFunc ]
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc, "dongo", emptyFunc ]
	}
);

expectErr(
	"vow names must be unique",
	"VowsAreNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", emptyFunc, "dongo", emptyFunc ]
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc, "dongo", emptyFunc ]
	}
);

// testing verification of suite prop conf

expectErr(
	"conf must be undef or an obj",
	"ConfIsNotValid",
	{
		conf: null,
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{},
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of suite prop vars

expectErr(
	"vars must be undef or an obj",
	"VarsIsNotValid",
	{
		vars: 43,
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		vars:{},
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of conf flag verifyArgs on its own and
// in relation to suite step argsVer

expectErr(
	"verifyArgs of conf must be bool or undef",
	"ConfIsNotValid",
	{
		conf:{ verifyArgs: 1 },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{ verifyArgs: true },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"argsVer of a Suite must be set if verifyArgs of conf "+
	"is undef or true",
	"ArgsVerIsNotValid",
	{
		conf:{ verifyArgs: true },
		topic: emptyFunc,
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{ verifyArgs: true },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"argsVer of a Suite may not be set if verifyArgs of conf is "+
	"false",
	"ArgsVerIsNotValid",
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of conf flag allowThrownErr on its own
// and in relation to suite step topic and topicCb

expectErr(
	"allowThrownErr of conf must be undef or a bool",
	"ConfIsNotValid",
	{
		conf:{ allowThrownErr: null },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{ allowThrownErr: false },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"there must be a topic or topicCb with conf prop "+
	"allowThrownErr",
	"AllowThrownErrWithoutTopic",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		next:
		[
			"suite",
			{
				conf:
				{
					allowThrownErr: true
				},
				vows:
				[
					"dingo",
					emptyFunc
				]
			}
		]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		next:
		[
			"suite one",
			{
				conf:
				{
					allowThrownErr: true
				},
				topic: emptyFunc,
				argsVer:[ "undef" ],
				vows:
				[
					"dingo",
					emptyFunc
				]
			},
			"suite two",
			{
				conf:
				{
					allowThrownErr: true
				},
				topicCb: emptyCbFunc,
				argsVer:[],
				vows:
				[
					"dingo",
					emptyFunc
				]
			}
		]
	}
);

// testing verification of conf flag allowCbErr on its own
// and in relation to suite step topicCb

expectErr(
	"allowCbErr of conf must be undef or a bool",
	"ConfIsNotValid",
	{
		conf:{ allowCbErr: 1 },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{ allowThrownErr: false },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"there must be a topicCb with conf prop allowCbErr",
	"AllowCbErrWithoutTopicCb",
	{
		conf:
		{
			allowCbErr: true
		},
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:
		{
			allowCbErr: true
		},
		topicCb: emptyCbFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of conf flag sequential

expectErr(
	"sequential of conf must be undef or a bool",
	"ConfIsNotValid",
	{
		conf:{ sequential: 1 },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	{
		conf:{ sequential: false },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of suite prop next

expectErr(
	"next must be an arr of suites",
	"NextSuitesAreNotValid",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next: healthySuite
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:
		[
			"dingo",
			{
				topic: emptyFunc,
				argsVer: [ "undef" ],
				vows:[ "dango", emptyFunc ]
			}
		]
	}
);

expectErr(
	"next must be a proper arr of suites",
	"NextSuitesAreNotValid",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite ]
	}
);

expectErr(
	"suite name in next must be a proper str",
	"NextSuitesAreNotValid",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "", healthySuite ]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite ]
	}
);

expectErr(
	"suites in next must be non-empty objs",
	"SuiteHasNoRequiredProp",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", {} ]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite ]
	}
);

expectErr(
	"every even next item must be a suite name",
	"NextSuitesAreNotValid",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ healthySuite, "dingo", healthySuite ]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite, "dango", healthySuite ]
	}
);

expectErr(
	"every odd next item must be a suite",
	"SuiteRepresentationNotValid",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite, "dango" ]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite, "dango", healthySuite ]
	}
);

expectErr(
	"suite names in next must be unique",
	"NextSuitesAreNotValid",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite, "dingo", healthySuite ]
	},
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", healthySuite, "dango", healthySuite ]
	}
);

// testing verification of suite step argsVer on its own and in
// relation to suite step topic/topicCb

expectErr(
	"argsVer must be an arr or a FuncVer",
	"ArgsVerIsNotValid",
	{
		topic: function() { return 42; },
		argsVer:{ types: "int" },
		vows:[ "dango", emptyFunc ]
	},
	{
		topic: emptyFunc,
		argsVer: getV(),
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"There must be a topic/topicCb with an argsVer",
	"ArgsVerWithoutTopic",
	{
		conf:{ verifyArgs: true },
		argsVer: [ "undef" ]
	},
	{
		topic: emptyFunc,
		conf:{ verifyArgs: true },
		argsVer:[ "undef" ],
		vows:[ "dongo", emptyFunc ]
	},
	false
);

expectErr(
	"There must be a parent topic/topicCb with an argsVer",
	"ArgsVerWithoutTopic",
	{
		next:
		[
			"dingo",
			{
				conf:{ verifyArgs: true },
				argsVer:[ "undef" ]
			}
		]
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		next:
		[
			"dingo",
			{
				conf:{ verifyArgs: true },
				argsVer:[ "undef" ],
				vows:[ "dongo", emptyFunc ]
			}
		]
	},
	false
);

// testing verification of suite step topic/topicCb in relation
// to suite steps vows

expectErr(
	"Vows must have a topic/topicCb",
	"VowsWithoutTopic",
	{
		vows:[ "dango", emptyFunc ]
	},
	{
		topic: emptyFunc,
		conf:{ verifyArgs: false },
		vows:[ "dango", emptyFunc ]
	},
	false
);

expectErr(
	"Vows must have a parent topic/topicCb",
	"VowsWithoutTopic",
	{
		next:
		[
			"dingo",
			{
				vows:[ "dango", emptyFunc ]
			}
		]
	},
	{
		topic: emptyFunc,
		conf:{ verifyArgs: false },
		next:
		[
			"dingo",
			{
				vows:[ "dango", emptyFunc ]
			}
		]
	},
	false
);

// testing verification of suite steps after and afterCb

expectErr(
	"Suite prop after must be a func",
	"AfterIsNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		after:{ func: emptyFunc }
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		after: emptyFunc
	}
);

expectErr(
	"Suite prop afterCb must be a func",
	"AfterIsNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		afterCb:{ func: emptyCbFunc }
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		afterCb: emptyCbFunc
	}
);

expectErr(
	"A suite may not have both props after and afterCb set",
	"AfterIsNotValid",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		after: emptyFunc,
		afterCb: emptyCbFunc
	},
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		afterCb: emptyCbFunc
	}
);

// test group
// testing verification of Suite prop getSuite

expectErr(
	"Suite prop getSuite must be a func or undef",
	"GetSuiteIsNotValid",
	{ testWithGetSuite: false },
	{
		getSuite:
		[
			function( topic )
			{
				var returnVar =
				{
					topic: emptyFunc,
					argsVer:[ "undef" ],
					vows:[ "vow one", emptyFunc ]
				};
				
				return returnVar;
			}
		]
	},
	{
		getSuite:
		function( topic )
		{
			var returnVar =
			{
				topic: emptyFunc,
				argsVer:[ "undef" ],
				vows:[ "vow one", emptyFunc ]
			};
			
			return returnVar;
		}
	}
);

expectErr(
	"Suite prop getSuite must be alone",
	"SuitePropGetSuiteNotAlone",
	{ testWithGetSuite: false },
	{
		getSuite:
		function( topic )
		{
			var returnVar =
			{
				topic: emptyFunc,
				argsVer:[ "undef" ],
				vows:[ "vow one", emptyFunc ]
			};
			
			return returnVar;
		},
		next:[ "suite one", healthySuite ]
	},
	{
		getSuite:
		function( topic )
		{
			var returnVar =
			{
				topic: emptyFunc,
				argsVer:[ "undef" ],
				vows:[ "vow one", emptyFunc ]
			};
			
			return returnVar;
		}
	}
);

// test group
// testing instances of class Suite

expectErr(
	"A Suite instance may not have both before and beforeCb set",
	"BeforeIsNotValid",
	function()
	{
		var faulty = new Suite( "faulty suite" );
		var healthy = new Suite( "healthy suite" );
		
		faulty.setBefore( emptyFunc );
		faulty.setBeforeCb( emptyCbFunc );
		faulty.add( "suite", healthySuite );
		
		healthy.setBefore( emptyFunc );
		healthy.add( "suite", healthySuite );
		
		return { faulty: faulty, healthy: healthy };
	}
);

expectErr(
	"A Suite instance may not have both after and afterCb set",
	"AfterIsNotValid",
	function()
	{
		var faulty = new Suite( "faulty suite" );
		var healthy = new Suite( "healthy suite" );
		
		faulty.setAfter( emptyFunc );
		faulty.setAfterCb( emptyCbFunc );
		faulty.add( "suite", healthySuite );
		
		healthy.setAfter( emptyFunc );
		healthy.add( "suite", healthySuite );
		
		return { faulty: faulty, healthy: healthy };
	}
);

expectErr(
	"A Suite instance may not have both after and afterCb set",
	"AfterIsNotValid",
	function()
	{
		var faulty = new Suite( "faulty suite" );
		var healthy = new Suite( "healthy suite" );
		
		faulty.setAfter( emptyFunc );
		faulty.setAfterCb( emptyCbFunc );
		faulty.add( "suite", healthySuite );
		
		healthy.setAfter( emptyFunc );
		healthy.add( "suite", healthySuite );
		
		return { faulty: faulty, healthy: healthy };
	}
);

expectErr(
	"A Suite instance must have child suites to run",
	"NoSuitesToRun",
	function()
	{
		var faulty = new Suite( "faulty suite" );
		var healthy = new Suite( "healthy suite" );
		
		healthy.add( "suite", healthySuite );
		
		return { faulty: faulty, healthy: healthy };
	}
);

expectErr(
	"A Suite instance must have a valid conf obj to run",
	"ConfIsNotValid",
	function()
	{
		var faulty = new Suite( "faulty suite" );
		faulty.setConf( { seq: true } );
		faulty.add( "suite", healthySuite );
		
		var healthy = new Suite( "healthy suite" );
		healthy.setConf( { sequential: true } );
		healthy.add( "suite", healthySuite );
		
		return { faulty: faulty, healthy: healthy };
	}
);

});
