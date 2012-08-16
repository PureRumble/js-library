ourglobe.require(
[
	"ourglobe/dual/testing",
	"ourglobe/dual/testing/suiteholder"
],
function( mods )
{

var getV = ourglobe.getV;
var FuncVer = ourglobe.FuncVer;

var SuiteRuntimeError = mods.get( "testing" ).SuiteRuntimeError;
var TestRuntimeError = mods.get( "testing" ).TestRuntimeError;
var SuiteHolder = mods.get( "suiteholder" );
var test = mods.get( "testing" ).Test;
var expectErr = test.expectErr;

console.log( "A Suite must have a non-empty name" );

expectErr(
	TestRuntimeError,
	function()
	{
		new SuiteHolder(
			"",
			{
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dongo", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dongo", function() {} ]
			}
		);
	}
);

console.log( "A Suite may not be empty" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder( "dingo", {} );
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dingo", function() {} ]
			}
		);
	}
);

console.log( "topic may not be null in a Suite" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: null,
				argsVer:[ "undef" ],
				vows:[ "dingo", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dingo", function() {} ]
			}
		);
	}
);

console.log( "vows may not be empty in a Suite" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic:function() {},
				argsVer:[ "undef" ],
				vows:[ "dongo", function() {} ]
			}
		);
	}
);

console.log( "Every second item in vows must be a func" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dongo", "dongo" ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic:function() {},
				argsVer:[ "undef" ],
				vows:[ "dongo", function() {} ]
			}
		);
	}
);

console.log(
	"Every second item (starting from first) in vows must be a "+
	"vow-name"
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ function() {}, "dongo", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dango", function() {}, "dongo", function() {} ]
			}
		);
	}
);

console.log( "vow names must be unique" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dongo", function() {}, "dongo", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dango", function() {}, "dongo", function() {} ]
			}
		);
	}
);

console.log( "A Suite may not have both topic and topicCb" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				topicCb: function() {},
				argsVer:[ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer:[ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

console.log( "argsVer must be an arr or a FuncVer" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() { return 42; },
				argsVer:{ types: "int" },
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				topic: function() {},
				argsVer: getV(),
				vows:[ "dango", function() {} ]
			}
		);
	}
);

console.log( "conf must be undef or an obj" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf: null,
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{},
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

console.log( "verArgs of conf must be bool or undef" );

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verArgs: 1 },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verArgs: true },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

console.log(
	"argsVer of a Suite must be set if verArgs of conf "+
	"is undef or true"
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verArgs: true },
				topic: function() {},
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verArgs: true },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

console.log(
	"argsVer of a Suite may not be set if verArgs of conf is false"
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verArgs: false },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verArgs: false },
				topic: function() {},
				vows:[ "dango", function() {} ]
			}
		);
	}
);

console.log(
	"allowThrownErr of conf must be undef or a bool"
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ allowThrownErr: undefined },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	},
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ allowThrownErr: false },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

});
