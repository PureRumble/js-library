ourglobe.define(
[
	"./suiterun",
	"./suitestep",
	"./returnstep"
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
	
	sys.extend( Before, ReturnStep );
});

var Before =
getF(
function()
{
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	var before = suiteRun.suiteHolder.before;
	
	if( before === undefined )
	{
		before = function() { };
	}
	
	Before.ourGlobeSuper.call( this, suiteRun, before );
});

return Before;

},
function( mods, Before )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );

Before.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "before";
});

});
