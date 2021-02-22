ourglobe.core.define(
[
	"./modulehandler"
],
function( ModuleHandler )
{

var RuntimeError = ourglobe.RuntimeError;
var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var RequireModuleHandler =
getF(
ModuleHandler.CONSTR_FV,
function( dependencies, require )
{
	RequireModuleHandler.ourGlobeSuper.call(
		this, dependencies, require
	);
});

sys.extend( RequireModuleHandler, ModuleHandler );

return RequireModuleHandler;

});
