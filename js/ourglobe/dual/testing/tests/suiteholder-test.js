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

expectErr(
	 "A Suite must have a non-empty name",
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

expectErr(
	"A Suite may not be empty",
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

expectErr(
	"topic may not be null in a Suite",
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

expectErr(
	"vows may not be empty in a Suite",
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

expectErr(
	"Every second item in vows must be a func",
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

expectErr(
	"Every second item (starting from first) in vows must be a "+
	"vow-name",
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

expectErr(
	"vow names must be unique",
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

expectErr(
	"A Suite may not have both topic and topicCb",
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

expectErr(
	"argsVer must be an arr or a FuncVer",
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

expectErr(
	"conf must be undef or an obj",
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

expectErr(
	"verifyArgs of conf must be bool or undef",
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verifyArgs: 1 },
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
				conf:{ verifyArgs: true },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

expectErr(
	"argsVer of a Suite must be set if verifyArgs of conf "+
	"is undef or true",
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verifyArgs: true },
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
				conf:{ verifyArgs: true },
				topic: function() {},
				argsVer: [ "undef" ],
				vows:[ "dango", function() {} ]
			}
		);
	}
);

expectErr(
	"argsVer of a Suite may not be set if verifyArgs of conf is "+
	"false",
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ verifyArgs: false },
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
				conf:{ verifyArgs: false },
				topic: function() {},
				vows:[ "dango", function() {} ]
			}
		);
	}
);

expectErr(
	"allowThrownErr of conf must be undef or a bool",
	SuiteRuntimeError,
	function()
	{
		new SuiteHolder(
			"dingo",
			{
				conf:{ allowThrownErr: null },
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
