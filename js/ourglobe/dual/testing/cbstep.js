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
	this.cbTimedOut = false;
	this.cbStepDone = false;
	this.cbStepErrGiven = false;
	this.cbStepDone = false;
	
	this.cbArgs = undefined;
	this.thrownErr = undefined;
	this.cbErr = undefined;
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
		.addA( Error, "undef", "undef" )
		.addA( "undef", [ Error, "undef" ], "arr" )
		.setR( [ Error, "undef" ] )
;

CbStep.DEFAULT_CB_TIMEOUT = 5000;

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

CbStep.prototype.evaluateCbStep =
getF(
getV()
	.addA( [ Error, "undef" ] ),
function( err )
{
// If an err has occurred then give it to landStep() but only if
// no such err has already been handed over
	if( err !== undefined )
	{
		if( this.cbStepErrGiven === false )
		{
			this.cbStepErrGiven = true;
			this.landStep( err );
		}
		
		return;
	}
	
// So no err has occurred, but if such an err has previously
// occurred, or if evaluateCbStep() is already done evaluating
// the CbStep, then do nothing
	if( this.cbStepErrGiven === true || this.cbStepDone === true )
	{
		return;
	}
	
// Do nothing if all necessary data hasnt been set before
// evaluation can take place
	if(
// Continue with evaluation if an err has been thrown by the
// CbStep
		this.thrownErr === undefined &&
// Otherwise continue if the cb has been called (or timed out)
// _and_ the CbStep has returned
		(
			(
				this.cbTimedOut === false && this.stepCbCalled === false
			)
			||
			this.stepReturned === false
		)
	)
	{
		return;
	}
	
// Mark that evaluation is done, since this will be the case once
// this call of evaluateCbStep() is done
	this.cbStepDone = true;
	
// Free up the queue slot that was occupied by this CbStep
	this.suiteRun.cbStepQueue.freeSlot();
	
// The call to landStep() might add more CbSteps to the queue,
// so the CbSteps of the queue arent initiated before that
	if( this.thrownErr !== undefined )
	{
		this.landStep( undefined, this.evaluate( this.thrownErr ) );
	}
	else if( this.cbTimedOut === true )
	{
		this.landStep(
			undefined, 
			new SuiteRuntimeError(
				"The cb of Suite step '"+this.stepName+"' hasnt "+
				"been called within the allowed time limit",
				{ stepName: this.stepName },
				"SuiteStepCbNotCalled"
			)
		);
	}
	else
	{
		this.landStep(
			undefined,
			this.evaluate( undefined, this.cbErr, this.cbArgs )
		);
	}
	
// Allow the next CbSteps of the queue to take a slot and run
	this.suiteRun.cbStepQueue.fillSlots();
});

CbStep.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return new CbStepObject( this );
});

CbStep.prototype.takeStepFromQueue =
getF(
getV(),
function()
{
	var timeout = this.getCbTimeout();
	var cbStep = this;
	
	this.cbTimeoutId =
	setTimeout(
		function()
		{
			cbStep.markCbTimedOut();
		},
		timeout
	);
	
	CbStep.ourGlobeSuper.prototype.takeStep.call(
		this, this.suiteStepCb
	);
});

CbStep.prototype.takeStep =
getF(
SuiteStep.TAKE_STEP_FV,
function( cb )
{
// Saving the cb here instead of waiting for SuiteStep.takeStep()
// to do it so the cb can be used when running the CbStep from
// CbStepQueue
	this.suiteStepCb = cb;
	
	this.suiteRun.cbStepQueue.add( this );
	
// The CbStep is only added but the queue isnt started here.
// Instead it is always started by evaluateCbStep() once a
// CbStep is done or by the root SuiteRun that is the first
// to ever call takeStep()
});

CbStep.prototype.landReturnStep =
getF(
SuiteStep.LAND_RETURN_STEP_FV,
function( returnVar, thrownErr )
{
	this.stepReturned = true;
	
	this.handleCbThrownErr();
	
// A cb call isnt expected of the suite step if an err has been
// thrown
	if( thrownErr !== undefined )
	{
		if( this.cbTimeoutId !== undefined )
		{
			clearTimeout( this.cbTimeoutId );
			
			this.cbTimeoutId = undefined;
		}
		
		if( this.stepCbCalled === true )
		{
			this.evaluateCbStep(
				new SuiteRuntimeError(
					"The cb of suite step '"+this.stepName+"' has thrown "+
					"an err after having called its cb. Due to this all "+
					"running suites must be terminated",
					{
						stepName: this.stepName,
						thrownErr: thrownErr,
						cbArgs: this.cbArgs
					},
					"SuiteStepCbCalledAndErrThrown"
				)
			);
			
			return;
		}
		
		this.thrownErr = thrownErr;
	}
	
	this.evaluateCbStep();
});

CbStep.prototype.markCbTimedOut =
getF(
getV(),
function()
{
	this.cbTimeoutId = undefined;
	
	if( this.stepCbCalled === false )
	{
		this.cbTimedOut = true;
	}
	
	this.evaluateCbStep();
});

CbStep.prototype.landCbStep =
getF(
getV()
	.addA( Error )
	.addA( "undef", "obj" ),
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
	
// If the step's cb has already been called, or the CbStep has
// thrown an err when executed by the suite
	if(
		this.stepCbCalled === true || this.thrownErr !== undefined
	)
	{
		if( this.stepCbCalled === true )
		{
			this.evaluateCbStep(
				new SuiteRuntimeError(
					"The cb of suite step '"+this.stepName+"' has been "+
					"called twice. Due to this all running suites must "+
					"be terminated",
					{
						stepName: this.stepName,
						currentCbArgs: cbArgs,
						previousCbArgs: this.cbArgs
					},
					"SuiteStepCbCalledTwice"
				)
			);
		}
		else
		{
			this.evaluateCbStep(
				new SuiteRuntimeError(
					"The cb of suite step '"+this.stepName+"' has been "+
					"called after that the step has thrown an err. Due "+
					"to this all running suites must be terminated",
					{
						stepName: this.stepName,
						thrownErr: this.thrownErr,
						cbArgs: cbArgs
					},
					"SuiteStepCbCalledAndErrThrown"
				)
			);
		}
		
		return;
	}
	
	var cbErr = undefined;
	if(
		cbArgs.length > 0 && cbArgs[ 0 ] instanceof Error === true
	)
	{
		cbErr = cbArgs[ 0 ];
	}
	
	this.stepCbCalled = true;
	this.cbArgs = cbArgs;
	this.cbErr = cbErr;
	
	this.evaluateCbStep();
});

CbStep.prototype.getCbTimeout =
getF(
CbStep.GET_CB_TIMEOUT_FV,
function()
{
	return CbStep.DEFAULT_CB_TIMEOUT;
});

CbStep.prototype.evaluate =
getF(
CbStep.EVALUATE_FV,
function( thrownErr, cbErr, cbArgs )
{
	if( thrownErr !== undefined )
	{
		return thrownErr;
	}
	
	if( cbErr !== undefined )
	{
		return cbErr;
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
