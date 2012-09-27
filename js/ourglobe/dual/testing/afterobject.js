ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestepobject",
	"./suiteresult",
	"./before",
	"./beforecb",
	"./topic",
	"./topiccb",
	"./argsver",
	"./vow",
	"./after",
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteStepObject = undefined;
var After = undefined;

mods.delay(
function()
{
	After = mods.get( "after" );
	SuiteStepObject = mods.get( "suitestepobject" );
	sys.extend( AfterObject, SuiteStepObject );
});

var AfterObject =
getF(
function()
{
	return(
		getV()
			.addA( After )
	)
},
function( after )
{
	AfterObject.ourGlobeSuper.call( this, after );
});

return AfterObject;

},
function( mods, AfterObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteResult = mods.get( "suiteresult" );
var Before = mods.get( "before" );
var BeforeCb = mods.get( "beforecb" );
var Topic = mods.get( "topic" );
var TopicCb = mods.get( "topiccb" );
var ArgsVer = mods.get( "argsver" );
var Vow = mods.get( "vow" );

AfterObject.prototype.topicErrThrown =
getF(
getV().setR( "bool" ),
function()
{
	if( this.stepOk( "topic" ) === undefined )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteStep.suiteRun.suiteHolder },
			"The suite's step topic must have been run "+
			"(but is allowed to fail) for topicErrThrown() to be "+
			"called",
			undefined,
			"TopicHasntRun"
		);
	}
	
	var topic = this.suiteStep.suiteRun.topic;
	
	return topic !== undefined && topic.thrownErr !== undefined;
});

AfterObject.prototype.topicCbErrGiven =
getF(
getV().setR( "bool" ),
function()
{
	if( this.stepOk( "topic" ) === undefined )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteStep.suiteRun.suiteHolder },
			"The suite's step topic must have been run "+
			"(but is allowed to fail) for topicCbErrGiven() to be "+
			"called",
			undefined,
			"TopicHasntRun"
		);
	}
	
	var topic = this.suiteStep.suiteRun.topic;
	
	return topic !== undefined && topic.cbErr !== undefined;
});

AfterObject.prototype.topicErrOccurred =
getF(
getV().setR( "bool" ),
function()
{
	if( this.stepOk( "topic" ) === undefined )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteStep.suiteRun.suiteHolder },
			"The suite's step topic must have been run "+
			"(but is allowed to fail) for topicErrOccurred() to be "+
			"called",
			undefined,
			"TopicHasntRun"
		);
	}
	
	return(
		this.topicErrThrown() === true ||
		this.topicCbErrGiven() === true
	);
});

AfterObject.prototype.getTopicRes =
getF(
SuiteResult.GET_TOPIC_RES_FV,
function()
{
	if( this.stepOk( "topic" ) !== true )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteStep.suiteRun.suiteHolder },
			"The suite's step topic must have been run without "+
			"failing for getTopicRes() to be consulted",
			undefined,
			"TopicHasntRunSuccessfully"
		);
	}
	
	return(
		this.suiteRes.getTopicRes.apply( this.suiteRes, arguments )
	);
});

AfterObject.prototype.suiteOk =
getF(
getV()
	.setE( "any" )
	.setR( "bool" ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidArgsForSuiteOk"
		);
	}
	
	return this.suiteStep.suiteRun.runOk !== false;
});

AfterObject.prototype.stepOk =
getF(
getV()
	.setE( "any" )
	.setR( "bool/undef" ),
function( stepName )
{
	if( arguments.length !== 1 )
	{
		throw new SuiteRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments },
			"InvalidArgsForStepOk"
		);
	}
	
	if(
		stepName !== "before" &&
		stepName !== "beforeCb" &&
		stepName !== "topic" &&
		stepName !== "topicCb" &&
		stepName !== "argsVer" &&
		stepName !== "vow" &&
		stepName !== "vows" &&
		stepName !== "next"
	)
	{
		throw new SuiteRuntimeError(
			"Arg stepName must be either 'before', 'beforeCb', "+
			"'topic', 'topicCb', 'argsVer', 'vow', 'vows' or 'next'",
			{ stepName: stepName },
			"InvalidArgsForStepOk"
		);
	}
	
	var suiteRun = this.suiteStep.suiteRun;
	var failedStep = this.suiteStep.suiteRun.failedSuiteStep;
	var failedSuiteRun = this.suiteStep.suiteRun.failedSuiteRun;
	
	var beforeOk =
		failedStep instanceof Before === false &&
		failedStep instanceof BeforeCb === false
	;
	
	var topicOk;
	
	if( beforeOk !== true )
	{
		topicOk = undefined;
	}
	else
	{
		var topicOk =
			failedStep instanceof Topic === false &&
			failedStep instanceof TopicCb === false
		;
	}
	
	var argsVerOk;
	
	if( topicOk !== true )
	{
		argsVerOk = undefined;
	}
	else
	{
		var argsVerOk = failedStep instanceof ArgsVer === false;
	}
	
	var vowsOk;
	
	if( argsVerOk !== true )
	{
		vowsOk = undefined;
	}
	else
	{
		var vowsOk = failedStep instanceof Vow === false;
	}
	
	var nextOk;
	
	if( vowsOk !== true )
	{
		nextOk = undefined;
	}
	else
	{
		var nextOk = failedSuiteRun === undefined;
	}
	
	if( stepName === "before" || stepName === "beforeCb" )
	{
		return beforeOk;
	}
	
	if( stepName === "topic" || stepName === "topicCb" )
	{
		return topicOk;
	}
	
	if( stepName === "argsVer" )
	{
		return argsVerOk;
	}
	
	if( stepName === "vow" || stepName === "vows" )
	{
		return vowsOk;
	}
	
	if( stepName === "next" )
	{
		return nextOk;
	}
});

});
