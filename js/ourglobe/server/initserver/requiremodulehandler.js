og.core.define(
[
	"ourglobe/dual/core/core",
	"./modulehandler"
],
function( core, ModuleHandler )
{

var RuntimeError = core.RuntimeError;
var sys = core.sys;
var getF = core.getF;
var FuncVer = core.FuncVer;

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
