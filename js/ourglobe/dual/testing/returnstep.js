ourglobe.define(
[
	"./suitestep",
	"./suitestepobject"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteStep = undefined;

mods.delay(
function()
{
	SuiteStep = mods.get( "suitestep" );
	
	sys.extend( ReturnStep, SuiteStep );
});

var ReturnStep =
getF(
function() { return SuiteStep.CONSTR_FV; },
function( suiteRun, func )
{
	this.returnVar = undefined;
	this.thrownErr = undefined;
	
	ReturnStep.ourGlobeSuper.call( this, suiteRun, func );
});

ReturnStep.EVALUATE_FV =
	getV()
		.addA( "any", "undef" )
		.addA( "undef", Error )
		.setR( [ Error, "undef" ] )
;

return ReturnStep;

},
function( mods, ReturnStep )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );
var SuiteStepObject = mods.get( "suitestepobject" );

ReturnStep.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new SuiteStepObject( this );
});

ReturnStep.prototype.landReturnStep =
getF(
SuiteStep.LAND_RETURN_STEP_FV,
function( returnVar, thrownErr )
{
	this.returnVar = returnVar;
	this.thrownErr = thrownErr;
	
	this.landStep(
		undefined, this.evaluate( returnVar, thrownErr )
	);
});

ReturnStep.prototype.evaluate =
getF(
ReturnStep.EVALUATE_FV,
function( returnVar, thrownErr )
{
	return thrownErr;
});

});
