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
		{ extraItems:RequestProvider }
	] );
},
function (
	topRequestProvider,
	failureProvider,
	logValidationFailure,
	errorProvider,
	logError,
	providers
)
{
	this.providers = [];
	
	this.topRequestProvider = topRequestProvider;
	this.failureProvider = failureProvider;
	this.logFailure = logValidationFailure;
	this.errorProvider = errorProvider;
	this.logError = logError;
	
	this._addProvider( topRequestProvider );
	this._addProvider( failureProvider );
	this._addProvider( errorProvider );
	
	for( var pos in providers )
	{
		this._addProvider( providers[ pos ] );
	}
});

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

exports.Server = Server;

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
	RequestProvider.PROVIDER_NAME_S,
	Request,
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
			failureCode:[ RequestProvider.FAILURE_CODE_S, "undef" ]
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
	try
	{
		// TODO: Decide what to log and how
		
		console.log(
			{
				time: time,
				request: request,
				currProviderName: currProviderName,
				firstErrorCode: firstErrorCode,
				firstError: firstError,
				secondErrorCode: secondErrorCode,
				secondError: secondError,
				additionalFields: opts
			}
		);
	}
	catch( e )
	{
		
	}
});

Server.prototype._logValidationFailure =
sys.getFunc(
new FuncVer( [
	RequestProvider,
	Request,
	RequestProvider,
	RequestProvider.FAILURE_CODE_S,
	Date
]),
function(
	currProvider, request, failureProvider, failureCode, time
)
{
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
	
	this.logFailure(
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
				this._logError(
					currProvider,
					request,
					Server.ERROR_AT_VALIDATION_FAILURE_LOGGING_CB,
					err,
					new Date(),
					{
						"failureProvider": failureProvider,
						"failureCode": failureCode
					}
				);
			}
		})
	);
	
	}
	catch( e )
	{
		this._logError(
			currProvider,
			request,
			Server.ERROR_AT_VALIDATION_FAILURE_LOGGING,
			e,
			new Date(),
			{
				"failureProvider": failureProvider,
				"failureCode": failureCode
			}
		);
	}
});

Server.prototype._logError =
sys.getFunc(
new FuncVer(
	[
		RequestProvider,
		Request,
		Server.ERROR_CODE_S,
		Error,
		Date,
		{
			types:"obj/undef",
			props:
			{
				failureProvider:[ RequestProvider, "undef" ],
				failureCode:[ RequestProvider.FAILURE_CODE_S, "undef" ]
			},
			extraProps:false
		}
	],
	"bool"
),
function(
	currProvider, request, errorCode, err, time, opts
)
{
	opts = opts !== undefined ? opts : {};
	var newOpts = {};
	
	newOpts.failureProviderName =
		opts.failureProvider !== undefined ?
		opts.failureProvider.getName() :
		undefined
	;
	
	newOpts.failureCode = opts.failureCode;
	
	var currProviderName =
		currProvider !== undefined ?
		currProvider.getName() :
		undefined
	;
	
	try
	{
	
// Arg newOpts is always set to an obj, even if it may be empty
	
	this.logError(
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
				this._logErrorOfErrorLogging(
					currProviderName,
					request,
					errorCode,
					err,
					Server.ERROR_AT_ERROR_LOGGING_CB,
					cbErr,
					new Date(),
					newOpts
				)
			}
		})
	);
	
	}
	catch( e )
	{
		this._logErrorOfErrorLogging(
			currProviderName,
			request,
			errorCode,
			err,
			Server.ERROR_AT_ERROR_LOGGING,
			e,
			new Date(),
			newOpts
		);
		
		return false;
	}
	
	return true;
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
	throw err;
	
	var time = new Date();
	
	var thisServer = this;
	
	request.resetRequestObject();
	
	var providerCache = request.getProviderCache();
	
	opts = opts === undefined ? {} : opts;
	
	thisServer._logError(
		currProvider, request, errorCode, err, time, opts
	);
	
// An attempt to send response to client is done even if
// error logging has failed
	
	try
	{
	
// currProvider's ErrorProvider is used even if the error
// occurred during provision for a validation failure
	
	var currErrorProvider = currProvider.getErrorProvider();
	
	currErrorProvider =
		currErrorProvider !== undefined ?
		currErrorProvider :
		this.errorProvider
	;
	
	thisServer.verifyProvider( currErrorProvider );
	
	var currErrorProviderName = currErrorProvider.getName();
	var failureProviderName =
		opts.failureProvider !== undefined ?
			opts.failureProvider.getName() :
			undefined
	;
	
// If the errorProvider is the same RequestProvider that caused
// the error during provision, then an attempt to provide for
// the error using the same RequestProvider again isnt made
	
	if(
		(
			(
				errorCode ===
					Server.ERROR_AT_VALIDATION_FAILURE_PROVISION
				||
				errorCode ===
					Server.ERROR_AT_VALIDATION_FAILURE_PROVISION_CB
			) &&
			currErrorProviderName === failureProviderName
		)
		||
		(
			(
				errorCode === Server.ERROR_AT_PROVISION ||
				errorCode === Server.ERROR_AT_PROVISION_CB 
			) &&
			currErrorProviderName === currProvider.getName()
		)
	)
	{
		return;
	}
	
	providerCache.setProvider( currErrorProvider );
	
	currErrorProvider.provide(
		request,
		function( err )
		{
			if( conf.doVer() === true )
			{
				new FuncVer( [ [ Error, "undef" ] ] )
					.verArgs( arguments )
				;
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
					err,
					new Date()
				);
				
				return;
			}
		}
	);
	
	}
	catch( e )
	{
		
// Arg opts isnt passed on since its information isnt relevant
// for the logging of the error that occurred when provide()
// of the errorProvider was called
		
		thisServer._logError(
			currProvider,
			request,
			Server.ERROR_AT_ERROR_PROVISION,
			e,
			new Date()
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
	var time = new Date();
	
	var providerCache = request.getProviderCache();
	
	var thisServer = this;
	
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
		failureCode,
		time
	);
	
// An attempt to send response to client is done even if
// validation failure logging has failed
	
	try
	{
	
	thisServer.verifyProvider( failureProviderToUse );
	
	providerCache.setProvider( failureProviderToUse );
	
	failureProviderToUse.provide(
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
	var providerCache = request.getProviderCache();
	
	var thisServer = this;
	
	try
	{
	
	thisServer.verifyProvider( currProvider );
	
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
								Server.ERROR_AT_HAND_OVER,
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

Server.prototype._addProvider =
sys.getFunc(
new FuncVer( [ RequestProvider ] ),
function( requestProvider )
{
	var providerName = requestProvider.getName();
	var providers = this.providers;
	
	if( providers[ providerName ] !== undefined )
	{
		throw new RuntimeError(
			"RequestProvider '"+providerName+"' has already been "+
			"added to this Server",
			Server.prototype._addProvider
		);
	}
	
	providers[ providerName ] = requestProvider;
}
);

Server.prototype.verifyProvider =
sys.getFunc(
new FuncVer( [ RequestProvider ] ),
function( requestProvider )
{
	var providers = this.providers;
	
	var requestProviderName = requestProvider.getName();
	
	if(
		providers[ requestProviderName ] === undefined ||
		providers[ requestProviderName ] !== requestProvider
	)
	{
		throw new RuntimeError(
			"The given RequestProvider isnt part of this Server",
			Server.prototype.verifyProvider
		);
	}
	
	var failureProvider =
		requestProvider.getValidationFailureProvider()
	;
	
	if( failureProvider !== undefined )
	{
		var failureProviderName = failureProvider.getName();
		
		if(
			providers[ failureProviderName ] === undefined ||
			providers[ failureProviderName ] !== failureProvider
		)
		{
			throw new RuntimeError(
				"The given RequestProvider's ValidationFailureProvider "+
				" isnt part of this Server",
				Server.prototype.verifyProvider
			);
		}
	}
	
	var errorProvider = requestProvider.getErrorProvider();
	
	if( errorProvider !== undefined )
	{
		var errorProviderName = errorProvider.getName();
		
		if(
			providers[ errorProviderName ] === undefined ||
			providers[ errorProviderName ] !== errorProvider
		)
		{
			throw new RuntimeError(
				"The given RequestProvider's ErrorProvider isnt part "+
				"of this Server",
				Server.prototype.verifyProvider
			);
		}
	}
});

Server.prototype.start =
sys.getFunc(
new FuncVer(),
function()
{
	if( conf.doVer() === true )
	{
		new FuncVer().verArgs( arguments );
	}
	
	var thisServer = this;
	
	http.createServer(
		function( serverRequest, serverResponse )
		{
			var request = new Request( serverRequest, serverResponse );
			
			thisServer._useProvider(
				thisServer.topRequestProvider, request
			);
		}
	)
		.listen( 1337, "127.0.0.1" )
	;
});
