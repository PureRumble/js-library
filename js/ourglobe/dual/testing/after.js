ourglobe.define(
[
	"./suiterun",
	"./suitestep",
	"./returnstep",
	"./afterobject"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRun = undefined;
var ReturnStep = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	ReturnStep = mods.get( "returnstep" );
	
	sys.extend( After, ReturnStep );
});

var After =
getF(
function()
{
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	var after = suiteRun.suiteHolder.after;
	
	if( after === undefined )
	{
		after = function() { };
	}
	
	After.ourGlobeSuper.call( this, suiteRun, after );
});

return After;

},
function( mods, After )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );
var AfterObject = mods.get( "afterobject" );

After.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "after";
});

After.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new AfterObject( this );
});

});
