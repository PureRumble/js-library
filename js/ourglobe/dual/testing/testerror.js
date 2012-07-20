ourglobe.define(
function()
{

var OurGlobeError = ourglobe.OurGlobeError;
var getF = ourglobe.getF;
var sys = ourglobe.sys;

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
