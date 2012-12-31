ourGlobe.define(
[
	"./streamerror",
	"./stream",
	"./stone"
],
function( mods )
{

var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Stone = undefined;

mods.delay(
function()
{
	Stone = mods.get( "stone" );
});

var StoneBegin =
Class.create(
{

name: "StoneBegin",
delayedExt:
function()
{
	return Stone;
}

});

return StoneBegin;

},
function( mods, StoneBegin )
{

var hasT = ourGlobe.hasT;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var StreamError = mods.get( "streamerror" );
var Stone = mods.get( "stone" );
var Stream = mods.get( "stream" );

Class.add(
StoneBegin,
{

flowStream:
[
Stone.BEGIN_V,
function( cb )
{
	this.drop.stream.begin( this.drop, cb );
}],

handleCbArgs:
[
Stone.HANDLE_CB_ARGS_V,
function( err )
{
	if( arguments.length > 1 )
	{
		return(
			new StreamError(
				this.drop,
				"No more than one arg may be given to "+
				"the cb of Stream.begin()",
				{ providedArgs: arguments },
				Stream.INVALID_ARGS_FOR_BEGIN_CB
			)
		);
	}
	
	return undefined;
}],

getErrThrownCode:
[
Stone.GET_ERR_THROWN_CODE_V,
function()
{
	return Stream.ERR_AT_BEGIN;
}],

getCbErrCode:
[
Stone.GET_CB_ERR_CODE_V,
function()
{
	return Stream.ERR_AT_BEGIN_CB;
}],

getInvalidCbArgsCode:
[
Stone.GET_INVALID_CB_ARGS_CODE_V,
function()
{
	return Stream.INVALID_ARGS_FOR_BEGIN_CB;
}]

});

});
