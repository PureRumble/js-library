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

var Topic =
function( suiteRun )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( suiteRun instanceof SuiteRun === false )
	{
		throw new TestRuntimeError(
			"Arg suiteRun must be a SuiteRun", { suiteRun: suiteRun }
		);
	}
	
	ReturnStep.call( this, suiteRun, suiteRun.suiteHolder.topic );
};

Topic.prototype.__proto__ = ReturnStep.prototype;

return Topic;

},
function( mods, Topic )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var ReturnStep = mods.get( "returnstep" );

Topic.prototype.evaluate =
getF(
ReturnStep.EVALUATE_FV,
function( returnVar, thrownErr )
{
	var conf = this.suiteRun.suiteHolder.conf;
	
	if( thrownErr !== undefined && conf.allowThrownErr === false )
	{
		return thrownErr;
	}
	
	var result =
		thrownErr !== undefined ? [ thrownErr ] : [ returnVar ]
	;
	
	this.result = result;
	this.thrownErr = thrownErr;
	
	return undefined;
});

Topic.prototype.getStepObj =
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

Topic.prototype.getArgs =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	var parentRun = this.suiteRun.parentRun;
	
	return parentRun === undefined ? [] : parentRun.topic.result;
};

Topic.prototype.getName =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return "topic";
};

});
