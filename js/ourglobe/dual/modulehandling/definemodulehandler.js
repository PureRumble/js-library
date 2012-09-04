ourglobe.core.define(
[
	"./modulehandler"
],
function( ModuleHandler )
{

var RuntimeError = ourglobe.RuntimeError;
var sys = ourglobe.sys;
var getF = ourglobe.getF;
var getV = ourglobe.getV;

var DefineModuleHandler =
getF(
ModuleHandler.CONSTR_FV,
function( dependencies, require )
{
	this.headerDone = false;
	
	DefineModuleHandler.ourGlobeSuper.call(
		this, dependencies, require
	);
});

sys.extend( DefineModuleHandler, ModuleHandler );

DefineModuleHandler.prototype.markHeaderDone =
getF(
getV(),
function()
{
	this.headerDone = true;
});

DefineModuleHandler.prototype.delay =
getF(
getV()
	.setE( "any" ),
function( cb )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		)
	}
	
	if( sys.hasType( cb, "func" ) === false )
	{
		throw new RuntimeError(
			"Arg cb must be a func",
			{ cb: cb }
		)
	}
	
	if( this.headerDone === false )
	{
		ourglobe.core.ModuleUtils.delayHeaderCb( cb );
	}
	else
	{
		ourglobe.core.ModuleUtils.delayBodyCb( cb );
	}
});

return DefineModuleHandler;

});
