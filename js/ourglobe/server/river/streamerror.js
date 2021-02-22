ourGlobe.define(
[
	"./stream",
	"./drop"
],
function( mods )
{

var OurGlobeError = ourGlobe.OurGlobeError;
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

var StreamError =
Class.create(
{
name: "StreamError",
extends: OurGlobeError,
constr:
[
function()
{
	return(
		[
			getA( Drop, "any", "any", "any", "any" ),
			getA(
				Drop, [ Error, "undef" ], "any", "any", "any", "any"
			)
		]
	);
},
function( drop, err, msg, errorVar, errorCode, errorPlace )
{
	if(
		sys.hasType( err, "str" ) === true &&
// making sure no faulty args are missed by being overwritten
		errorPlace === undefined
	)
	{
		errorPlace = errorCode;
		errorCode = errorVar;
		errorVar = msg;
		msg = err;
		
		err = undefined;
	}
	
	this.drop = drop;
	this.err = err;
	
	this.ourGlobeCallSuper(
		undefined, msg, errorVar, errorCode, errorPlace
	);
}]

});

return StreamError;

},
function( mods, StreamError )
{

var RuntimeError = ourGlobe.RuntimeError;

var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Stream = mods.get( "stream" );

Class.add(
StreamError,
{

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
		)
	}
	
	return this.err;
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
	
	return(
		(
			stoneName === "beginRiverFlow" &&
			(
				true ===
					this.hasErrCode( Stream.ERR_AT_BEGIN_RIVER_FLOW )
				||
				true ===
					this.hasErrCode( Stream.ERR_AT_BEGIN_RIVER_FLOW_CB )
				||
				true ===
					this.hasErrCode(
						Stream.INVALID_ARGS_FOR_BEGIN_RIVER_FLOW_CB
					)
				||
				true ===
					this.hasErrCode(
						Stream.INVALID_STREAM_PARAMS_FOR_BEGIN_RIVER_FLOW_CB
					)
			)
		)
		||
		(
			stoneName === "begin" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_BEGIN ) ||
				true === this.hasErrCode( Stream.ERR_AT_BEGIN_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_BEGIN_CB )
			)
		)
		||
		(
			stoneName === "validate" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_VALIDATE ) ||
				true === this.hasErrCode( Stream.ERR_AT_VALIDATE_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_VALIDATE_CB )
			)
		)
		||
		(
			stoneName === "prepare" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_PREPARE ) ||
				true === this.hasErrCode( Stream.ERR_AT_PREPARE_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_PREPARE_CB )
				||
				true ===
					this.hasErrCode(
						Stream.INVALID_STREAM_PARAMS_FOR_PREPARE_CB
					)
			)
		)
		||
		(
			stoneName === "branch" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_BRANCH ) ||
				true === this.hasErrCode( Stream.ERR_AT_BRANCH_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_BRANCH_CB )
				||
				true ===
					this.hasErrCode(
						Stream.BRANCHING_TO_NONEXISTENT_STREAM
					)
			)
		)
		||
		(
			stoneName === "serve" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_SERVE ) ||
				true === this.hasErrCode( Stream.ERR_AT_SERVE_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_SERVE_CB )
			)
		)
		||
		(
			stoneName === "finish" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_FINISH ) ||
				true === this.hasErrCode( Stream.ERR_AT_FINISH_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_FINISH_CB )
			)
		)
		||
		(
			stoneName === "serveErr" &&
			(
				true === this.hasErrCode( Stream.ERR_AT_SERVE_ERR ) ||
				true === this.hasErrCode( Stream.ERR_AT_SERVE_ERR_CB ) ||
				true ===
					this.hasErrCode( Stream.INVALID_ARGS_FOR_SERVE_ERR_CB )
			)
		)
		||
		(
			stoneName === "serveFailure" &&
			(
				true ===
					this.hasErrCode( Stream.ERR_AT_SERVE_FAILURE )
				||
				true ===
					this.hasErrCode( Stream.ERR_AT_SERVE_FAILURE_CB )
				||
				true ===
					this.hasErrCode(
						Stream.INVALID_ARGS_FOR_SERVE_FAILURE_CB
					)
			)
		)
	);
}],

isCbErr:
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
		true ===
			this.hasErrCode( Stream.ERR_AT_BEGIN_RIVER_FLOW_CB )
		||
		true ===
			this.hasErrCode(
				Stream.INVALID_ARGS_FOR_BEGIN_RIVER_FLOW_CB
			)
		||
		true ===
			this.hasErrCode(
				Stream.INVALID_STREAM_PARAMS_FOR_BEGIN_RIVER_FLOW_CB
			)
		||
		true === this.hasErrCode( Stream.ERR_AT_BEGIN_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_BEGIN_CB )
		||
		true === this.hasErrCode( Stream.ERR_AT_VALIDATE_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_VALIDATE_CB )
		||
		true === this.hasErrCode( Stream.ERR_AT_PREPARE_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_PREPARE_CB )
		||
		true ===
			this.hasErrCode(
				Stream.INVALID_STREAM_PARAMS_FOR_PREPARE_CB
			)
		||
		true === this.hasErrCode( Stream.ERR_AT_BRANCH_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_BRANCH_CB )
		||
		true ===
			this.hasErrCode(
				Stream.BRANCHING_TO_NONEXISTENT_STREAM
			)
		||
		true === this.hasErrCode( Stream.ERR_AT_SERVE_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_SERVE_CB )
		||
		true === this.hasErrCode( Stream.ERR_AT_FINISH_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_FINISH_CB )
		||
		true === this.hasErrCode( Stream.ERR_AT_SERVE_ERR_CB ) ||
		true ===
			this.hasErrCode( Stream.INVALID_ARGS_FOR_SERVE_ERR_CB )
		||
		true ===
			this.hasErrCode( Stream.ERR_AT_SERVE_FAILURE_CB )
		||
		true ===
			this.hasErrCode(
				Stream.INVALID_ARGS_FOR_SERVE_FAILURE_CB
			)
	);
}]

});

});
