og.define(
function()
{

var OurGlobeError = og.OurGlobeError;
var getF = og.getF;
var sys = og.sys;

var TestError =
getF(
OurGlobeError.CONSTR_FV,
function( msg, errorVar, errorCode, errorPlace )
{
	if( errorPlace === undefined )
	{
		caller = TestError;
	}
	
	TestError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( TestError, OurGlobeError );

return TestError;

});
