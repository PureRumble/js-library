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

var StoneBeginRiverFlow =
Class.create(
{

name: "StoneBeginRiverFlow",
delayedExt:
function()
{
	return Stone;
}

});

return StoneBeginRiverFlow;

},
function( mods, StoneBeginRiverFlow )
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
StoneBeginRiverFlow,
{

flowStream:
[
Stone.BEGIN_RIVER_FLOW_V,
function( req, res, cb )
{
	this.drop.stream.beginRiverFlow(
		this.drop, { req: req, res: res }, cb
	);
}],

handleCbArgs:
[
Stone.HANDLE_CB_ARGS_V,
function( err, streamParams )
{
	if( arguments.length > 2 )
	{
		return(
			new StreamError(
				this.drop,
				"No more than two args may be given to "+
				"the cb of Stream.beginRiverFlow()",
				{ providedArgs: arguments },
				Stream.INVALID_ARGS_FOR_BEGIN_RIVER_FLOW_CB
			)
		);
	}
	
	if(
		streamParams !== undefined &&
		hasT( streamParams, "obj" ) === false
	)
	{
		return(
			new StreamError(
				this.drop,
				"Arg streamParams given to the cb of "+
				"Stream.beginRiverFlow() must be undef or an obj",
				{ streamParams: streamParams },
				Stream.INVALID_ARGS_FOR_BEGIN_RIVER_FLOW_CB
			)
		);
	}
	
	if(
		streamParams !== undefined &&
		this.drop.stream.hasStreamParams( streamParams ) === false
	)
	{
		return(
			new StreamError(
				this.drop,
				"All Stream params given to the cb of "+
				"Stream.beginRiverFlow() to be set must have been "+
				"declared by the Stream in question",
				{ givenStreamParams: streamParams },
				Stream.INVALID_STREAM_PARAMS_FOR_BEGIN_RIVER_FLOW_CB
			)
		);
	}
	
	return [ undefined, streamParams ];
}],

getErrThrownCode:
[
Stone.GET_ERR_THROWN_CODE_V,
function()
{
	return Stream.ERR_AT_BEGIN_RIVER_FLOW;
}],

getCbErrCode:
[
Stone.GET_CB_ERR_CODE_V,
function()
{
	return Stream.ERR_AT_BEGIN_RIVER_FLOW_CB;
}],

getInvalidCbArgsCode:
[
Stone.GET_INVALID_CB_ARGS_CODE_V,
function()
{
	return Stream.INVALID_ARGS_FOR_BEGIN_RIVER_FLOW_CB;
}]

});

});
