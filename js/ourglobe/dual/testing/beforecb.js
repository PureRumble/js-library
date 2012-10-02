ourglobe.define(
[
	"./suiterun",
	"./suitestep",
	"./cbstep"
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
	
	sys.extend( BeforeCb, CbStep );
});

var BeforeCb =
getF(
function()
{
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	BeforeCb.ourGlobeSuper.call(
		this,
		suiteRun,
		suiteRun.suiteHolder.beforeCb
	);
});

return BeforeCb;

},
function( mods, BeforeCb )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );

BeforeCb.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "beforeCb";
});

BeforeCb.prototype.getStepName =
getF(
SuiteStep.GET_STEP_NAME_FV,
function()
{
	return "beforeCb";
});

});
