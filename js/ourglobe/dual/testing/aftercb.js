ourglobe.define(
[
	"./suiterun",
	"./suitestep",
	"./cbstep",
	"./aftercbobject"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRun = undefined;
var CbStep = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	CbStep = mods.get( "cbstep" );
	
	sys.extend( AfterCb, CbStep );
});

var AfterCb =
getF(
function()
{
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	var afterCb = suiteRun.suiteHolder.afterCb;
	
	AfterCb.ourGlobeSuper.call( this, suiteRun, afterCb );
});

return AfterCb;

},
function( mods, AfterCb )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );
var AfterCbObject = mods.get( "aftercbobject" );

AfterCb.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "afterCb";
});

AfterCb.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new AfterCbObject( this );
});

AfterCb.prototype.getStepName =
getF(
SuiteStep.GET_STEP_NAME_FV,
function()
{
	return "afterCb";
});

});
