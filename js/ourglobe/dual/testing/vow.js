ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./suiterun",
	"./returnstep"
],
function( mods )
{

var TestRuntimeError = mods.get( "testruntimeerror" );

var ReturnStep = mods.get( "returnstep" );
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
});

var Vow =
function( suiteRun, vowItem )
{
	if( arguments.length !== 2 )
	{
		throw new TestRuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( suiteRun instanceof SuiteRun === false )
	{
		throw new TestRuntimeError(
			"Arg suiteRun must be a SuiteRun", { suiteRun: suiteRun }
		);
	}
	
	if( typeof( vowItem ) !== "string" )
	{
		throw new TestRuntimeError(
			"Arg vowItem must be a string", { vowItem: vowItem }
		);
	}
	
	ReturnStep.call(
		this, suiteRun, suiteRun.suiteHolder.vows[ vowItem ].value
	);
	
	this.vowName = suiteRun.suiteHolder.vows[ vowItem ].key;
};

Vow.prototype.__proto__ = ReturnStep.prototype;

return Vow;

},
function( mods, Vow )
{

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

Vow.prototype.getStepObj =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return {};
};

Vow.prototype.getArgs =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return this.suiteRun.topic.result;
};

Vow.prototype.getName =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return "vow '"+this.vowName+"'";
};

});
