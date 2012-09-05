ourglobe.define(
[
	"./suiteruntimeerror",
	"./suitestepobject",
	"./suiteresult",
	"./vow"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteStepObject = undefined;
var Vow = undefined;

mods.delay(
function()
{
	Vow = mods.get( "vow" );
	SuiteStepObject = mods.get( "suitestepobject" );
	sys.extend( VowObject, SuiteStepObject );
});

var VowObject =
getF(
function()
{
	return(
		getV()
			.addA( Vow )
	)
},
function( vow )
{
	VowObject.ourGlobeSuper.call( this, vow );
});

return VowObject;

},
function( mods, VowObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var SuiteResult = mods.get( "suiteresult" );

VowObject.prototype.errThrown =
getF(
SuiteResult.ERR_THROWN_FV,
function()
{
	return(
		this.suiteRes.errThrown.apply( this.suiteRes, arguments )
	);
});

VowObject.prototype.errOccurred =
getF(
SuiteResult.ERR_OCCURRED_FV,
function()
{
	return(
		this.suiteRes.errOccurred.apply( this.suiteRes, arguments )
	);
});

VowObject.prototype.getTopicRes =
getF(
SuiteResult.GET_TOPIC_RES_FV,
function()
{
	return(
		this.suiteRes.getTopicRes.apply( this.suiteRes, arguments )
	);
});

});
