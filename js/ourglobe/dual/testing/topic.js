ourglobe.define(
[
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
	return getV().addA( SuiteRun );
},
function( suiteRun )
{
	this.result = undefined;
	
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

var ReturnStep = mods.get( "returnstep" );
var SuiteStep = mods.get( "suitestep" );

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
