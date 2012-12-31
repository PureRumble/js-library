ourGlobe.define(
[
	"./riverruntimeerror",
	"./drop"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Schema = ourGlobe.Schema;
var Class = ourGlobe.Class;

var RiverRuntimeError = undefined;
var Drop = undefined;

mods.delay(
function()
{
	RiverRuntimeError = mods.get( "riverruntimeerror" );
	Drop = mods.get( "drop" );
	
	var beginRiverFlowOptsS =
		{
			props:{ req: "+inst", res: "+inst" },
			extraProps: false
		}
	;
	
	var serveErrOptsS =
		{ props:{ err:{ req: true, types:[ Error ] } } }
	;
	
	Class.addStatic(
	Stream,
	{
		FAILURE_CODE_S:
			{ minStrLen: 1, chars: "letters/digits/underscores" }
		,
		STREAM_NAME_S:
			{ minStrLen: 1, chars: "letters/digits/underscores" }
		,
		STREAM_PARAM_NAME_S:
			{ minStrLen: 1, chars: "letters/digits/underscores" }
		,
		BEGIN_RIVER_FLOW_V:
			getV( getA( Drop, beginRiverFlowOptsS, "func" ) )
		,
		BEGIN_V: getV( getA( Drop, "func" ) ),
		VALIDATE_V: getV( getA( Drop, "func" ) ),
		PREPARE_V: getV( getA( Drop, "func" ) ),
		BRANCH_V: getV( getA( Drop, "func" ) ),
		SERVE_V: getV( getA( Drop, "func" ) ),
		SERVE_FAILURE_V: getV( getA( Drop, "func" ) ),
		SERVE_ERR_V: getV( getA( Drop, serveErrOptsS, "func" ) ),
		FINISH_V: getV( getA( Drop, "func" ) ),
		
		ERR_AT_BEGIN_RIVER_FLOW: "ErrAtBeginRiverFlow",
		ERR_AT_BEGIN_RIVER_FLOW_CB: "ErrAtBeginRiverFlowCb",
		INVALID_ARGS_FOR_BEGIN_RIVER_FLOW_CB:
			"InvalidArgsForBeginRiverFlowCb"
		,
		INVALID_STREAM_PARAMS_FOR_BEGIN_RIVER_FLOW_CB:
			"InvalidStreamParamsForBeginRiverFlowCb"
		,
		
		ERR_AT_BEGIN: "ErrAtBegin",
		ERR_AT_BEGIN_CB: "ErrAtBeginCb",
		INVALID_ARGS_FOR_BEGIN_CB: "InvalidArgsForBeginCb",
		
		ERR_AT_VALIDATE: "ErrAtValidate",
		ERR_AT_VALIDATE_CB: "ErrAtValidateCb",
		INVALID_ARGS_FOR_VALIDATE_CB: "InvalidArgsForValidateCb",
		
		ERR_AT_PREPARE: "ErrAtPrepare",
		ERR_AT_PREPARE_CB: "ErrAtPrepareCb",
		INVALID_ARGS_FOR_PREPARE_CB: "InvalidArgsForPrepareCb",
		INVALID_STREAM_PARAMS_FOR_PREPARE_CB:
			"InvalidStreamParamsForPrepareCb"
		,
		
		ERR_AT_BRANCH: "ErrAtBranch",
		ERR_AT_BRANCH_CB: "ErrAtBranchCb",
		INVALID_ARGS_FOR_BRANCH_CB: "InvalidArgsForBranchCb",
		BRANCHING_TO_NONEXISTENT_STREAM:
			"BranchingToNonexistentStream"
		,
		
		ERR_AT_SERVE: "ErrAtServe",
		ERR_AT_SERVE_CB: "ErrAtServeCb",
		INVALID_ARGS_FOR_SERVE_CB: "InvalidArgsForServeCb",
		
		ERR_AT_FINISH: "ErrAtFinish",
		ERR_AT_FINISH_CB: "ErrAtFinishCb",
		INVALID_ARGS_FOR_FINISH_CB: "InvalidArgsForFinishCb",
		
		ERR_AT_SERVE_FAILURE: "ErrAtServeFailure",
		ERR_AT_SERVE_FAILURE_CB: "ErrAtServeFailureCb",
		INVALID_ARGS_FOR_SERVE_FAILURE_CB:
			"InvalidArgsForServeFailureCb"
		,
		
		ERR_AT_SERVE_ERR: "ErrAtServeErr",
		ERR_AT_SERVE_ERR_CB: "ErrAtServeErrCb",
		INVALID_ARGS_FOR_SERVE_ERR_CB:
			"InvalidArgsForServeErrCb"
	});
});

var Stream =
Class.create(
{
name: "Stream",
instVars:
{
	streamName: "final",
	streamParams: "final",
	branchingStreams: "final"
},
constr:
[
getA.ANY_ARGS,
function( streamName, branchingStreams, streamParams )
{
	if( arguments.length < 1 || arguments.length > 3 )
	{
		throw new RuntimeError(
			"Between one and three args must be provided",
			{ providedArgs: arguments }
		);
	}

	if(
		sys.hasType( streamParams, "arr" ) === true &&
		streamParams.length > 0 &&
		streamParams[ 0 ] instanceof Stream === true &&
		branchingStreams === undefined
	)
	{
		branchingStreams = streamParams;
		streamParams = undefined;
	}
	
	if( Schema.test( Stream.STREAM_NAME_S, streamName ) === false )
	{
		throw new RuntimeError(
			"Arg streamName must be a proper str",
			{ streamName: streamName }
		);
	}
	
	if(
		streamParams !== undefined &&
		(
			sys.hasType( streamParams, "arr" ) === false ||
			streamParams.length === 0
		)
	)
	{
		throw new RuntimeError(
			"Arg streamParams must be a proper arr",
			{ streamParams: streamParams }
		);
	}
	
	if(
		branchingStreams !== undefined &&
		(
			sys.hasType( branchingStreams, "arr" ) === false ||
			branchingStreams.length === 0
		)
	)
	{
		throw new RuntimeError(
			"Arg branchingStreams must be a proper arr",
			{ branchingStreams: branchingStreams }
		);
	}
	
	if( streamParams === undefined )
	{
		streamParams = [];
	}
	
	if( branchingStreams === undefined )
	{
		branchingStreams = [];
	}
	
	var paramsDic = {};
	
	for( var item in streamParams )
	{
		var streamParamName = streamParams[ item ];
		
		if(
			false ===
				Schema.test(
					Stream.STREAM_PARAM_NAME_S, streamParamName
				)
		)
		{
			throw new RuntimeError(
				"Every item of arg streamParams must be a valid "+
				"Stream param",
				{ faultyItem: item, faultyItemValue: streamParamName }
			);
		}
		
		if( paramsDic[ streamParamName ] !== undefined )
		{
			throw new RiverRuntimeError(
				"All Stream params must have unique names under "+
				"their Stream",
				{
					faultyStream: streamName,
					duplicateStreamParamName: streamParamName
				},
				"DuplicateStreamParamNameInStream"
			);
		}
		
		paramsDic[ streamParamName ] = true;
	}
	
	var branchesObj = {};
	
	for( var item in branchingStreams )
	{
		var currStream = branchingStreams[ item ];
		
		if( currStream instanceof Stream === false )
		{
			throw new RuntimeError(
				"Every item of arg branchingStreams must be a Stream",
				{ faultyItem: item, faultyItemValue: currStream }
			);
		}
		
		var currStreamName = currStream.streamName;
		
		if( branchesObj[ currStreamName ] !== undefined )
		{
			throw new RiverRuntimeError(
				"All branching Streams must have unique names under "+
				"their parent Stream",
				{
					faultyParentStream: streamName,
					duplicateBranchingStreamName: currStreamName
				},
				"DuplicateBranchingStreamName"
			);
		}
		
		branchesObj[ currStreamName ] = currStream;
	}
	
	this.streamName = streamName;
	this.streamParams = paramsDic;
	this.branchingStreams = branchesObj;
	
	var streamsToCheck = [];
	
	for( var prop in branchesObj )
	{
		streamsToCheck.push( branchesObj[ prop ] );
	}
	
	while( streamsToCheck.length > 0 )
	{
		var stream = streamsToCheck.pop();
		
		for( var streamParamName in stream.streamParams )
		{
			if( paramsDic[ streamParamName ] !== undefined )
			{
				throw new RiverRuntimeError(
					"Every Stream param must have a unique name among "+
					"all other params under its Stream and the "+
					"Stream's branching Streams (either directly or "+
					"indirectly beneath the former Stream)",
					{
						firstFaultyStream: streamName,
						secondFaultyStream: stream.streamName,
						duplicateStreamParamName: streamParamName
					},
					"DuplicateStreamParamNameInRiver"
				);
			}
		}
		
		for( var prop in stream.branchingStreams )
		{
			streamsToCheck.push( stream.branchingStreams[ prop ] );
		}
	}
}]

});

return Stream;

},
function( mods, Stream )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var RiverRuntimeError = mods.get( "riverruntimeerror" );

Class.add(
Stream,
{

failureCodeIsValid:
[
"static",
getA( "any" ),
getR( "bool" ),
function( failureCode )
{
	return(
		hasT( failureCode, "str" ) === true &&
		failureCode.length > 0 &&
		failureCode.search( /[^a-zA-Z0-9]/ ) === -1
	);
}],

streamNameIsValid:
[
"static",
getA( "any" ),
getR( "bool" ),
function( streamName )
{
	return(
		hasT( streamName, "str" ) === true &&
		streamName.length > 0 &&
		streamName.search( /[^a-zA-Z0-9]/ ) === -1
	);
}],

hasStreamParams:
[
getA( "obj" ),
getR( "bool" ),
function( streamParams )
{
	for( var param in streamParams )
	{
		if( this.streamParams[ param ] === undefined )
		{
			return false;
		}
	}
	
	return true;
}],

beginRiverFlow:
[
getA.ANY_ARGS,
function( drop, opts, cb )
{
	throw new RuntimeError(
		"The top Stream of a River must implement beginRiverFlow()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

begin:
[
Stream.BEGIN_V,
function( drop, cb )
{
	cb();
}],

validate:
[
getA.ANY_ARGS,
function( drop, cb )
{
	throw new RuntimeError(
		"All sub classes of Stream must implement validate()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

prepare:
[
Stream.PREPARE_V,
function( drop, cb )
{
	cb();
}],

branch:
[
Stream.BRANCH_V,
function( drop, cb )
{
	cb();
}],

serve:
[
Stream.SERVE_V,
function( drop, cb )
{
	throw new RiverRuntimeError(
		"All Drops must be either branched or served when they "+
		"pass through a Stream but this Stream doesnt implement "+
		"serve() and has thus failed to serve a Drop",
		"DropNotServedByStream"
	);
}],

serveFailure:
[
getA.ANY_ARGS,
function( drop, cb )
{
	throw new RuntimeError(
		"All sub classes of Stream must implement serveFailure()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

serveErr:
[
getA.ANY_ARGS,
function( drop, opts, cb )
{
	throw new RuntimeError(
		"All sub classes of Stream must implement serveErr()",
		{ invalidClass: Class.getClassName( this ) }
	);
}],

finish:
[
Stream.FINISH_V,
function( drop, cb )
{
	cb();
}],

getStreamName:
[
"final",
getA.ANY_ARGS,
getR( Stream.STREAM_NAME_S ),
function()
{
	if( arguments.length !== 0 )
	{
		throw new RuntimeError(
			"No args may be provided",
			{ providedArgs: arguments }
		);
	}
	
	return this.streamName;
}]

});

});
