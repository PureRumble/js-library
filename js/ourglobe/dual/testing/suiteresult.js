ourglobe.define(
[
	"./suiteruntimeerror",
	"./suiterun",
	"./topiccb"
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
});

SuiteResult.GET_TOPIC_RES_FV =
	getV()
		.setE( "any" )
		.setR( "arr" )
;

SuiteResult.ERR_THROWN_FV =
	getV()
		.setE( "any" )
		.setR( "bool" )
;

SuiteResult.ERR_OCCURRED_FV =
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

var TopicCb = mods.get( "topiccb" );

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
			"This suite has no parent suite",
			undefined,
			"SuiteHasNoParent"
		);
	}
	
	return new SuiteResult( this.suiteRun.parentRun );
});

SuiteResult.prototype.errThrown =
getF(
SuiteResult.ERR_THROWN_FV,
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
	
	return this.suiteRun.topic.thrownErr !== undefined;
});

SuiteResult.prototype.errOccurred =
getF(
SuiteResult.ERR_OCCURRED_FV,
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
		this.suiteRun.topic.thrownErr !== undefined ||
		this.suiteRun.topic.cbErr !== undefined
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
	
	return this.suiteRun.topic.result.slice();
});

});
