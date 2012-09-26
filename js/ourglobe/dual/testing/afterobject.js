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
SuiteResult.TOPIC_ERR_THROWN_FV,
function()
{
	if( this.suiteStep.suiteRun.topic.stepOk !== true )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteStep.suiteRun.suiteHolder },
			"The suite's step topic must have been run without "+
			"failing for topicErrThrown() to be consulted",
			undefined,
			"TopicHasntRunSuccessfully"
		);
	}
	
	return(
		this.suiteRes.topicErrThrown.apply(
			this.suiteRes, arguments
		)
	);
});

AfterObject.prototype.topicErrOccurred =
getF(
SuiteResult.TOPIC_ERR_OCCURRED_FV,
function()
{
	if( this.suiteStep.suiteRun.topic.stepOk !== true )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteStep.suiteRun.suiteHolder },
			"The suite's step topic must have been run without "+
			"failing for topicErrOccurred() to be consulted",
			undefined,
			"TopicHasntRunSuccessfully"
		);
	}
	
	return(
		this.suiteRes.topicErrOccurred.apply(
			this.suiteRes, arguments
		)
	);
});

AfterObject.prototype.getTopicRes =
getF(
SuiteResult.GET_TOPIC_RES_FV,
function()
{
	if( this.suiteStep.suiteRun.topic.stepOk !== true )
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
	
	if( stepName === "before" || stepName === "beforeCb" )
	{
		return suiteRun.before.stepOk;
	}
	
	if( stepName === "topic" || stepName === "topicCb" )
	{
		return suiteRun.topic.stepOk;
	}
	
	if( stepName === "argsVer" )
	{
		return suiteRun.argsVer.stepOk;
	}
	
	if( stepName === "vow" || stepName === "vows" )
	{
		if( suiteRun.argsVer.stepOk !== true )
		{
			return undefined;
		}
		
		return failedStep instanceof Vow !== true
	}
	
	if( stepName === "next"
	)
	{
		if(
			suiteRun.before.stepOk === false ||
			suiteRun.topic.stepOk === false ||
			suiteRun.argsVer.stepOk === false ||
			failedStep instanceof Vow === true
		)
		{
			return undefined;
		}
		
		return failedSuiteRun === undefined;
	}
});

});
