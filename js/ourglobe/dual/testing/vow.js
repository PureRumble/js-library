ourglobe.define(
[
	"./suiterun",
	"./suitestep",
	"./returnstep",
	"./vowobject"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var ReturnStep = undefined;
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	ReturnStep = mods.get( "returnstep" );
	
	sys.extend( Vow, ReturnStep );
});

var Vow =
getF(
function()
{
	return getV().addA( SuiteRun, { gte: 0 } );
},
function( suiteRun, vowItem )
{
	Vow.ourGlobeSuper.call(
		this, suiteRun, suiteRun.suiteHolder.vows[ vowItem ].value
	);
	
	this.vowName = suiteRun.suiteHolder.vows[ vowItem ].key;
});

return Vow;

},
function( mods, Vow )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );
var VowObject = mods.get( "vowobject" );

Vow.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new VowObject( this );
});

Vow.prototype.getArgs =
getF(
SuiteStep.GET_ARGS_FV,
function()
{
	return this.suiteRun.topic.result;
});

Vow.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "vow '"+this.vowName+"'";
});

});
