ourglobe.define(
function()
{

var OurGlobeError = ourglobe.OurGlobeError;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var TestingError =
getF(
getV()
	.addA(
		[ OurGlobeError.MSG_S, "undef" ],
		[ OurGlobeError.VAR_S, "undef" ],
		[ OurGlobeError.CODE_S, "undef" ],
		[ OurGlobeError.PLACE_S, "undef" ]
	),
function( msg, errorVar, errorCode, errorPlace )
{
	if( msg === undefined )
	{
		msg =
			"this TestingError was created in a test for testing "+
			"purposes"
		;
	}
	
	if( errorPlace === undefined )
	{
		caller = TestingError;
	}
	
	TestingError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( TestingError, OurGlobeError );

return TestingError;

});
