ourglobe.define(
[
	"./suiteruntimeerror",
	"./suiterun"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteRun = undefined;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
});

var SuiteResult =
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
	this.suiteRun = suiteRun;
	
	if( suiteRun.topic !== undefined )
	{
		this.topicRes = suiteRun.topic.result;
		this.thrownErr = suiteRun.topic.thrownErr;
		this.cbErr = suiteRun.topic.cbErr;
	}
	else if( suiteRun.parentRun !== undefined )
	{
		var parentRun = suiteRun.parentRun;
		
		this.topicRes = parentRun.suiteRes.topicRes;
		this.thrownErr = parentRun.suiteRes.thrownErr;
		this.cbErr = parentRun.suiteRes.cbErr;
	}
	else
	{
		this.topicRes = [];
		this.thrownErr = undefined;
		this.cbErr = undefined;
	}
});

SuiteResult.GET_TOPIC_RES_FV =
	getV()
		.setE( "any" )
		.setR( "arr" )
;

SuiteResult.TOPIC_ERR_THROWN_FV =
	getV()
		.setE( "any" )
		.setR( "bool" )
;

SuiteResult.TOPIC_ERR_OCCURRED_FV =
	getV()
		.setE( "any" )
		.setR( "bool" )
;

SuiteResult.GET_PARENT_FV =
	getV()
		.setE( "any" )
		.setR( SuiteResult )
;

SuiteResult.HAS_PARENT_FV =
	getV()
		.setE( "any" )
		.setR( "bool" )
;

return SuiteResult;

},
function( mods, SuiteResult )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

SuiteResult.prototype.hasParent =
getF(
SuiteResult.HAS_PARENT_FV,
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidArgsForHasParent"
		);
	}
	
	return this.suiteRun.parentRun !== undefined;
});

SuiteResult.prototype.getParent =
getF(
SuiteResult.GET_PARENT_FV,
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidArgsForGetParent"
		);
	}
	
	if( this.hasParent() === false )
	{
		throw new SuiteRuntimeError(
			{ suite: this.suiteRun.suiteHolder },
			"This suite has no parent suite",
			undefined,
			"SuiteHasNoParent"
		);
	}
	
	return this.suiteRun.parentRun.suiteRes;
});

SuiteResult.prototype.topicErrThrown =
getF(
SuiteResult.TOPIC_ERR_THROWN_FV,
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidArgsForErrThrown"
		);
	}
	
	return this.thrownErr !== undefined;
});

SuiteResult.prototype.topicErrOccurred =
getF(
SuiteResult.TOPIC_ERR_OCCURRED_FV,
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidArgsForErrOccurred"
		);
	}
	
	return(
		this.thrownErr !== undefined || this.cbErr !== undefined
	);
});

SuiteResult.prototype.getTopicRes =
getF(
SuiteResult.GET_TOPIC_RES_FV,
function()
{
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError(
			"No args may be provided",
			{ providedArgs: arguments },
			"InvalidArgsForGetTopicRes"
		);
	}
	
	return this.topicRes.slice();
});

});
