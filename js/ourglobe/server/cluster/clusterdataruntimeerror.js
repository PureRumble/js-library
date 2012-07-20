ourglobe.define(
function( mods )
{

var RuntimeError = ourglobe.RuntimeError;

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var ClusterDataRuntimeError =
getF(
RuntimeError.CONSTR_FV,
function( msg, errorVar, errorCode, errorPlace )
{
	if( errorPlace === undefined )
	{
		errorPlace = ClusterDataRuntimeError;
	}
	
	ClusterDataRuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
});

sys.extend( ClusterDataRuntimeError, RuntimeError );

return ClusterDataRuntimeError;

});
