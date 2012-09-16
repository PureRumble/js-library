ourglobe.define(
[
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
var sys = ourglobe.sys;

var CbStep = undefined;
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	CbStep = mods.get( "cbstep" );
	
	sys.extend( TopicCb, CbStep );
});

var TopicCb =
getF(
function()
{
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	this.result = undefined;
	
	if( suiteRun.suiteHolder.topicCb === undefined )
	{
		if( suiteRun.parentRun !== undefined )
		{
			var topicCb = suiteRun.parentRun.topic;
			
			this.result = topicCb.result;
			this.thrownErr = topicCb.thrownErr;
			this.cbErr = topicCb.cbErr;
			
			this.suiteRun = suiteRun;
			this.stepOk = topicCb.stepOk;
			this.err = topicCb.err;
		}
		else
		{
			this.result = [];
			this.thrownErr = undefined;
			this.cbErr = undefined;
			
			this.suiteRun = suiteRun;
			this.stepOk = true;
			this.err = undefined;
		}
		
		return;
	}
	
	TopicCb.ourGlobeSuper.call(
		this, suiteRun, suiteRun.suiteHolder.topicCb
	);
});

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

TopicCb.prototype.takeStep =
getF(
SuiteStep.TAKE_STEP_FV,
function( cb )
{
	if( this.stepOk === undefined )
	{
		TopicCb.ourGlobeSuper.prototype.takeStep.call( this, cb );
		
		return;
	}
	else
	{
// this.stepOk is already set so this TopicCb has been copied
// from another TopicCb
		
		cb( undefined, this.stepOk );
		
		return;
	}
});

TopicCb.prototype.evaluate =
getF(
CbStep.EVALUATE_FV,
function( thrownErr, cbErr, cbArgs )
{
	var conf = this.suiteRun.suiteHolder.conf;
	
	if( thrownErr !== undefined )
	{
		if( conf.allowThrownErr === true )
		{
			this.result = [ thrownErr ];
			
			return undefined;
		}
		else
		{
			return thrownErr;
		}
	}
	
	if( cbErr !== undefined )
	{
		if( conf.allowCbErr === true )
		{
			this.result = cbArgs;
			
			return undefined;
		}
		else
		{
			return cbErr;
		}
	}
	
	this.result = cbArgs;
	
	return undefined;
});

TopicCb.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "topicCb";
});

});
