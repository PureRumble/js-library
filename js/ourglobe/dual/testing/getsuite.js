ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestep",
	"./returnstep",
	"./suiteholder",
	"./suiterun"
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
	
	sys.extend( GetSuite, ReturnStep );
});

var GetSuite =
getF(
function()
{
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	GetSuite.ourGlobeSuper.call(
		this, suiteRun, suiteRun.suiteHolder.getSuite
	);
	
	this.suiteHolder = undefined;
});

return GetSuite;

},
function( mods, GetSuite )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;
var getF = ourGlobe.getF;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

var SuiteHolder = mods.get( "suiteholder" );
var ReturnStep = mods.get( "returnstep" );
var SuiteStep = mods.get( "suitestep" );

GetSuite.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "getSuite";
});

GetSuite.prototype.getStepName =
getF(
SuiteStep.GET_STEP_NAME_FV,
function()
{
	return "getSuite";
});

GetSuite.prototype.evaluate =
getF(
ReturnStep.EVALUATE_FV,
function( returnVar, thrownErr )
{
	if( thrownErr !== undefined )
	{
		return thrownErr;
	}
	
	if( hasT( returnVar, "obj" ) === false )
	{
		return(
			new SuiteRuntimeError(
				"Suite step getSuite must return a suite in shape of "+
				"an obj",
				{ returnedVar: returnVar },
				"GetSuiteMustReturnSuiteObj"
			)
		);
	}
	
	if(
		hasT( returnVar, "obj" ) === false ||
		returnVar[ "getSuite" ] !== undefined
	)
	{
		return(
			new SuiteRuntimeError(
				"Suite step getSuite may not return a suite that in "+
				"turn has step getSuite",
				{ returnedVar: returnVar },
				"SuiteWithGetSuiteReturnedByGetSuite"
			)
		);
	}
	
	try
	{
	
	this.suiteHolder =
		new SuiteHolder( this.suiteRun.suiteHolder, returnVar )
	;
	
	}
	catch( e )
	{
		if( e instanceof SuiteRuntimeError === true )
		{
			return(
				new SuiteRuntimeError(
					e,
					"Suite step getSuite returned an invalid suite",
					{ suiteErr: e },
					"InvalidSuiteReturnedByGetSuite"
				)
			);
		}
		else
		{
			throw e;
		}
	}
});

SuiteStep.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
// SuiteStep getSuite is privileged to using only a few of the
// utility funcs available to a SuiteStep, and
// BasicSuiteStepObject is restricted to only those funcs
	
	return new BasicSuiteStepObject( this );
});

});
