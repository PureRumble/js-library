ourglobe.define(
[
	"./testruntimeerror",
	"./suiterun",
	"./suitestep"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteStep = mods.get( "suitestep" );

var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
});

var ReturnStep =
getF(
function() { return SuiteStep.CONSTR_FV; },
function( suiteRun, func )
{
	SuiteStep.call( this, suiteRun, func );
});

ReturnStep.EVALUATE_FV =
	getV()
		.addA( "any", "undef" )
		.addA( "undef", Error )
		.setR( [ Error, "undef" ] )
;

ReturnStep.prototype.__proto__ = SuiteStep.prototype;

return ReturnStep;

},
function( mods, ReturnStep )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteStep = mods.get( "suitestep" );

ReturnStep.prototype.landReturnStep =
getF(
SuiteStep.LAND_RETURN_STEP_FV,
function( returnVar, thrownErr )
{
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
