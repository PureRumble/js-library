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

var CbStep = mods.get( "cbstep" );
var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
});

var TopicCb =
getF(
function()
{
	return getV().addA( SuiteRun, [ TopicCb, "undef" ] );
},
function( suiteRun, topicCb )
{
	this.result = undefined;
	this.thrownErr = undefined;
	this.cbErr = undefined;
	
	if( topicCb !== undefined )
	{
		this.result = topicCb.result;
		this.thrownErr = topicCb.thrownErr;
		this.cbErr = topicCb.cbErr;
		
		this.suiteRun = suiteRun;
		this.stepOk = topicCb.stepOk;
		this.err = topicCb.err;
		
		return;
	}
	
	var topicCb = suiteRun.suiteHolder.topicCb;
	
	if( topicCb !== undefined )
	{
		TopicCb.ourGlobeSuper.call( this, suiteRun, topicCb );
		
		return;
	}
	else
	{
		TopicCb.ourGlobeSuper.call(
			this,
			suiteRun,
			function()
			{
				var cb = this.getCb();
				
				cb();
			}
		);
		
		return;
	}
});

sys.extend( TopicCb, CbStep );

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

TopicCb.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "topicCb";
});

});
