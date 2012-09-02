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

var SuiteStepObject = mods.get( "suitestepobject" );
var CbStep = undefined;

mods.delay(
function()
{
	CbStep = mods.get( "cbstep" );
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

sys.extend( CbStepObject, SuiteStepObject );

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
