ourGlobe.define(
[
	"http",
	"./riverruntimeerror",
	"./stream",
	"./drop"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var http = mods.get( "http" );

var Stream = undefined;
var Drop = undefined;

mods.get(
function()
{
	Stream = mods.get( "stream" );
	Drop = mods.get( "drop" );
});

var River =
Class.create(
{
name: "River",
constr:
[
getA.ANY_ARGS,
function( firstStream, errStream, failureStream, port )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( firstStream instanceof Stream === false )
	{
		throw new RuntimeError(
			"Arg firstStream must be a Stream",
			{ firstStream: firstStream }
		);
	}
	
	if(
		errStream instanceof Stream === false ||
		Stream.isErrStream( errStream ) === false
	)
	{
		throw new RuntimeError(
			"Arg errStream must be an ErrStream",
			{ errStream: errStream }
		);
	}
	
	if(
		sys.hasType( failureStream, "int" ) === true &&
		port === undefined
	)
	{
		port = failureStream;
		failureStream = errStream;
	}
	
	if(
		failureStream instanceof Stream === false ||
		Stream.isFailureStream( failureStream ) === false
	)
	{
		throw new RuntimeError(
			"Arg failureStream must be a ValidationFailureStream",
			{ failureStream: failureStream }
		);
	}
	
	if( sys.hasType( port, "int" ) === false || port < 0 )
	{
		throw new RuntimeError(
			"Arg port must be a non-neg int", { port: port }
		);
	}
	
	this.firstStream = firstStream;
	this.errStream = errStream;
	this.failureStream = failureStream;
	this.port = port;
	this.isRunning = false;
	
	var river = this;
	
	var server =
	http.createServer(
		getCb(
			this,
			getA( "inst", "inst" ),
			function( req, res )
			{
				this.flowDropThroughStream(
					new Drop( req, res ), this.firstStream
				);
			}
		)
	);
	
	this.server = server;
	
	server.on(
		"listening",
		getCb(
			this,
			function()
			{
				this.isRunning = true;
			}
		)
	);
	
	server.on(
		"close",
		getCb(
			this,
			function()
			{
				this.isRunning = false;
			}
		)
	);
}]

});

Class.addStatic(
River,
{
	START_CB_FV: getV(),
	STOP_CB_FV: getV(),
	ERROR_AT_VALIDATION: "ErrorAtValidation",
	ERROR_AT_VALIDATION_CB: "ErrorAtValidationCb",
	INVALID_ARGS_FOR_VALIDATION_CB: "InvalidArgsForValidationCb",
	ERROR_AT_PREPARATION: "ErrorAtPreparation",
	ERROR_AT_PREPARATION_CB: "ErrorAtPreparationCb",
	INVALID_ARGS_FOR_PREPARATION_CB: "InvalidArgsForPreparationCb",
	ERROR_AT_BRANCHING: "ErrorAtBranching",
	ERROR_AT_BRANCHING_CB: "ErrorAtBranchingCb",
	INVALID_ARGS_FOR_BRANCHING_CB: "InvalidArgsForBranchingCb",
	INVALID_ARGS_FOR_BRANCHING_CB: "NonexistentBranchingStream",
	ERROR_AT_SERVING: "ErrorAtServing",
	ERROR_AT_SERVING_CB: "ErrorAtServingCb",
	INVALID_ARGS_FOR_SERVING_CB: "InvalidArgsForServingCb",
	ERROR_AT_FAILURE_SERVING: "ErrorAtFailureServing",
	ERROR_AT_FAILURE_SERVING_CB: "ErrorAtFailureServingCb",
	INVALID_ARGS_FOR_FAILURE_SERVING_CB:
		"InvalidArgsForFailureServingCb",
	DROP_HAS_NOT_ENDED: "DropHasNotEnded"
});

return River;

},
function( mods, River )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var http = mods.get( "http" );

var Stream = mods.get( "stream" );
var Drop = mods.get( "drop" );

Class.add(
River,
{

failureCodeIsValid:
[
"static",
getA( "any" ),
getR( "bool" ),
function( failureCode )
{
	return(
		sys.hasType( failureCode, "str" ) === true &&
		failureCode.length > 0 &&
		failureCode.search( /[^a-zA-Z0-9]/ ) === -1
	);
}],

evaluateServing:
[
getA( Stream, Drop ),
getA( Stream, [ Stream, "undef" ], Drop ),
function( potentialErrStream, servingStream, drop )
{
	if( servingStream instanceof Drop === true )
	{
		drop = servingStream;
		servingStream = undefined;
	}
	
	if( drop.getDropCon().hasEnded() === false )
	{
		this.handleErr(
			potentialErrStream,
			servingStream,
			drop,
			"The Drop has not been ended after being served",
			River.DROP_HAS_NOT_ENDED
		);
		
		return;
	}
}],

handleErr:
[
getA( Stream, Drop, "str", "str", [ Error, "undef" ] ),
getA(
	Stream,
	[ Stream, "undef" ],
	Drop,
	"str",
	"str",
	[ Error, "undef" ]
),
function(
	potentialErrStream,
	servingStream,
	drop,
	errMsg,
	errCode,
	thrownErr
)
{
	if( servingStream instanceof Drop === true )
	{
		thrownErr = errCode;
		errCode = errMsg;
		errMsg = drop;
		drop = servingStream;
		servingStream = potentialErrStream;
	}
	
	var errStream = undefined;
	var usingMasterStream = undefined;
	
	if( Stream.isErrStream( potentialErrStream ) === true )
	{
		errStream = potentialErrStream;
		usingMasterStream = false;
	}
	else
	{
		errStream = this.errStream;
		usingMasterStream = true;
	}
	
	var riverErr =
		new RiverRuntimeError(
			drop, servingStream, thrownErr, errMsg, errCode
		)
	;
	
	if( usingMasterStream === true )
	{
		drop.flowToMasterStream();
	}
	
	try
	{
	
	errStream.serveErr(
	drop,
	riverErr,
	getCb(
		this,
		getA.ANY_ARGS,
		function( err )
		{
			if( usingMasterStream === true )
			{
				drop.leaveMasterStream();
			}
			
			var errOccurred = false;
			
			if( arguments.length > 1 )
			{
				errOccurred = true;
			}
			
			if( err !== undefined && err instanceof Error === false )
			{
				errOccurred = true;
			}
			
// The args of this cb are verified above, while below it is
// checked if an err occurred while the stream served the err
			
			if( err !== undefined )
			{
				errOccurred = true;
			}
			
			if( errOccurred === true )
			{
				drop.getCon().forcefullyEnd();
			}
		}
	));
	
	}
	catch( e )
	{
		if( usingMasterStream === true )
		{
			drop.leaveMasterStream();
		}
		
		drop.getCon().forcefullyEnd();
	}
}],

handleFailure:
[
getA( Stream, Drop, "str" ),
function( stream, drop, failureCode )
{
	var failureStream = undefined;
	var usingMasterStream = undefined;
	
	if( Stream.isFailureStream( stream ) === true )
	{
		failureStream = stream;
		usingMasterStream = false;
	}
	else
	{
		failureStream = this.failureStream;
		usingMasterStream = true;
	}
	
	if( usingMasterStream === true )
	{
		drop.flowToMasterStream();
	}
	
	var cb =
	getCb(
		this,
		getA.ANY_ARGS,
		function( err )
		{
			if( usingMasterStream === true )
			{
				drop.leaveMasterStream();
			}
			
			if( arguments.length > 1 )
			{
				this.handleErr(
	// stream is the Stream that potentially is to be used as
	// ErrStream
					stream,
	// failureStream is the Stream where the err actually occurred
					failureStream,
					drop,
					"No more than one arg may be given to "+
					"the cb of Stream.serveFailure()",
					River.INVALID_ARGS_FOR_FAILURE_SERVING_CB
				);
				
				return;
			}
			
			if( err !== undefined && err instanceof Error === false )
			{
				this.handleErr(
	// stream is the Stream that potentially is to be used as
	// ErrStream
					stream,
	// failureStream is the Stream where the err actually occurred
					failureStream,
					drop,
					"Arg err given to the cb of Stream.serveFailure() "+
					"must be undef or an err",
					River.INVALID_ARGS_FOR_FAILURE_SERVING_CB
				);
				
				return;
			}
			
			if( err !== undefined )
			{
				this.handleErr(
	// stream is the Stream that potentially is to be used as
	// ErrStream
					stream,
	// failureStream is the Stream where the err actually occurred
					failureStream,
					drop,
					"An err was given to the cb of Stream.serveFailure()",
					River.ERROR_AT_FAILURE_SERVING_CB,
					err
				);
				
				return;
			}
			
			this.evaluateServing(
	// stream is the Stream that potentially is to be used as
	// ErrStream
				stream,
	// failureStream is the Stream where the err actually occurred
				failureStream,
				drop
			);
			
			return;
		}
	);
	
	try
	{
	
	if( usingMasterStream === false )
	{
		failureStream.serveFailure( drop, failureCode, cb );
	}
	else
	{
		failureStream.serveFailure( drop, stream, failureCode, cb );
	}
	
	}
	catch( e )
	{
		if( usingMasterStream === true )
		{
			drop.leaveMasterStream();
		}
		
		this.handleErr(
// stream is the Stream that potentially is to be used as
// ErrStream
			stream,
// failureStream is the Stream where the err actually occurred
			failureStream,
			drop,
			"Stream.serveFailure() caused an err",
			River.ERROR_AT_FAILURE_SERVING,
			e
		);
		
		return;
	}
}],

flowDropThroughStream:
[
getA( Drop, Stream ),
function( drop, stream )
{
	drop.flowToStream( stream );
	
	try
	{
	
	stream.validate(
	drop,
	getCb(
		this,
		getA.ANY_ARGS,
		function( err, isValid, failureCode )
		{
			if( arguments.length < 1 || arguments.length > 3 )
			{
				this.handleErr(
					stream,
					drop,
					"Between one and three args must be given to "+
					"the cb of Stream.validate()",
					River.INVALID_ARGS_FOR_VALIDATION_CB
				);
				
				return;
			}
			
			if( err !== undefined && err instanceof Error === false )
			{
				this.handleErr(
					stream,
					drop,
					"Arg err given to the cb of Stream.validate() "+
					"must be undef or an err",
					River.INVALID_ARGS_FOR_VALIDATION_CB
				);
				
				return;
			}
			
			if(
				isValid !== undefined &&
				sys.hasType( isValid, "bool" ) === false
			)
			{
				this.handleErr(
					stream,
					drop,
					"Arg isValid given to the cb of Stream.validate() "+
					"must be undef or a bool",
					River.INVALID_ARGS_FOR_VALIDATION_CB
				);
				
				return;
			}
			
			if(
				failureCode !== undefined &&
				River.failureCodeIsValid( failureCode ) === false
			)
			{
				this.handleErr(
					stream,
					drop,
					"Arg failureCode given to the cb of "+
					"Stream.validate() must be undef or a valid "+
					"failure code",
					River.INVALID_ARGS_FOR_VALIDATION_CB
				);
				
				return;
			}
			
			if(
				err !== undefined &&
				( isValid !== undefined || failureCode !== undefined )
			)
			{
				this.handleErr(
					stream,
					drop,
					"An err may be given to the cb of "+
					"Stream.validate() if and only if all the other "+
					"given args are undef",
					River.INVALID_ARGS_FOR_VALIDATION_CB
				);
				
				return;
			}
			
			if( isValid === false && failureCode === undefined )
			{
				this.handleErr(
					stream,
					drop,
					"Arg failureCode given to the cb of "+
					"Stream.validate() must be set if arg isValid "+
					"is set to false",
					River.INVALID_ARGS_FOR_VALIDATION_CB
				);
				
				return;
			}
			
			if( err !== undefined )
			{
				this.handleErr(
					stream,
					drop,
					"An err was given to the cb of Stream.validate()",
					River.ERROR_AT_VALIDATION_CB,
					err
				);
				
				return;
			}
			
			if( failureCode !== undefined )
			{
				this.handleFailure( stream, drop, failureCode );
				
				return;
			}
			
			try
			{
			
			stream.prepare(
			drop,
			getCb(
				this,
				getA.ANY_ARGS,
				function( err )
				{
					if( arguments.length > 1 )
					{
						this.handleErr(
							stream,
							drop,
							"No more than one arg may be given to "+
							"the cb of Stream.prepare()",
							River.INVALID_ARGS_FOR_PREPARATION_CB
						);
						
						return;
					}
					
					if(
						err !== undefined && err instanceof Error === false
					)
					{
						this.handleErr(
							stream,
							drop,
							"Arg err given to the cb of Stream.prepare() "+
							"must be undef or an err",
							River.INVALID_ARGS_FOR_PREPARATION_CB
						);
						
						return;
					}
					
					if( err !== undefined )
					{
						this.handleErr(
							stream,
							drop,
							"An err was given to the cb of Stream.prepare()",
							River.ERROR_AT_PREPARATION_CB,
							err
						);
						
						return;
					}
					
					try
					{
					
					stream.branch(
					drop,
					getCb(
						this,
						getA.ANY_ARGS,
						function( err, nextStreamName )
						{
							if( arguments.length > 2 )
							{
								this.handleErr(
									stream,
									drop,
									"No more than two args may be given to "+
									"the cb of Stream.branch()",
									River.INVALID_ARGS_FOR_BRANCHING_CB
								);
								
								return;
							}
							
							if(
								err !== undefined &&
								err instanceof Error === false
							)
							{
								this.handleErr(
									stream,
									drop,
									"Arg err given to the cb of "+
									"Stream.branch() must be undef or an err",
									River.INVALID_ARGS_FOR_BRANCHING_CB
								);
								
								return;
							}
							
							if(
								nextStreamName !== undefined &&
								sys.hasType( nextStreamName, "str" ) === false
							)
							{
								this.handleErr(
									stream,
									drop,
									"Arg nextStreamName given to the cb of "+
									"Stream.branch() must be undef or a "+
									"str",
									River.INVALID_ARGS_FOR_BRANCHING_CB
								);
								
								return;
							}
							
							if( err !== undefined && nextStream !== undefined )
							{
								this.handleErr(
									stream,
									drop,
									"An err may be given to the cb of "+
									"Stream.branch() only if arg "+
									"nextStreamName is undef",
									River.INVALID_ARGS_FOR_BRANCHING_CB
								);
								
								return;
							}
							
							if( err !== undefined )
							{
								this.handleErr(
									stream,
									drop,
									"An err was given to the cb of "+
									"Stream.branch()",
									River.ERROR_AT_BRANCHING_CB,
									err
								);
								
								return;
							}
							
							var nextStream = undefined;
							
							if( nextStreamName !== undefined )
							{
								nextStream =
									stream.branchingStreams[ nextStreamName ]
								;
								
								if( nextStream === undefined )
								{
									this.handleErr(
										stream,
										drop,
										"The Stream has no branching Stream by the "+
										"name '"+nextStreamName+"' that was given "+
										"to the cb of Stream.branch()",
										River.NONEXISTENT_BRANCHING_STREAM
									);
									
									return;
								}
							}
							
							if( nextStream !== undefined )
							{
								this.flowDropThroughStream( drop, nextStream );
								
								return;
							}
							
							try
							{
							
							stream.serve(
							drop,
							getCb(
								this,
								getA.ANY_ARGS,
								function( err )
								{
									if( arguments.length > 1 )
									{
										this.handleErr(
											stream,
											drop,
											"No more than one arg may be given to "+
											"the cb of Stream.serve()",
											River.INVALID_ARGS_FOR_SERVING_CB
										);
										
										return;
									}
									
									if(
										err !== undefined &&
										err instanceof Error === false
									)
									{
										this.handleErr(
											stream,
											drop,
											"Arg err given to the cb of "+
											"Stream.serve() must be undef or an err",
											River.INVALID_ARGS_FOR_SERVING_CB
										);
										
										return;
									}
									
									if( err !== undefined )
									{
										this.handleErr(
											stream,
											drop,
											"An err was given to the cb of "+
											"Stream.serve()",
											River.ERROR_AT_SERVING_CB,
											err
										);
										
										return;
									}
									
									this.evaluateServing( stream, drop );
									
									return;
								})
							);
							
							}
							catch( e )
							{
								this.handleErr(
									stream,
									drop,
									"Stream.serve() caused an err",
									River.ERROR_AT_SERVING,
									e
								);
							}
							
							return;
						}
					));
					
					}
					catch( e )
					{
						this.handleErr(
							stream,
							drop,
							"Stream.branch() caused an err",
							River.ERROR_AT_BRANCHING,
							e
						);
						
						return;
					}
				}
			));
			
			}
			catch( e )
			{
				this.handleErr(
					stream,
					drop,
					"Stream.prepare() caused an err",
					River.ERROR_AT_PREPARATION,
					e
				);
				
				return;
			}
		}
	));
	
	}
	catch( e )
	{
		this.handleErr(
			stream,
			drop,
			"Stream.validate() caused an err",
			River.ERROR_AT_VALIDATION,
			e
		);
		
		return;
	}
}],

start:
[
getA( "func/undef" ),
function( cb )
{
	if( this.isRunning === true )
	{
		throw new RiverRuntimeError(
			"The server is already running", "ServerIsAlreadyRunning"
		);
	}
	
	var server = this.server;
	
	server.listen( this.port, "127.0.0.1" );
	
	if( cb !== undefined )
	{
		var river = this;
		
		server.once(
			"listening",
			getCb(
				this,
				function()
				{
					cb();
				}
			)
		);
	}
}],

stop:
[
getA( "func/undef" ),
function( cb )
{
	if( this.isRunning === false )
	{
		throw new RiverRuntimeError(
			"The server isnt running", "ServerIsNotRunning"
		);
	}
	
	var server = this.server;
	
	server.close();
	
	if( cb !== undefined )
	{
		server.once(
			"close",
			getCb(
				this,
				function()
				{
					cb();
				}
			)
		);
	}
}]

});

});
