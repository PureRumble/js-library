ourglobe.define(
[
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

var SuiteRun = undefined;
var ReturnStep = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	ReturnStep = mods.get( "returnstep" );
	
	sys.extend( Topic, ReturnStep );
});

var Topic =
getF(
function()
{
	return getV().addA( SuiteRun, [ Topic, "undef" ] );
},
function( suiteRun, topic )
{
	this.result = undefined;
	
	if( topic !== undefined )
	{
		this.result = topic.result;
		this.thrownErr = topic.thrownErr;
		
		this.suiteRun = suiteRun;
		this.stepOk = topic.stepOk;
		this.err = topic.err;
		
		return;
	}
	
	Topic.ourGlobeSuper.call(
		this, suiteRun, suiteRun.suiteHolder.topic
	);
});

return Topic;

},
function( mods, Topic )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var ReturnStep = mods.get( "returnstep" );
var SuiteStep = mods.get( "suitestep" );

Topic.prototype.takeStep =
getF(
SuiteStep.TAKE_STEP_FV,
function( cb )
{
	if( this.stepOk === undefined )
	{
		Topic.ourGlobeSuper.prototype.takeStep.call( this, cb );
		
		return;
	}
	else
	{
// this.stepOk is already set so this Topic has been copied
// from another Topic
		
		cb( undefined, this.stepOk );
		
		return;
	}
});

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
	
	this.result =
		thrownErr !== undefined ? [ thrownErr ] : [ returnVar ]
	;
	
	return undefined;
});

Topic.prototype.getName =
getF(
SuiteStep.GET_NAME_FV,
function()
{
	return "topic";
});

});
