ourglobe.define(
[
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

var SuiteStep = mods.get( "suitestep" );
var CbStep = mods.get( "cbstep" );
var Topic = mods.get( "topic" );

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
