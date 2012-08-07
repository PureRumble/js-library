ourglobe.require(
[
	"ourglobe/dual/testing"
],
function( mods )
{

var Suite = mods.get( "testing" ).Suite;
var SuiteRuntimeError = mods.get( "testing" ).SuiteRuntimeError;
var TestRuntimeError = mods.get( "testing" ).TestRuntimeError;

var expectErr =
function( errClass, errFunc, refFunc )
{
	if( arguments.length !== 3 )
	{
		throw new Error( "Exactly three args must be provided" );
	}
	
	if( errFunc instanceof Function === false )
	{
		throw new Error( "Arg errFunc must be a func" );
	}
	
	if( refFunc instanceof Function === false )
	{
		throw new Error( "Arg refFunc must be a func" );
	}
	
	if( errClass instanceof Function === false )
	{
		throw new Error( "Arg errClass must be a class constr" );
	}
	
	var errOk = false;
	
	try
	{
		errFunc();
	}
	catch( e )
	{
		if( e.constructor !== errClass )
		{
			e.message =
				"The caught error isnt of expected class:\n"+
				e.message
			;
			
			throw e;
		}
		
		errOk = true;
	}
	
	if( errOk === false )
	{
		throw new Error(
			"An error was expected to occur but this didnt happen"
		);
	}
	
	var err = undefined;
	
	try
	{
		refFunc();
	}
	catch( e )
	{
		err = e;
	}
	
	if( err !== undefined )
	{
		err.message =
			"The reference func mustnt cause an error but this "+
			"occurred:\n"+
			err.message
		;
		
		throw err;
	}
};

var testSuite =
function( suite, cb )
{
	if( arguments.length !== 2 )
	{
		throw new Error( "Exactly two args must be provided" );
	}
	
	if( suite instanceof Suite === false )
	{
		throw new Error( "Arg suite must be a Suite" );
	}
	
	if( cb instanceof Function === false )
	{
		throw new Error( "Arg cb must be a func" );
	}
	
	suite.run(
	undefined,
	function( res )
	{
		var testRes = cb( res );
		
		if( testRes !== undefined )
		{
			throw new Error( "A test failed:\n"+testRes );
		}
	});
}

expectErr(
	TestRuntimeError,
	function()
	{
		new Suite(
			"",
			{
				topic: function() {},
				vows:[ "dongo", function() {} ]
			}
		);
	},
	function()
	{
		new Suite(
			"dingo",
			{
				topic: function() {},
				vows:[ "dongo", function() {} ]
			}
		);
	}
);

expectErr(
	SuiteRuntimeError,
	function() { new Suite( "dingo", {} ); },
	function()
	{
		new Suite( "dingo", { topic:function() {} } );
	}
);

expectErr(
	SuiteRuntimeError,
	function() { new Suite( "dingo", { topic: null } ); },
	function()
	{
		new Suite( "dingo", { topic:function() {} } );
	}
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new Suite(
			"dingo",
			{
				topic: function() {},
				vows:[]
			}
		);
	},
	function()
	{
		new Suite(
			"dingo",
			{
				topic:function() {},
				vows:[ "dongo", function() {} ]
			}
		);
	}
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new Suite(
			"dingo",
			{
				topic: function() {},
				vows:[ "dongo", "dongo" ]
			}
		);
	},
	function()
	{
		new Suite(
			"dingo",
			{
				topic:function() {},
				vows:[ "dongo", function() {} ]
			}
		);
	}
);

expectErr(
	SuiteRuntimeError,
	function()
	{
		new Suite(
			"dingo",
			{
				topic: function() {},
				vows:[ function() {}, "dongo", function() {} ]
			}
		);
	},
	function()
	{
		new Suite(
			"dingo",
			{
				topic: function() {},
				vows:[ "dango", function() {}, "dongo", function() {} ]
			}
		);
	}
);

testSuite(
	new Suite(
		"dingo",
		{
			topic: function() { return "dango"; }
		}
	),
	function( run )
	{
		if(
			run instanceof Object === false ||
			run.topicRes instanceof Object === false ||
			run.topicRes.res !== "dango"
		)
		{
			return "run result is invalid";
		}
	}
);

});
