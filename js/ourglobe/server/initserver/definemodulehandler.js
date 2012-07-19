ourglobe.core.define(
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

var DefineModuleHandler =
getF(
ModuleHandler.CONSTR_FV,
function( dependencies, require )
{
	DefineModuleHandler.ourGlobeSuper.call(
		this, dependencies, require
	);
});

sys.extend( DefineModuleHandler, ModuleHandler );

DefineModuleHandler.delayedCbs = [];

DefineModuleHandler.execDelayedCbs =
getF(
new FuncVer(),
function()
{
	for(
		var item = 0;
		item < DefineModuleHandler.delayedCbs.length;
		item++
	)
	{
		var currCb = DefineModuleHandler.delayedCbs[ item ];
		
		currCb();
	}
	
	DefineModuleHandler.delayedCbs = [];
});

DefineModuleHandler.prototype.delay =
getF(
new FuncVer( [ "func" ] ),
function( cb )
{
	DefineModuleHandler.delayedCbs.push( cb );
});

return DefineModuleHandler;

});
