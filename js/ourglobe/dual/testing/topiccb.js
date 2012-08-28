ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./suiterun",
	"./suitestep",
	"./cbstep",
	"./topic"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var TestRuntimeError = mods.get( "testruntimeerror" );
var CbStep = mods.get( "cbstep" );
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
});

var TopicCb =
getF(
function() { return getV().addA( SuiteRun ); },
function( suiteRun )
{
	CbStep.call( this, suiteRun, suiteRun.suiteHolder.topicCb );
});

TopicCb.prototype.__proto__ = CbStep.prototype;

return TopicCb;

},
function( mods, TopicCb )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteStep = mods.get( "suitestep" );
var CbStep = mods.get( "cbstep" );
var Topic = mods.get( "topic" );

TopicCb.prototype.getArgs = Topic.prototype.getArgs;

TopicCb.prototype.evaluate =
getF(
CbStep.EVALUATE_FV,
function( returnVar, thrownErr, cbArgs )
{
	var conf = this.suiteRun.suiteHolder.conf;
	
	if( thrownErr !== undefined && conf.allowThrownErr === false )
	{
		return thrownErr;
	}
	
	var cbErr = undefined;
	
	if(
		cbArgs !== undefined &&
		cbArgs.length > 0 &&
		cbArgs[ 0 ] instanceof Error === true
	)
	{
		cbErr = cbArgs[ 0 ];
	}
	
	if( cbErr !== undefined && conf.allowCbErr === false )
	{
		return cbErr;
	}
	
	if( thrownErr !== undefined && cbArgs !== undefined )
	{
		return(
			new SuiteRuntimeError(
				"Suite step 'topicCb' may not both throw an err"+
				"err and call its cb, but it is allowed to do so if "+
				"the prop 'conf' forbids thrown errs or if there is a "+
				"cb err that 'conf' forbids (in such case 'topicCb' "+
				"fails)",
				{ thrownErr: thrownErr, cbArgs: cbArgs },
				"ErrThrownAndCbCalled"
			)
		);
	}
	
	var result = thrownErr !== undefined ? [ thrownErr ] : cbArgs;
	
	this.result = result;
	this.thrownErr = thrownErr;
	this.cbErr = cbErr;
	
	return undefined;
});

TopicCb.prototype.getStepObj =
getF(
SuiteStep.GET_STEP_OBJ_FV,
function()
{
	var stepObj =
	{
		getCb: this.getCbFunc()
	};
	
	return stepObj;
});

TopicCb.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "topicCb";
});

});
