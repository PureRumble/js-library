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

// testing verification of empty suites

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

// testing verification of suite steps before and beforeCb

expectErr(
	"Suite prop before must be a func",
	"BeforeIsNotValid",
	"dingo",
	{
		before:[ emptyFunc ],
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	"dingo",
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
	"dingo",
	{
		beforeCb:[ emptyFunc ],
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	"dingo",
	{
		beforeCb: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	}
);

expectErr(
	"A suite may not have both props before and beforeCb set",
	"BeforeIsNotValid",
	"dingo",
	{
		before: emptyFunc,
		beforeCb: emptyFunc,
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ]
	},
	"dingo",
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

// testing verification of vows

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

// testing verification of suite prop conf

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

// testing verification of suite prop local

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

// testing verification of conf flag verifyArgs on its own and
// in relation to suite step argsVer

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

// testing verification of conf flag allowThrownErr on its own
// and in relation to suite step topic and topicCb

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
	"there must be a topic or topicCb with conf prop "+
	"allowThrownErr",
	"AllowThrownErrWithoutTopic",
	"dingo",
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
	"dingo",
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
				topicCb: emptyFunc,
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
	"dingo",
	{
		conf:{ allowCbErr: 1 },
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
	"there must be a topicCb with conf prop allowCbErr",
	"AllowCbErrWithoutTopicCb",
	"dingo",
	{
		conf:
		{
			allowCbErr: true
		},
		topic: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	},
	"dingo",
	{
		conf:
		{
			allowCbErr: true
		},
		topicCb: emptyFunc,
		argsVer: [ "undef" ],
		vows:[ "dango", emptyFunc ]
	}
);

// testing verification of suite prop next

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

// testing verification of suite step argsVer on its own and in
// relation to suite step topic/topicCb

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

// testing verification of suite step topic/topicCb in relation
// to suite step vows

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

// testing verification of suite step after

expectErr(
	"Suite prop after must be a func",
	"AfterIsNotValid",
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		after:{ func: emptyFunc }
	},
	"dingo",
	{
		topic: emptyFunc,
		argsVer:[ "undef" ],
		vows:[ "dingo", emptyFunc ],
		after: emptyFunc
	}
);

});
