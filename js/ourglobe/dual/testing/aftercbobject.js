ourglobe.define(
[
	"./cbstepobject",
	"./aftercb",
	"./afterobject"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var CbStepObject = undefined;
var AfterCb = undefined;

mods.delay(
function()
{
	AfterCb = mods.get( "aftercb" );
	CbStepObject = mods.get( "cbstepobject" );
	sys.extend( AfterCbObject, CbStepObject );
});

var AfterCbObject =
getF(
function()
{
	return(
		getV()
			.addA( AfterCb )
	)
},
function( afterCb )
{
	AfterCbObject.ourGlobeSuper.call( this, afterCb );
});

return AfterCbObject;

},
function( mods, AfterCbObject )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;

var AfterObject = mods.get( "afterobject" );

mods.delay(
function()
{
	AfterCbObject.prototype.topicErrThrown =
		AfterObject.prototype.topicErrThrown
	;
});

mods.delay(
function()
{
	AfterCbObject.prototype.topicErrOccurred =
		AfterObject.prototype.topicErrOccurred
	;
});

mods.delay(
function()
{
	AfterCbObject.prototype.getTopicRes =
		AfterObject.prototype.getTopicRes
	;
});

mods.delay(
function()
{
	AfterCbObject.prototype.suiteOk =
		AfterObject.prototype.suiteOk
	;
});

mods.delay(
function()
{
	AfterCbObject.prototype.stepOk =
		AfterObject.prototype.stepOk
	;
});

});
