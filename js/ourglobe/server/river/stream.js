ourGlobe.define(
[
	"./riverruntimeerror",
	"./drop"
]
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var RiverRuntimeError = undefined;
var Drop = undefined;

mods.delay(
function()
{
	RiverRuntimeError = mods.get( "riverruntimeerror" );
	Drop = mods.get( "drop" );
	
	Class.addStatic(
	Stream,
	{
		STREAM_NAME_S:
			{ minStrLen: 1, chars: "letters/digits/underscores" }
		,
		VALIDATE_FV: getV( getA( Drop, "func" ) ),
		
		PREPARE_FV: getV( getA( Drop, "func" ) ),
		
		BRANCH_FV: getV( getA( Drop, "func" ) ),
		
		SERVE_FV: getV( getA( Drop, "func" ) ),
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
	
	if( sys.hasType( streamName, "str" ) === false )
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
	
	var paramsArr = [];
	var paramsObj = {};
	
	for( var item in streamParams )
	{
		var streamParamName = streamParams[ item ] ;
		
		if( sys.hasType( streamParamName, "str" ) === false )
		{
			throw new RuntimeError(
				"Every item of arg streamParams must be a str",
				{ faultyItem: item, faultyItemValue: streamParamName }
			);
		}
		
		if( paramsObj[ streamParamName ] !== undefined )
		{
			throw new RiverRuntimeError(
				"All Stream params must have unique names under "+
				"their Stream",
				{
					faultyParentStream: streamName,
					duplicateStreamParamName: streamParamName
				},
				"DuplicateStreamParamNameInStream"
			);
		}
		
		paramsObj[ streamParamName ] = true;
		paramsArr.push( streamParamName );
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
	this.streamParams = paramsArr;
	this.branchingStreams = branchesObj;
	
	var streamsToCheck = Object.values( branchesObj );
	
	for( var stream in streamsToCheck )
	{
		for( var item in stream.streamParams )
		{
			var streamParamName = stream.streamParams[ item ];
			
			if( paramsObj[ streamParamName ] !== undefined )
			{
				throw new RiverRuntimeError(
					"Every Stream param must have a unique name among "+
					"all other params under (1) its Stream, (2) the "+
					"Stream's branching Streams and (3) the Stream's "+
					"parent Streams",
					{
						firstFaultyStream: streamName,
						secondFaultyStream: stream.streamName,
						duplicateStreamParamName: streamParamName
					},
					"DuplicateStreamParamNameInRiver"
				);
			}
		}
		
		streamsToCheck =
			streamsToCheck.concat(
				Object.values( stream.branchingStreams )
			)
		;
	}
}]

});

return Stream;

},
function( mods, Stream )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

Class.add(
Stream,
{

isErrStream:
[
"static",
getA( Stream ),
getR( "bool" ),
function( stream )
{
	var StreamClass = Class.getClass( stream );
	
	return sys.hasType( StreamClass.prototype.serveErr, "func" );
}],

isFailureStream:
[
"static",
getA( Stream ),
getR( "bool" ),
function( stream )
{
	var StreamClass = Class.getClass( stream );
	
	return(
		sys.hasType( StreamClass.prototype.serveFailure, "func" )
	);
}],

validate:
[
getV.ANY_ARGS,
function( drop, cb )
{
	throw new RuntimeError(
		"All sub classes of Stream must implement validate()",
		{ invalidSubClass: Class.getClassName( this ) }
	);
}],

prepare:
[
Stream.PREPARE_FV,
function( drop, cb )
{
	cb();
}],

branch:
[
Stream.BRANCH_FV,
function( drop, cb )
{
	cb();
}],

serve:
[
Stream.SERVE_FV,
function( drop, cb )
{
	// Stream and Drop dont have to be specified here since River
	// will take care of it when it catches this err
	throw new RiverRuntimeError(
		"All Drops must be either branched or served when they "+
		"pass through a Stream but this Stream has failed to do so "+
		"for a Drop",
		"DropNotServedByStream"
	);
}],

getName:
[
"final",
getA.ANY_ARGS,
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
