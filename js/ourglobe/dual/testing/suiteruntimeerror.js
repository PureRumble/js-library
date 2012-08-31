ourglobe.define(
function( mods )
{

var sys = ourglobe.sys;
var getV = ourglobe.getV;
var getF = ourglobe.getF;
var RuntimeError = ourglobe.RuntimeError;

var SuiteRuntimeError =
getF(
RuntimeError.CONSTR_FV,
function( msg, errorVar, errorCode, errorPlace )
{
	if( errorPlace === undefined )
	{
		errorPlace = SuiteRuntimeError;
	}
	
	SuiteRuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( SuiteRuntimeError, RuntimeError );

SuiteRuntimeError.prototype.className =  "SuiteRuntimeError";

return SuiteRuntimeError;

});
