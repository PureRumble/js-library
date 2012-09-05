ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestepobject",
	"./cbstep"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var CbStep = undefined;
var SuiteStepObject = undefined;

mods.delay(
function()
{
	CbStep = mods.get( "cbstep" );
	SuiteStepObject = mods.get( "suitestepobject" );
	
	sys.extend( CbStepObject, SuiteStepObject );
});

var CbStepObject =
getF(
function()
{
	return(
		getV()
			.addA( CbStep )
	)
},
function( cbStep )
{
	CbStepObject.ourGlobeSuper.call( this, cbStep );
});

return CbStepObject;

},
function( mods, CbStepObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

CbStepObject.prototype.getCb =
getF(
getV()
	.setE( "any" )
	.setR( "func" ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidGetCbArgs"
		);
	}
	
	var cbStepObject = this;
	
	return(
		function()
		{
			var suiteStep = cbStepObject.suiteStep;
			
			suiteStep.handleCbCall.call(
				suiteStep, undefined, arguments
			);
		}
	);
});

});
