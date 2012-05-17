var http = require("http");
var url = require("url");

var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var Server =
sys.getFunc(
function()
{
	return new FuncVer( [
		RequestProvider,
		RequestProvider,
		"func",
		RequestProvider,
		"func",
		"func",
		FuncVer.NON_NEG_INT
	] );
},
function(
	topRequestProvider,
	failureProvider,
	logValidationFailure,
	errorProvider,
	logError,
	cbOnErr,
	port
)
{
	var thisServer = this;
	
	thisServer.topRequestProvider = topRequestProvider;
	thisServer.failureProvider = failureProvider;
	thisServer.logFailure = logValidationFailure;
	thisServer.errorProvider = errorProvider;
	thisServer.logError = logError;
	thisServer.port = port;
	
	thisServer.isRunning = false;
	
	var server =
	http.createServer(
		function( serverRequest, serverResponse )
		{
			var request = new Request( serverRequest, serverResponse );
			
			thisServer._useProvider(
				thisServer.topRequestProvider, request
			);
		}
	);
	
	thisServer.server = server;
	
// An error event causes the close event to occur directly after,
// therefore the logging of the error and call of cbOnErr is
// done once the server has been closed. cbOnErr isnt to be
// called before the logging has been done
	
	server.on(
		"error",
		sys.getFunc(
			new FuncVer( [ Error ] ),
			function( err )
			{
				server.once(
					"close",
					sys.getFunc(
						new FuncVer(),
						function()
						{
							thisServer._logError(
								undefined,
								undefined,
								Server.ERROR_IN_SERVER,
								err,
								{
									cb:
									sys.getFunc(
										new FuncVer(),
										function()
										{
											cbOnErr( err );
										}
									)
								}
							);
						}
					)
				);
			}
		)
	);
	
	server.on(
		"listening",
		sys.getFunc(
			new FuncVer(),
			function()
			{
				thisServer.isRunning = true;
			}
		)
	);
	
	server.on(
		"close",
		sys.getFunc(
			new FuncVer(),
			function()
			{
				thisServer.isRunning = false;
			}
		)
	);
});

Server.ERROR_IN_SERVER = "ErrorInServer";

Server.ERROR_AT_VALIDATION = "ErrorAtValidation";
Server.ERROR_AT_VALIDATION_CB = "ErrorAtValidationCb";
Server.ERROR_AT_PROVISION = "ErrorAtProvision";
Server.ERROR_AT_PROVISION_CB = "ErrorAtProvisionCb";
Server.ERROR_AT_VALIDATION_FAILURE_PROVISION =
	"ErrorAtValidationFailureProvision"
;
Server.ERROR_AT_VALIDATION_FAILURE_PROVISION_CB =
	"ErrorAtValidationFailureProvisionCb"
;
Server.ERROR_AT_VALIDATION_FAILURE_LOGGING =
	"ErrorAtValidationFailureLogging"
;
Server.ERROR_AT_VALIDATION_FAILURE_LOGGING_CB =
	"ErrorAtValidationFailureLoggingCb"
;
Server.ERROR_AT_HANDOVER = "ErrorAtHandover";
Server.ERROR_AT_PREPARATION = "ErrorAtPreparation";
Server.ERROR_AT_PREPARATION_CB = "ErrorAtPreparationCb";
Server.ERROR_AT_ERROR_PROVISION = "ErrorAtErrorProvision";
Server.ERROR_AT_ERROR_PROVISION_CB = "ErrorAtErrorProvisionCb";
Server.ERROR_AT_ERROR_LOGGING = "ErrorAtErrorLogging";
Server.ERROR_AT_ERROR_LOGGING_CB = "ErrorAtErrorLoggingCb";

Server.ERROR_CODE_S = { minStrLen:1, chars:"letters" };

Server.CB_ON_ERR_FV = new FuncVer( [ Error ] );

Server.START_CB_FV = new FuncVer();

Server.STOP_CB_FV = new FuncVer();

exports.Server = Server;

var ServerRuntimeError =
	require("./errors").ServerRuntimeError
;
var RequestProvider =
	require("./requestprovider").RequestProvider
;
var ProviderCache = require("./providercache").ProviderCache;

var Request = require("./request").Request;

Server.LOG_VALIDATION_FAILURE_FV =
new FuncVer( [
	RequestProvider.PROVIDER_NAME_S,
	Request,
	RequestProvider.PROVIDER_NAME_S,
	RequestProvider.FAILURE_CODE_S,
	Date,
	"func"
]);

Server.LOG_ERROR_FV =
new FuncVer( [
	RequestProvider.PROVIDER_NAME_S,
	Request,
	Error,
	Server.ERROR_CODE_S,
	Date,
	{
		props:
		{
			failureProviderName:[
				RequestProvider.PROVIDER_NAME_S, "undef"
			],
			failureCode:[
				RequestProvider.FAILURE_CODE_S, "undef"
			]
		}
	},
	"func"
]);

Server.prototype._logErrorOfErrorLogging =
sys.getFunc(
new FuncVer( [
	[ RequestProvider.PROVIDER_NAME_S, "undef" ],
	[ Request, "undef" ],
	Server.ERROR_CODE_S,
	Error,
	Server.ERROR_CODE_S,
	Error,
	Date,
	{
		types:"obj/undef",
		props:
		{
			failureProviderName:[
				RequestProvider.PROVIDER_NAME_S, "undef"
			],
			failureCode:[ RequestProvider.FAILURE_CODE_S, "undef" ],
			cb:"func/undef"
		},
		extraProps:false
	}
]),
function(
	currProviderName,
	request,
	firstErrorCode,
	firstError,
	secondErrorCode,
	secondError,
	time,
	opts
)
{
	// TODO: Decide how to log
	
	opts = opts !== undefined ? opts : {};
	
	if( opts.cb !== undefined )
	{
		cb();
	}
});

Server.prototype._logValidationFailure =
sys.getFunc(
new FuncVer( [
	RequestProvider,
	Request,
	RequestProvider,
	RequestProvider.FAILURE_CODE_S
]),
function(
	currProvider, request, failureProvider, failureCode
)
{
	var thisServer = this;
	
	var time = new Date();
	
	var currProviderName =
		currProvider !== undefined ?
		currProvider.getName() :
		undefined
	;
	
	var failureProviderName =
		failureProvider !== undefined ?
		failureProvider.getName() :
		undefined
	;
	
	try
	{
	
	thisServer.logFailure(
		currProviderName,
		request,
		failureProviderName,
		failureCode,
		time,
		sys.getFunc(
		new FuncVer( [ [ Error, "undef" ] ] ),
		function( err )
		{
			if( err !== undefined )
			{
				
// failureProviderName and failureCode arent relevant when
// logging an error that occurred during validationFailureLogging
				
				thisServer._logError(
					currProvider,
					request,
					Server.ERROR_AT_VALIDATION_FAILURE_LOGGING_CB,
					err
				);
			}
		})
	);
	
	}
	catch( e )
	{
		
// failureProviderName and failureCode arent relevant when
// logging an error that occurred during validationFailureLogging
		
		thisServer._logError(
			currProvider,
			request,
			Server.ERROR_AT_VALIDATION_FAILURE_LOGGING,
			e
		);
	}
});

Server.prototype._logError =
sys.getFunc(
new FuncVer(
	[
		[ RequestProvider, "undef" ],
		[ Request, "undef" ],
		Server.ERROR_CODE_S,
		Error,
		{
			types:"obj/undef",
			props:
			{
				failureProvider:[ RequestProvider, "undef" ],
				failureCode:[ RequestProvider.FAILURE_CODE_S, "undef" ],
				cb:"func/undef"
			},
			extraProps:false
		}
	]
),
function( currProvider, request, errorCode, err, opts )
{
	var thisServer = this;
	
	var time = new Date();
	
	opts = opts !== undefined ? opts : {};
	var newOpts = {};
	
	newOpts.failureProviderName =
		opts.failureProvider !== undefined ?
		opts.failureProvider.getName() :
		undefined
	;
	
	newOpts.failureCode = opts.failureCode;
	newOpts.cb = opts.cb;
	
	var currProviderName =
		currProvider !== undefined ?
		currProvider.getName() :
		undefined
	;
	
	try
	{
	
// Arg newOpts is always set to an obj, even if it may be empty
	
	thisServer.logError(
		currProviderName,
		request,
		err,
		errorCode,
		time,
		newOpts,
		sys.getFunc(
		new FuncVer( [ [ Error, "undef" ] ] ),
		function( cbErr )
		{
			if( cbErr !== undefined )
			{
				thisServer._logErrorOfErrorLogging(
					currProviderName,
					request,
					errorCode,
					err,
					Server.ERROR_AT_ERROR_LOGGING_CB,
					cbErr,
					time,
					newOpts
				);
			}
			else if( opts.cb !== undefined )
			{
				opts.cb();
				
				return;
			}
		})
	);
	
	}
	catch( e )
	{
		thisServer._logErrorOfErrorLogging(
			currProviderName,
			request,
			errorCode,
			err,
			Server.ERROR_AT_ERROR_LOGGING,
			e,
			time,
			newOpts
		);
	}
});

Server.prototype._handleError =
sys.getFunc(
new FuncVer( [
	RequestProvider,
	Request,
	Server.ERROR_CODE_S,
	Error,
	{
		types:"obj/undef",
		props:
		{
			failureProvider:[ RequestProvider, "undef" ],
			failureCode:[ RequestProvider.FAILURE_CODE_S, "undef" ]
		},
		extraProps:false
	}
] ),
function(
	currProvider,
	request,
	errorCode,
	err,
	opts
)
{
	var thisServer = this;
	
	request.resetRequestObject();
	
	var providerCache = request.getProviderCache();
	
	opts = opts === undefined ? {} : opts;
	
	thisServer._logError(
		currProvider, request, errorCode, err, opts
	);
	
// An attempt to send response to client is done even if
// error logging has failed, but only if it can be determined
// that the Request is still open
	
	var isWritable = request.isWritable();
	
	if( isWritable === undefined )
	{
		request.forcefullyClose();
	}
	
	if( isWritable === false || isWritable === undefined )
	{
		return;
	}
	
	try
	{
	
// currProvider's ErrorProvider is used even if the error
// occurred during provision for a validation failure
	
	var currErrorProvider = currProvider.getErrorProvider();
	
	currErrorProvider =
		currErrorProvider !== undefined ?
		currErrorProvider :
		thisServer.errorProvider
	;
	
	var currErrorProviderName = currErrorProvider.getName();
	var failureProviderName =
		opts.failureProvider !== undefined ?
			opts.failureProvider.getName() :
			undefined
	;
	
	providerCache.setProvider( currErrorProvider );
	
	currErrorProvider.provide(
		request,
		sys.getFunc(
			new FuncVer( [ [ Error, "undef" ] ] ),
			function( err )
			{
				var isWritable = request.isWritable();
				
// At this stage the request's ServerResponse must be closed
// no matter what
				
				if( isWritable === undefined || isWritable === true )
				{
					request.forcefullyClose();
				}
				
				if( err === undefined )
				{
					if( isWritable === undefined )
					{
						err = new ServerRuntimeError(
							"It cant be verified if the request's "+
							"serverResponse obj has been closed",
							{
								code: "ServerResponseObjWritabilityNotVerifiable"
							}
						);
					}
					else if( isWritable === true )
					{
						err = new ServerRuntimeError(
							"The request's ServerResponse object is "+
							"still writable even if the final "+
							"RequestProvider reports having "+
							"successfully provided for the request",
							{
								code: "ServerResponseObjIsStillWritable"
							}
						);
					}
				}
				
				if( err !== undefined )
				{
					
// Arg opts isnt passed on since its information isnt relevant
// for the logging of the error that occurred when provide()
// of the errorProvider was called
					
					thisServer._logError(
						currProvider,
						request,
						Server.ERROR_AT_ERROR_PROVISION_CB,
						err
					);
					
					return;
				}
			}
		)
	);
	
	}
	catch( e )
	{
		
		var isWritable = request.isWritable();
		
		// At this stage the request must be closed no matter what
		
		if( isWritable === undefined || isWritable === true )
		{
			request.forcefullyClose();
		}
		
// Arg opts isnt passed on since its information isnt relevant
// for the logging of the error that occurred when provide()
// of the errorProvider was called
		
		thisServer._logError(
			currProvider,
			request,
			Server.ERROR_AT_ERROR_PROVISION,
			e
		);
		
		return;
	}
});

Server.prototype._handleFailure =
sys.getFunc(
new FuncVer( [
	RequestProvider,
	Request,
	RequestProvider.FAILURE_CODE_S,
	[ RequestProvider, "undef" ]
] ),
function(
	currProvider, request, failureCode, overridingFailureProvider
)
{
	var thisServer = this;
	
	var providerCache = request.getProviderCache();
	
	request.resetRequestObject();
	
	var currFailureProvider =
		currProvider.getValidationFailureProvider()
	;
	
	var failureProviderToUse =
		overridingFailureProvider !== undefined ?
			overridingFailureProvider :
		currFailureProvider !== undefined ?
			currFailureProvider :
		this.failureProvider
	;
	
	thisServer._logValidationFailure(
		currProvider,
		request,
		failureProviderToUse,
		failureCode
	);
	
// An attempt to send response to client is done even if
// validation failure logging has failed
	
	try
	{
	
	providerCache.setProvider( failureProviderToUse );
	
	failureProviderToUse.provide(
		request,
		sys.getFunc(
		new FuncVer( [ [ Error, "undef" ] ] ),
		function( err )
		{
			if( err === undefined )
			{
				var isWritable = request.isWritable();
				
				if( isWritable === undefined )
				{
					err = new ServerRuntimeError(
						"It cant be verified if the request's "+
						"serverResponse obj has been closed",
						{
							code: "ServerResponseObjWritabilityNotVerifiable"
						}
					);
				}
				else if( isWritable === true )
				{
					err = new ServerRuntimeError(
						"The request's ServerResponse object is "+
						"still writable even if the final "+
						"RequestProvider reports having "+
						"successfully provided for the request",
						{
							code: "ServerResponseObjIsStillWritable"
						}
					);
				}
			}
			
			if( err !== undefined )
			{
				thisServer._handleError(
					currProvider,
					request,
					Server.ERROR_AT_VALIDATION_FAILURE_PROVISION_CB,
					err,
					{
						failureProvider: failureProviderToUse,
						failureCode: failureCode
					}
				);
				
				return;
			}
		})
	);
	
	}
	catch( e )
	{
		thisServer._handleError(
			currProvider,
			request,
			Server.ERROR_AT_VALIDATION_FAILURE_PROVISION,
			e,
			{
				"failureProvider": failureProviderToUse,
				"failureCode": failureCode
			}
		);
	}
	
	return;
}
);

Server.prototype._useProvider =
sys.getFunc(
new FuncVer( [ RequestProvider, Request ] ),
function( currProvider, request )
{
	var thisServer = this;
	
	var providerCache = request.getProviderCache();
	
	try
	{
	
	providerCache.setProvider( currProvider );
	
	currProvider.validate(
		request,
		sys.getFunc(
		new FuncVer()
			.addArgs( [ Error ] )
			.addArgs( [
				"undef",
				"bool",
				[ RequestProvider.FAILURE_CODE_S, "undef" ],
				[ RequestProvider, "undef" ]
			]),
		function(
			err,
			isValid,
			failureCode,
			overridingFailureProvider
		)
		{
			if( err !== undefined )
			{
				thisServer._handleError(
					currProvider,
					request,
					Server.ERROR_AT_VALIDATION_CB,
					err
				);
				
				return;
			}
			
			var isReqProvider =
				overridingFailureProvider instanceof RequestProvider
			;
			
			var failureProviderGiven =
				overridingFailureProvider === undefined ?
					false :
				isReqProvider === true ?
					true :
				undefined
			;
			
			if(
				(
					(
						isValid === true &&
						failureCode === undefined &&
						failureProviderGiven === false
					) ||
					(
						isValid === false &&
						sys.hasType( failureCode, "str" ) === true &&
						failureCode.length >= 1 &&
						failureProviderGiven !== undefined
					)
				) === false
			)
			{
				thisServer._handleError(
					currProvider,
					request,
					Server.ERROR_AT_VALIDATION_CB,
					new RuntimeError(
						"Arg isValid must be a bool. Arg failureCode must "+
						"be undef or a str of minimum length 1 containing "+
						"only letters. Arg overridingFailureProvider must "+
						"be undef or a RequestProvider. A failureCode must "+
						"be specified if request isnt valid. An "+
						"overridingFailureProvider may only be specified if"+
						"request isnt valid"
					)
				);
				
				return;
			}
			
			if( failureCode !== undefined )
			{
				thisServer._handleFailure(
					currProvider,
					request,
					failureCode,
					overridingFailureProvider
				);
				
				return;
			}
			else
			{
				try
				{
				
				currProvider.prepare(
					request,
					sys.getFunc(
					new FuncVer( [ [ Error, "undef" ] ] ),
					function( err )
					{
						if( err !== undefined )
						{
							thisServer._handleError(
								currProvider,
								request,
								Server.ERROR_AT_PREPARATION_CB,
								err
							);
							
							return;
						}
						
						var nextProvider = undefined;
						
						try
						{
						
						nextProvider = currProvider.handOver( request );
						
						}
						catch( e )
						{
							thisServer._handleError(
								currProvider,
								request,
								Server.ERROR_AT_HANDOVER,
								e
							);
							
							return;
						}
						
						if( nextProvider !== undefined )
						{
							thisServer._useProvider( nextProvider, request );
							
							return;
						}
						
						try
						{
						
						currProvider.provide(
							request,
							sys.getFunc(
							new FuncVer( [ [ Error, "undef" ] ] ),
							function( err )
							{
								if( err === undefined )
								{
									var isWritable = request.isWritable();
									
									if( isWritable === undefined )
									{
										err = new ServerRuntimeError(
											"It cant be verified if the request's "+
											"serverResponse obj has been closed",
											{
												code:
													"ServerResponseObjWritability"+
													"NotVerifiable"
											}
										);
									}
									else if( isWritable === true )
									{
										err = new ServerRuntimeError(
											"The request's ServerResponse object is "+
											"still writable even if the final "+
											"RequestProvider reports having "+
											"successfully provided for the request",
											{
												code: "ServerResponseObjIsStillWritable"
											}
										);
									}
								}
								
								if( err !== undefined )
								{
									thisServer._handleError(
										currProvider,
										request,
										Server.ERROR_AT_PROVISION_CB,
										err
									);
									
									return;
								}
							})
						);
						
						}
						catch( e )
						{
							thisServer._handleError(
								currProvider,
								request,
								Server.ERROR_AT_PROVISION,
								e
							);
							
							return;
						}
					})
				);
				
				}
				catch( e )
				{
					thisServer._handleError(
						currProvider,
						request,
						Server.ERROR_AT_PREPARATION,
						e
					);
					
					return;
				}
			}
		})
	);
	
	}
	catch( e )
	{
		thisServer._handleError(
			currProvider, request, Server.ERROR_AT_VALIDATION, e
		);
		
		return;
	}
});

Server.prototype.start =
sys.getFunc(
new FuncVer( [ "func/undef" ] ),
function( cb )
{
	var thisServer = this;
	
	if( thisServer.isRunning === true )
	{
		throw new ServerRuntimeError(
			"The Server is already running",
			{
				code: "ServerIsAlreadyRunning"
			}
		);
	}
	
	var server = thisServer.server;
	
	server.listen( this.port, "127.0.0.1" );
	
	server.once(
		"listening",
		sys.getFunc(
		new FuncVer(),
		function()
		{
			if( cb !== undefined )
			{
				cb();
			}
		})
	);
	
});

Server.prototype.stop =
sys.getFunc(
new FuncVer( [ "func/undef" ] ),
function( cb )
{
	var thisServer = this;
	
	if( thisServer.isRunning === false )
	{
		throw new ServerRuntimeError(
			"The Server isnt running",
			{
				code: "ServerIsNotRunning"
			}
		);
	}
	
	var server = thisServer.server;
	
	server.close();
	
	server.once(
		"close",
		sys.getFunc(
			new FuncVer(),
			function()
			{
				if( cb !== undefined )
				{
					cb();
				}
			}
		)
	);
});
