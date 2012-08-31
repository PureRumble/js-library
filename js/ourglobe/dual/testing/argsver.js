ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./suiterun",
	"./suitestep",
	"./returnstep"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

var ReturnStep = mods.get( "returnstep" );
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
});

var ArgsVer =
getF(
function()
{
	return(
		getV()
			.addA( SuiteRun )
	);
},
function( suiteRun )
{
	ArgsVer.ourGlobeSuper.call(
		this,
		suiteRun,
		function()
		{
			if( suiteRun.suiteHolder.argsVer === undefined )
			{
				return;
			}
			
			var argsAreValid =
				suiteRun.suiteHolder.argsVer.argsAreValid(
					suiteRun.topic.result
				)
			;
			
			if( argsAreValid === false )
			{
				throw new SuiteRuntimeError(
					"The Suite step 'verArgs' doesnt approve of the args "+
					"that are to be provided to the vows and the next "+
					"Suites",
					{
						providedArgs: suiteRun.topic.result,
						argsVer: suiteRun.suiteHolder.argsVer
					},
					"ArgsAreNotValid"
				);
			}
		}
	);
});

sys.extend( ArgsVer, ReturnStep );

return ArgsVer;

},
function( mods, ArgsVer )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var SuiteStep = mods.get( "suitestep" );

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

ArgsVer.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	return {};
});

ArgsVer.prototype.getArgs =
getF(
SuiteStep.GET_ARGS_FV,
function()
{
	return [];
});

ArgsVer.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "argsVer";
});

});
