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

var SuiteRuntimeError = undefined;
var ReturnStep = undefined;
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRuntimeError = mods.get( "suiteruntimeerror" );
	SuiteRun = mods.get( "suiterun" );
	ReturnStep = mods.get( "returnstep" );
	
	sys.extend( ArgsVer, ReturnStep );
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
					{ suite: suiteRun.suiteHolder },
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

return ArgsVer;

},
function( mods, ArgsVer )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var SuiteStep = mods.get( "suitestep" );

ArgsVer.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "argsVer";
});

});
