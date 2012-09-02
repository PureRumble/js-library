ourglobe.require(
[
	"ourglobe/dual/testing",
	"ourglobe/dual/testing/suiteholder"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var FuncVer = ourglobe.FuncVer;

var SuiteRuntimeError = mods.get( "testing" ).SuiteRuntimeError;
var TestRuntimeError = mods.get( "testing" ).TestRuntimeError;
var SuiteHolder = mods.get( "suiteholder" );
var test = mods.get( "testing" ).Test;

var emptyFunc = function() {};

var validSuite =
{
	topic: emptyFunc,
	argsVer: [ "undef" ],
	vows:[ "dango", emptyFunc ]
};

var expectErr =
getF(
getV()
	.addA( "str", "str", "obj", "str", "obj", "bool/undef" )
	.addA(
		"str", "str/undef", "str", "obj", "str", "obj", "bool/undef"
	),
function(
	testName,
	errCode,
	faultySuiteName,
	faultySuite,
	healthySuiteName,
	healthySuite,
	doRecTest
)
{
	if( sys.hasType( faultySuiteName, "obj" ) )
	{
		doRecTest = healthySuite;
		healthySuite = healthySuiteName;
		healthySuiteName = faultySuite;
		faultySuite = faultySuiteName;
		faultySuiteName = errCode;
		errCode = undefined;
	}
	
	if( doRecTest === undefined )
	{
		doRecTest = true;
	}
	
	test.expectErr(
		testName + " - simple suite",
		SuiteRuntimeError,
		errCode,
		function()
		{
			new SuiteHolder( faultySuiteName, faultySuite );
		},
		function()
		{
			new SuiteHolder( healthySuiteName, healthySuite );
		}
	);
	
	if( doRecTest === true )
	{
		test.expectErr(
			testName + " - recursive suite",
			SuiteRuntimeError,
			errCode,
			function()
			{
				new SuiteHolder(
					"recursive suite obj",
					{
						topic: emptyFunc,
						argsVer:[ "undef" ],
						vows:[ "dingo", emptyFunc ],
						next:[ faultySuiteName, faultySuite ]
					}
				);
			},
			function()
			{
				new SuiteHolder(
					"recursive suite obj",
					{
						topic: emptyFunc,
						argsVer:[ "undef" ],
						vows:[ "dingo", emptyFunc ],
						next:[ healthySuiteName, healthySuite ]
					}
				);
			}
		);
	}
});

expectErr(
	"A Suite may not be empty",
	"SuiteHasNoRequiredProp",
	"dingo",
	{},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

expectErr(
	"topic may not be null in a Suite",
	"TopicIsNotValid",
	"dingo",
	{
		topic: null,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

expectErr(
	"vows may not be empty in a Suite",
	"VowsAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[]
	},
	"dingo",
	{
		topic:emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", emptyFunc ]
	}
);

expectErr(
	"Every second item in vows must be a func",
	"VowsAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", "dongo" ]
	},
	"dingo",
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
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ emptyFunc, "dongo", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc, "dongo", emptyFunc ]
	}
);

expectErr(
	"vow names must be unique",
	"VowsAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dongo", emptyFunc, "dongo", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc, "dongo", emptyFunc ]
	}
);

expectErr(
	"A Suite may not have both topic and topicCb",
	"TopicIsNotValid",
	"dingo",
	{
		topic: emptyFunc,
		topicCb: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"argsVer must be an arr or a FuncVer",
	"ArgsVerIsNotValid",
	"dingo",
	{
		topic: function() { return 42; },
		argsVer:{ types: "int" },
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: getV(),
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"conf must be undef or an obj",
	"ConfIsNotValid",
	"dingo",
	{
		conf: null,
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		conf:{},
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"local must be undef or an obj",
	"LocalIsNotValid",
	"dingo",
	{
		local: 43,
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		local:{},
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"verifyArgs of conf must be bool or undef",
	"ConfIsNotValid",
	"dingo",
	{
		conf:{ verifyArgs: 1 },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
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
	"dingo",
	{
		conf:{ verifyArgs: true },
		topic: emptyFunc,
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
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
	"dingo",
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		conf:{ verifyArgs: false },
		topic: emptyFunc,
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"allowThrownErr of conf must be undef or a bool",
	"ConfIsNotValid",
	"dingo",
	{
		conf:{ allowThrownErr: null },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		conf:{ allowThrownErr: false },
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

expectErr(
	"next must be an arr of suites",
	"NextSuitesAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next: validSuite
	},
	"dingo",
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
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite ]
	}
);

expectErr(
	"suite name in next must be a proper str",
	"NextSuitesAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "", validSuite ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite ]
	}
);

expectErr(
	"suites in next must be non-empty objs",
	"SuiteHasNoRequiredProp",
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", {} ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite ]
	}
);

expectErr(
	"every even next item must be a suite name",
	"NextSuitesAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ validSuite, "dingo", validSuite ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite, "dango", validSuite ]
	}
);

expectErr(
	"every odd next item must be a suite",
	"NextSuitesAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite, "dango" ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite, "dango", validSuite ]
	}
);

expectErr(
	"suite names in next must be unique",
	"NextSuitesAreNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite, "dingo", validSuite ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ],
		next:[ "dingo", validSuite, "dango", validSuite ]
	}
);

expectErr(
	"topic/topicCb must have an argsVer",
	"TopicWithoutArgsVer",
	"dingo",
	{
		topic: emptyFunc,
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	false
);

expectErr(
	"There must be a topic/topicCb with an argsVer",
	"ArgsVerWithoutTopic",
	"dingo",
	{
		conf:{ verifyArgs: true },
		argsVer: [ "undef" ]
	},
	"dingo",
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
	"dingo",
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
	"dingo",
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

expectErr(
	"Vows must have a topic/topicCb",
	"VowsWithoutTopic",
	"dingo",
	{
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		topic: emptyFunc,
		conf:{ verifyArgs: false },
		vows:[ "dango", emptyFunc ]
	},
	false
);

expectErr(
	"Vows must have parent topic/topicCb",
	"VowsWithoutTopic",
	"dingo",
	{
		next:
		[
			"dingo",
			{
				vows:[ "dango", emptyFunc ]
			}
		]
	},
	"dingo",
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

expectErr(
	"topic must have vows",
	"TopicWithoutVows",
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	false
);

expectErr(
	"topic must have child vows",
	"TopicWithoutVows",
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		next:
		[
			"dingo",
			{
				argsVer:[ "undef" ],
			}
		]
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		next:
		[
			"dingo",
			{
				argsVer:[ "undef" ],
				vows:[ "dango", emptyFunc ]
			}
		]
	},
	false
);

});
