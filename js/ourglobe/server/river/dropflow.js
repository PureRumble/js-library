ourGlobe.define(
[
	"./drop",
	"./stone",
	"./stream",
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Drop = undefined;

mods.delay(
function()
{
	Drop = mods.get( "drop" );
});

var DropFlow =
Class.create(
{
name: "DropFlow",
constr:
[
function()
{
	return [ getA( Drop ) ];
},
function( drop )
{
	this.drop = drop;
}]

});

return DropFlow;

},
function( mods, DropFlow )
{

var RuntimeError = ourGlobe.RuntimeError;

var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Stone = mods.get( "stone" );
var Stream = mods.get( "stream" );

Class.add(
DropFlow,
{

// getErr() returns an err if such has occurred during the flow
// of the Drop through the Stream, but only the Stones
// beginRiverFlow, begin, validate, prepare, branch and serve
// are considered

getErr:
[
getA.ANY_ARGS,
getR( [ Error, "undef" ] ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	var drop = this.drop;
	var err = undefined;
	
	if( drop.stoneBeginRiverFlow.err !== undefined )
	{
		err = drop.stoneBeginRiverFlow.err;
	}
	else if( drop.stoneBegin.err !== undefined )
	{
		err = drop.stoneBegin.err;
	}
	else if( drop.stoneValidate.err !== undefined )
	{
		err = drop.stoneValidate.err;
	}
	else if( drop.stonePrepare.err !== undefined )
	{
		err = drop.stonePrepare.err;
	}
	else if( drop.stoneBranch.err !== undefined )
	{
		err = drop.stoneBranch.err;
	}
	else if( drop.stoneServe.err !== undefined )
	{
		err = drop.stoneServe.err;
	}
	else if( drop.stoneServeFailure.err !== undefined )
	{
		err = drop.stoneServeFailure.err;
	}
	
	return err;
}],

isValid:
[
getA.ANY_ARGS,
getR( "bool" ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return(
		this.flowedTo( "validate" ) === true &&
		this.errAt( "validate" ) === false &&
		this.drop.stoneValidate.failureCode === undefined
	);
}],

invalidBy:
[
getA.ANY_ARGS,
getR( "bool" ),
function( failureCode )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( Stream.failureCodeIsValid( failureCode ) === false )
	{
		throw new RuntimeError(
			"Arg failureCode must be a valid failure code",
			{ failureCode: failureCode }
		);
	}
	
	return this.drop.stoneValidate.failureCode === failureCode;
}],

hasBranched:
[
getA.ANY_ARGS,
getR( "bool" ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	return this.drop.stoneBranch.branchingStream !== undefined;
}],

branchedTo:
[
getA.ANY_ARGS,
getR( "bool" ),
function( streamName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( Stream.streamNameIsValid( streamName ) === false )
	{
		throw new RuntimeError(
			"Arg streamName must be a valid Stream name",
			{ streamName: streamName }
		);
	}
	
	return(
		this.drop.stoneBranch.branchingStream !== undefined &&
		streamName ===
			this.drop.stoneBranch.branchingStream.getStreamName()
	);
}],

flowedTo:
[
getA.ANY_ARGS,
getR( "bool" ),
function( stoneName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( Stone.isValidStoneName( stoneName ) === false )
	{
		throw new RuntimeError(
			"Arg stoneName must be a valid Stone name",
			{ stoneName: stoneName }
		);
	}
	
	var drop = this.drop;
	
	return(
		(
			stoneName === "beginRiverFlow" &&
			drop.stoneBeginRiverFlow.flowedToStone === true
		)
		||
		(
			stoneName === "begin" &&
			drop.stoneBegin.flowedToStone === true
		)
		||
		(
			stoneName === "validate" &&
			drop.stoneValidate.flowedToStone === true
		)
		||
		(
			stoneName === "prepare" &&
			drop.stonePrepare.flowedToStone === true
		)
		||
		(
			stoneName === "branch" &&
			drop.stoneBranch.flowedToStone === true
		)
		||
		(
			stoneName === "serve" &&
			drop.stoneServe.flowedToStone === true
		)
		||
		(
			stoneName === "serveErr" &&
			drop.stoneServeErr.flowedToStone === true
		)
		||
		(
			stoneName === "serveFailure" &&
			drop.stoneServeFailure.flowedToStone === true
		)
		||
		(
			stoneName === "finish" &&
			drop.stoneFinish.flowedToStone === true
		)
	);
}],

errAt:
[
getA.ANY_ARGS,
getR( "bool" ),
function( stoneName )
{
	if( arguments.length !== 1 )
	{
		throw new RuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( Stone.isValidStoneName( stoneName ) === false )
	{
		throw new RuntimeError(
			"Arg stoneName must be a valid Stone name",
			{ stoneName: stoneName }
		);
	}
	
	var drop = this.drop;
	
	return(
		(
			stoneName === "beginRiverFlow" &&
			drop.stoneBeginRiverFlow.err !== undefined
		)
		||
		(
			stoneName === "begin" &&
			drop.stoneBegin.err !== undefined
		)
		||
		(
			stoneName === "validate" &&
			drop.stoneValidate.err !== undefined
		)
		||
		(
			stoneName === "prepare" &&
			drop.stonePrepare.err !== undefined
		)
		||
		(
			stoneName === "branch" &&
			drop.stoneBranch.err !== undefined
		)
		||
		(
			stoneName === "serve" &&
			drop.stoneServe.err !== undefined
		)
		||
		(
			stoneName === "serveErr" &&
			drop.stoneServeErr.err !== undefined
		)
		||
		(
			stoneName === "serveFailure" &&
			drop.stoneServeFailure.err !== undefined
		)
		||
		(
			stoneName === "finish" &&
			drop.stoneFinish.err !== undefined
		)
	);
}]

});

});
