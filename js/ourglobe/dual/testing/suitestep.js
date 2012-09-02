ourglobe.define(
[
	"./suiteruntimeerror",
	"./suiterun",
	"./suitestepobject"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRun = undefined;
var SuiteStepObject = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	var SuiteStepObject = mods.get( "suitestepobject" );
	
	SuiteStep.CONSTR_FV =
		getV()
			.addA( SuiteRun, "func" )
	;
	
	SuiteStep.GET_STEP_OBJ_FV =
		getV()
			.setR( SuiteStepObject )
	;
});

var SuiteStep =
getF(
function() { return SuiteStep.CONSTR_FV; },
function( suiteRun, func )
{
	this.suiteRun = suiteRun;
	this.func = func;
	
	this.stepOk = undefined;
	this.err = undefined;
	this.suiteStepCb = undefined;
	
	this.stepName = this.getName();
});

SuiteStep.LAND_RETURN_STEP_FV =
	getV()
		.addA( "any", "undef" )
		.addA( "undef", Error )
;

SuiteStep.GET_NAME_FV =
	getV()
		.setR( "str" )
;

SuiteStep.GET_ARGS_FV =
	getV()
		.setR( "arr" )
;

SuiteStep.TAKE_STEP_FV =
	getV()
		.addA( "func" )
;

SuiteStep.TAKE_STEP_CB_FV =
	getV()
		.addA( Error )
		.addA( "undef", "bool" )
;

return SuiteStep;

},
function( mods, SuiteStep )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteRun = mods.get( "suiterun" );
var SuiteStepObject = mods.get( "suitestepobject" );

SuiteStep.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new SuiteStepObject( this );
});

SuiteStep.prototype.takeStep =
getF(
SuiteStep.TAKE_STEP_FV,
function( cb )
{
	this.suiteStepCb = cb;
	
	var stepObj = this.getStepObj();
	var args = this.getArgs();
	
	var returnVar = undefined;
	var err = undefined;
	
	try
	{
		returnVar = this.func.apply( stepObj, args );
	}
	catch( e )
	{
		err = e;
	}
	
	this.landReturnStep( returnVar, err );
});

SuiteStep.prototype.landStep =
getF(
getV()
	.addA( Error )
	.addA( "undef", [ Error, "undef" ] ),
function( err, stepErr )
{
	if( err !== undefined )
	{
		this.suiteStepCb( err );
		
		return;
	}
	
	this.err = stepErr;
	
	this.stepOk = this.err === undefined;
	
	if( this.stepOk === false )
	{
		this.suiteRun.runOk = false;
	}
	
	this.suiteStepCb( undefined, this.stepOk );
});

});
