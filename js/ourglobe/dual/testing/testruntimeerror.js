og.define(
[
	"exports"
],
function(
	exports
)
{

var sys = og.sys;
var RuntimeError = og.RuntimeError;

var TestRuntimeError =
sys.getFunc(
RuntimeError.ARGS_FV,
function( msg, errorVar, errorCode, errorPlace )
{
	if( caller === undefined )
	{
		caller = TestRuntimeError;
	}
	
	TestRuntimeError.ourGlobeSuper.call( this, msg, caller );
});

sys.extend( TestRuntimeError, RuntimeError );

exports.TestRuntimeError = TestRuntimeError;

});
