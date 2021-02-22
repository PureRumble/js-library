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

var StoneServeErr =
Class.create(
{

name: "StoneServeErr",
delayedExt:
function()
{
	return Stone;
}

});

return StoneServeErr;

},
function( mods, StoneServeErr )
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
StoneServeErr,
{

flowStream:
[
Stone.SERVE_ERR_V,
function( cb )
{
	this.drop.stream.serveErr( this.drop, this.drop.dropFlow, cb );
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
				"the cb of Stream.serveErr()",
				{ providedArgs: arguments },
				Stream.INVALID_ARGS_FOR_SERVE_ERR_CB
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
	return Stream.ERR_AT_SERVE_ERR;
}],

getCbErrCode:
[
Stone.GET_CB_ERR_CODE_V,
function()
{
	return Stream.ERR_AT_SERVE_ERR_CB;
}],

getInvalidCbArgsCode:
[
Stone.GET_INVALID_CB_ARGS_CODE_V,
function()
{
	return Stream.INVALID_ARGS_FOR_SERVE_ERR_CB;
}]

});

});
