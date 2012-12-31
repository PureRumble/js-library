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

var StoneBranch =
Class.create(
{

name: "StoneBranch",
delayedExt:
function()
{
	return Stone;
},
instVars:
{
	branchingStream: "final"
},
constr:
[
function()
{
	return Stone.CONSTR_V;
},
function( drop )
{
	this.branchingStream = undefined;
	
	this.ourGlobeCallSuper( undefined, drop );
}]

});

return StoneBranch;

},
function( mods, StoneBranch )
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
StoneBranch,
{

flowStream:
[
Stone.BRANCH_V,
function( cb )
{
	this.drop.stream.branch( this.drop, cb );
}],

handleCbArgs:
[
Stone.HANDLE_CB_ARGS_V,
function( err, nextStreamName )
{
	if( arguments.length > 2 )
	{
		return(
			new StreamError(
				this.drop,
				"No more than two args may be given to "+
				"the cb of Stream.branch()",
				{ providedArgs: arguments },
				River.INVALID_ARGS_FOR_BRANCH_CB
			)
		);
	}
	
	if(
		nextStreamName !== undefined &&
		hasT( nextStreamName, "str" ) === false
	)
	{
		return(
			new StreamError(
				this.drop,
				"Arg nextStreamName given to the cb of "+
				"Stream.branch() must be undef or a "+
				"str",
				{ nextStreamName: nextStreamName },
				River.INVALID_ARGS_FOR_BRANCH_CB
			)
		);
	}
	
	var nextStream = undefined;
	
	if( nextStreamName !== undefined )
	{
		nextStream =
			this.drop.stream.branchingStreams[ nextStreamName ]
		;
		
		if( nextStream === undefined )
		{
			return(
				new StreamError(
					this.drop,
					"The Stream has no branching Stream by the "+
					"name '"+nextStreamName+"' that was given "+
					"to the cb of Stream.branch()",
					{ faultyStreamName: nextStreamName },
					Stream.BRANCHING_TO_NONEXISTENT_STREAM
				)
			);
		}
	}
	
	this.branchingStream = nextStream;
	
	return [ undefined, nextStream ];
}],

getErrThrownCode:
[
Stone.GET_ERR_THROWN_CODE_V,
function()
{
	return Stream.ERR_AT_BRANCH;
}],

getCbErrCode:
[
Stone.GET_CB_ERR_CODE_V,
function()
{
	return Stream.ERR_AT_BRANCH_CB;
}],

getInvalidCbArgsCode:
[
Stone.GET_INVALID_CB_ARGS_CODE_V,
function()
{
	return Stream.INVALID_ARGS_FOR_BRANCH_CB;
}]

});

});
