var RuntimeError = require("ourglobe").RuntimeError;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var TestRuntimeError =
sys.getFunc(
new FuncVer( [ FuncVer.PROPER_STR ], "func/undef" ),
function( msg, caller )
{
	if( caller === undefined )
	{
		caller = TestRuntimeError;
	}
	
	TestRuntimeError.super_.call( this, msg, caller );
});

sys.inherits( TestRuntimeError, RuntimeError );

exports.TestRuntimeError = TestRuntimeError;
