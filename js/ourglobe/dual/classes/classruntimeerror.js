ourglobe.core.define(
[],
function()
{

var RuntimeError = ourglobe.RuntimeError;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var ClassRuntimeError =
getF(
RuntimeError.CONSTR_FV,
function( msg, errorVar, errorCode, errorPlace )
{
	if( errorPlace === undefined )
	{
		errorPlace = ClassRuntimeError;
	}
	
	ClassRuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( ClassRuntimeError, RuntimeError );

return ClassRuntimeError;

});
