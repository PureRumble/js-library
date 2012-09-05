ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestep",
	"./cbstepobject"
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
	
	sys.extend( CbStep, SuiteStep );
});

var CbStep =
getF(
function() { return SuiteStep.CONSTR_FV; },
function( suiteRun, func )
{
	this.stepReturned = false;
	this.stepCbCalled = false;
	this.cbStepDone = false;
	
	this.cbStepReturnVar = undefined;
	this.cbStepThrownErr = undefined;
	this.cbStepCbArgs = undefined;
	this.cbTimeoutId = undefined;
	
	this.storedCbThrownErr = undefined;
	
	SuiteStep.call( this, suiteRun, func );
});

CbStep.GET_CB_TIMEOUT_FV =
	getV()
		.setR( { gte: 0 } )
;

CbStep.EVALUATE_FV =
	getV()
		.addA( "any", "undef", "arr" )
		.addA( "undef", Error, "undef/arr" )
		.setR( [ Error, "undef" ] )
;

CbStep.DEFAULT_CB_TIMEOUT = 1000;

return CbStep;

},
function( mods, CbStep )
{

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

var SuiteStep = mods.get( "suitestep" );
var CbStepObject = mods.get( "cbstepobject" );

CbStep.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new CbStepObject( this );
});

CbStep.prototype.takeStep =
getF(
SuiteStep.TAKE_STEP_FV,
function( cb )
{
	var timeout = this.getCbTimeout();
	var cbStep = this;
	
	this.cbTimeoutId =
	setTimeout(
		function()
		{
			cbStep.cbTimeoutId = undefined;
			
			cbStep.landCbStep( undefined, "CbTimedOut" );
		},
		timeout
	);
	
	SuiteStep.prototype.takeStep.call( this, cb );
});

CbStep.prototype.landReturnStep =
getF(
SuiteStep.LAND_RETURN_STEP_FV,
function( returnVar, thrownErr )
{
	this.stepReturned = true;
	
	this.handleCbThrownErr();
	
	this.cbStepReturnVar = returnVar;
	this.cbStepThrownErr = thrownErr;
	
	this.evaluateCbStep();
});

CbStep.prototype.landCbStep =
getF(
getV()
	.addA( Error )
	.addA( "undef", [ "obj", { values:[ "CbTimedOut" ] } ] ),
function( err, cbArgs )
{
	if( this.cbTimeoutId !== undefined )
	{
		clearTimeout( this.cbTimeoutId );
		
		this.cbTimeoutId = undefined;
	}
	
	if( err !== undefined )
	{
		this.evaluateCbStep( err );
		
		return;
	}
	
	if( sys.hasType( cbArgs, "obj" ) === true )
	{
		cbArgs = Array.prototype.slice.call( cbArgs );
	}
	
// If the step's cb has already been called, or the CbStep is
// already done
	if( this.stepCbCalled === true || this.cbStepDone === true )
	{
// If the timeout that was set for the
// calling of cb has been triggered then its ignored since the 
// cb has been called or the suite step is done
		if( cbArgs === "CbTimedOut" )
		{
			return;
		}
		
		if( this.stepOk !== false )
		{
			this.evaluateCbStep(
				new SuiteRuntimeError(
					"The cb of Suite step '"+this.stepName+"' has been "+
					"called twice or the cb has been called after that "+
					"the Suite step has thrown an err. Since the "+
					"Suite step has still not failed now that the second "+
					"cb call has come in, all running Suites must be "+
					"terminated",
					{
						stepName: this.stepName,
						currentCbCallArgs: cbArgs,
						previousCbCallArgs: this.cbStepCbArgs,
						suiteStepThrownErr: this.cbStepThrownErr
					}
				)
			);
			
			return;
		}
		
		return;
	}
	
	this.stepCbCalled = true;
	
	if( cbArgs === "CbTimedOut" )
	{
		this.evaluateCbStep(
			undefined,
			new SuiteRuntimeError(
				"The cb of Suite step '"+this.stepName+"' hasnt "+
				"been called within the allowed time limit",
				{ stepName: this.stepName },
				"SuiteStepCbNotCalled"
			)
		);
		
		return;
	}
	
	this.cbStepCbArgs = cbArgs;
	
	this.evaluateCbStep();
});

CbStep.prototype.getCbTimeout =
getF(
CbStep.GET_CB_TIMEOUT_FV,
function()
{
	return CbStep.DEFAULT_CB_TIMEOUT;
});

CbStep.prototype.evaluateCbStep =
getF(
getV()
	.addA( Error )
	.addA( "undef", [ Error, "undef" ] ),
function( err, cbErr )
{
	if( err !== undefined )
	{
		this.landStep( err );
		
		return;
	}
	
	if( cbErr !== undefined )
	{
		this.cbStepDone = true;
		
		this.landStep( undefined, cbErr );
		
		return;
	}
	
	if(
		this.cbStepThrownErr === undefined &&
		(
			this.stepCbCalled === false || this.stepReturned === false
		)
	)
	{
		return;
	}
	
	this.cbStepDone = true;
	
	this.landStep(
		undefined,
		this.evaluate(
			this.cbStepReturnVar,
			this.cbStepThrownErr,
			this.cbStepCbArgs
		)
	);
});

CbStep.prototype.evaluate =
getF(
CbStep.EVALUATE_FV,
function( returnVar, thrownErr, cbArgs )
{
	if( thrownErr !== undefined )
	{
		return thrownErr;
	}
	
	if(
		cbArgs.length !== 0 &&
		cbArgs[ 0 ] instanceof Error === true
	)
	{
		return cbArgs[ 0 ];
	}
	
	return undefined;
});

CbStep.prototype.handleCbCall =
getF(
getV()
	.addA( Error )
	.addA( "undef", "obj" ),
function( err, args )
{
	try
	{
		this.landCbStep( err, args );
	}
	catch( e )
	{
		this.handleCbThrownErr( e );
	}
});

CbStep.prototype.handleCbThrownErr =
getF(
getV()
	.addA( [ Error, "undef" ] ),
function( cbThrownErr )
{
	if( cbThrownErr !== undefined )
	{
		if( this.stepReturned === true )
		{
			throw cbThrownErr;
		}
		else if( this.storedCbThrownErr === undefined )
		{
			this.storedCbThrownErr = cbThrownErr;
		}
	}
	else if( this.storedCbThrownErr !== undefined )
	{
		throw this.storedCbThrownErr;
	}
});

});
