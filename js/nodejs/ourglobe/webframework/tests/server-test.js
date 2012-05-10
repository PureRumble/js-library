var vows = require("vows");

var timers = require("timers");
var crypto = require("crypto");

var Testing = require("ourglobe/testing").Testing;

var RuntimeError = require("ourglobe").RuntimeError;

var assert = require("ourglobe").assert;
var FuncVer = require("ourglobe").FuncVer;

var sys = require("ourglobe").sys;

var MoreHttp = require("ourglobe/utils").MoreHttp;

var Server = require("ourglobe/webframework").Server;
var Request = require("ourglobe/webframework").Request;
var RequestProvider =
	require("ourglobe/webframework").RequestProvider
;
var ProviderCache =
	require("ourglobe/webframework").ProviderCache
;

var _getProviderClass =
sys.getFunc(
new FuncVer(
	[
		{
			types:"obj/undef",
			extraProps:false,
			props:
			{
				validate:"func/undef",
				prepare:"bool/func/undef",
				handOver:"bool/func/undef",
				provide:"func/undef"
			}
		}
	],
	"func"
),
function( opts )
{
	opts = opts !== undefined ? opts : {};
	
	opts.prepare =
		opts.prepare !== undefined ?
		opts.prepare :
		false
	;
	
	opts.handOver =
		opts.handOver !== undefined ?
		opts.handOver :
		false
	;
	
	var validateFunc =
		opts.validate !== undefined ?
		opts.validate :
		sys.getFunc(
			RequestProvider.VALIDATE_FV,
			function( request, cb )
			{
				cb( undefined, true );
			}
		)
	;
	
	var prepareFunc =
		sys.hasType( opts.prepare, "func" ) === true ?
			opts.prepare :
		opts.prepare === true ?
			sys.getFunc(
				RequestProvider.PREPARE_FV,
				function( request, cb )
				{
					cb( undefined );
				}
			) :
		undefined
	;
	
	var handOverFunc =
		sys.hasType( opts.handOver, "func" ) === true ?
			opts.handOver :
		opts.handOver === true ?
			sys.getFunc(
				RequestProvider.HAND_OVER_FV,
				function( request ) { }
			) :
		undefined
	;
	
	var provideFunc =
		opts.provide !== undefined ?
		opts.provide :
		sys.getFunc(
			RequestProvider.PROVIDE_FV,
			function( request, cb )
			{
				var serverReq = request.getReqObj().serverReq;
				var serverRes = request.getReqObj().serverRes;
				
				serverReq.setEncoding( "utf8" );
				
				var reqData = "";
				
				serverReq.on(
					"data",
					sys.getFunc(
						new FuncVer( [ "str" ] ),
						function( chunk )
						{
							reqData += chunk;
						}
					)
				);
				
				serverReq.on(
					"end",
					sys.getFunc(
						new FuncVer(),
						function()
						{
							serverRes.write( reqData, "utf8" );
							
							serverRes.end();
							
							cb();
						}
					)
				);
			}
		)
	;
	
	var Provider =
	sys.getFunc(
	new FuncVer( [
		RequestProvider.PROVIDER_NAME_S,
		[ RequestProvider, "undef" ],
		[ RequestProvider, "undef" ]
	]),
	function( providerName, failureProvider, errorProvider )
	{
		Provider.super_.call(
			this, providerName, failureProvider, errorProvider
		);
	});
	
	sys.inherits( Provider, RequestProvider );
	
	Provider.prototype.validate =
	sys.getFunc(
	RequestProvider.VALIDATE_FV,
	function( request, cb )
	{
		_callStack.push( this.getName()+".validate" );
		
		validateFunc( request, cb );
	});
	
	if( opts.prepare !== false )
	{
		Provider.prototype.prepare =
		sys.getFunc(
		RequestProvider.PREPARE_FV,
		function( request, cb )
		{
			_callStack.push( this.getName()+".prepare" );
			
			prepareFunc( request, cb );
		});
	}
	
	if( opts.handOver !== false )
	{
		Provider.prototype.handOver =
		sys.getFunc(
		RequestProvider.HAND_OVER_FV,
		function( request, cb )
		{
			_callStack.push( this.getName()+".handOver" );
			
			return handOverFunc( request );
		});
	}
	
	Provider.prototype.provide =
	sys.getFunc(
	RequestProvider.PROVIDE_FV,
	function( request, cb )
	{
		_callStack.push( this.getName()+".provide" );
		
		provideFunc( request, cb );
	});
	
	return Provider;
});

var _getProvider =
sys.getFunc(
new FuncVer(
	[
		RequestProvider.PROVIDER_NAME_S,
		{
			types: [ RequestProvider, "obj", "undef" ],
			extraProps:false,
			props:
			{
				validate: "func/undef",
				prepare: "bool/func/undef",
				handOver: "bool/func/undef",
				provide: "func/undef",
				failureProvider: [ RequestProvider, "undef" ],
				errorProvider: [ RequestProvider, "undef" ]
			}
		}
	],
	RequestProvider
),
function( name, opts )
{
	if( opts instanceof RequestProvider === true )
	{
		return opts;
	}
	
	if( opts === undefined )
	{
		opts = {};
	}
	
	var ProviderClass = _getProviderClass( opts );
	
	var provider =
		new ProviderClass(
			name, opts.failureProvider, opts.errorProvider
		)
	;
	
	return provider;
});

var _validateWithFailure =
sys.getFunc(
RequestProvider.VALIDATE_FV,
function( request, cb )
{
	cb( undefined, false, "ValidationFailed" );
});

var _validateWithFailureAndProvider =
sys.getFunc(
RequestProvider.VALIDATE_FV,
function( request, cb )
{
	cb(
		undefined,
		false,
		"ValidationFailed",
		_overridingFailureProvider
	);
});

var _testRequest =
sys.getFunc(
new FuncVer(
	[
		{ extraItems:"str" },
		"str/undef",
		"str/undef",
		{
			types:"obj/undef",
			props:
			{
				providers:
				{
					types:"arr/undef", extraItems:RequestProvider
				},
				failureLog:
					{ types:"arr/undef", extraItems:"obj" }
				,
				errorLog:
					{ types:"arr/undef", extraItems:"obj" }
				,
				topReqProvider:
				{
					types: [ RequestProvider, "obj", "undef" ],
					extraProps: false,
					props:
					{
						validate: "func/undef",
						prepare: "bool/func/undef",
						handOver: "bool/func/undef",
						provide: "func/undef"
					}
				},
				failureProvider:
				{
					types: [ RequestProvider, "obj", "undef" ],
					extraProps: false,
					props:
					{
						validate: "func/undef",
						prepare: "bool/func/undef",
						handOver: "bool/func/undef",
						provide: "func/undef"
					}
				},
				errorProvider:
				{
					types: [ RequestProvider, "obj", "undef" ],
					extraProps: false,
					props:
					{
						validate: "func/undef",
						prepare: "bool/func/undef",
						handOver: "bool/func/undef",
						provide: "func/undef"
					}
				},
				logFailure: "func/undef",
				logError: "func/undef"
			},
			extraProps:false
		}
	],
	"obj"
),
function( callStack, sendStr, recStr, opts )
{
	if( opts === undefined )
	{
		opts = {};
	}
	
	var providers = opts.providers;
	if( providers === undefined )
	{
		providers = [];
	}
	
	var failureLog = opts.failureLog;
	if( failureLog === undefined )
	{
		failureLog = [];
	}
	
	var errorLog = opts.errorLog;
	if( errorLog === undefined )
	{
		errorLog = [];
	}
	
	var topReqProvider =
		_getProvider( "topReqProvider", opts.topReqProvider )
	;
	var failureProvider =
		_getProvider(  "failureProvider", opts.failureProvider )
	;
	var errorProvider =
		_getProvider( "errorProvider", opts.errorProvider )
	;
	
	var logFailure =
	sys.getFunc(
	Server.LOG_VALIDATION_FAILURE_FV,
	function(
		currProviderName,
		request,
		failureProviderName,
		failureCode,
		time,
		cb
	)
	{
		var logObj = {};
		
		logObj.currProviderName = currProviderName;
		logObj.failureProviderName= failureProviderName;
		logObj.failureCode = failureCode;
		
		_failureLog.push( logObj );
		
		_callStack.push( "logFailure" );
		
		if( opts.logFailure !== undefined )
		{
			opts.logFailure( cb );
			
			return;
		}
		else
		{
			cb();
		}
	});
	
	var logError =
	sys.getFunc(
	Server.LOG_ERROR_FV,
	function(
		currProviderName,
		request,
		err,
		errorCode,
		time,
		newOpts,
		cb
	)
	{
		var logObj = {};
		
// currProviderName is undefined for errorCode ERROR_IN_SERVER
		
		if( currProviderName !== undefined )
		{
			logObj.currProviderName = currProviderName;
		}
		
		logObj.errorCode = errorCode;
		
		if( newOpts.failureProviderName !== undefined )
		{
			logObj.failureProviderName = newOpts.failureProviderName;
		}
		
		if( newOpts.failureCode !== undefined )
		{
			logObj.failureCode = newOpts.failureCode;
		}
		
		_errorLog.push( logObj );
		
		_callStack.push( "logError" );
		
		if( opts.logError !== undefined )
		{
			opts.logError( cb );
			
			return;
		}
		else
		{
			cb();
		}
	});
	
	var server =
	new Server(
		topReqProvider,
		failureProvider,
		logFailure,
		errorProvider,
		logError,
		providers,
		sys.getFunc(
			new FuncVer( [ Error ] ),
			function( err )
			{
				throw err;
			}
		)
	);
	
	var returnVar =
	Testing.getTests(
		
		"topic",
		function()
		{
			var thisTopic = this;
			
			_failureLog = [];
			_errorLog = [];
			_callStack = [];
			
			server.start(
				sys.getFunc(
					Server.START_CB_FV,
					function()
					{
						MoreHttp.request(
							"localhost",
							{
								method:"GET",
								port:1337,
								data:sendStr,
								headers:
								{
									"Content-Length": sendStr.length,
									"Content-Type":
										"application/x-www-form-urlencoded"
								}
							},
							sys.getFunc(
								MoreHttp.REQUEST_CB_FV,
								function( err, statusCode, res )
								{
									server.stop(
										sys.getFunc(
											Server.STOP_CB_FV,
											function()
											{
												thisTopic.callback(
													err, statusCode, res
												);
											}
										)
									);
								}
							)
						);
					}
				)
			);
		},
		
		"gives expected data",
		sys.getFunc(
			MoreHttp.REQUEST_CB_FV,
			function( err, statusCode, resBuf )
			{
				Testing.errorCheckArgs( arguments );
				
				var res =
					resBuf !== undefined ? resBuf.toString() : undefined
				;
				
				assert(
					res === recStr,
					"Didnt receive expected response data. Received and "+
					"expected data are: "+
					Testing.getPrettyStr( {
						received:res, expected:recStr
					})
				);
			}
		),
		
		"yields expected callStack",
		sys.getFunc(
			MoreHttp.REQUEST_CB_FV,
			function( err, statusCode, resBuf )
			{
				assert(
					Testing.areEqual( _callStack, callStack ),
					"Server funcs havent been called in the expected "+
					"order. Current and expected callStack are: "+
					Testing.getPrettyStr( {
						current:_callStack, expected:callStack
					})
				);
			}
		),
		
		"yields expected errorLog",
		sys.getFunc(
			MoreHttp.REQUEST_CB_FV,
			function( err, statusCode, resBuf )
			{
				assert(
					Testing.areEqual( _errorLog, errorLog ),
					"The errorLog isnt as expected. Current and expected "+
					"errorLogs are: "+
					Testing.getPrettyStr( {
						current:_errorLog, expected:errorLog
					})
				);
			}
		),
			
		"yields expected validationFailureLog",
		sys.getFunc(
			MoreHttp.REQUEST_CB_FV,
			function( err, statusCode, resBuf )
			{
				assert(
					Testing.areEqual( _failureLog, failureLog ),
					"The validationFailureLog isnt as expected. Current "+
					"and expected validationFailureLog are: "+
					Testing.getPrettyStr( {
						current:_failureLog, expected:failureLog
					})
				);
			}
		)
	);
	
	return returnVar;
});

var _overridingFailureProvider =
	_getProvider( "overridingFailureProvider" )
;

var _callStack = undefined;

var _failureLog = undefined;
var _errorLog = undefined;

_REQ_DATA =
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "+
	"Mariam DainHolm was walking the longer road home "
;

var suite = vows.describe( "server" );
suite.options.error = false;

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, provide",
	_testRequest(
		[ "topReqProvider.validate", "topReqProvider.provide" ],
		_REQ_DATA,
		_REQ_DATA
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, prepare, handOver, provide",
	_testRequest(
		[
			"topReqProvider.validate",
			"topReqProvider.prepare",
			"topReqProvider.handOver",
			"topReqProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider: { prepare: true, handOver: true }
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validateWithFailure",
	_testRequest(
		[
			"topReqProvider.validate",
			"logFailure",
			"failureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure
			},
			failureLog:
			[
				{
					currProviderName: "topReqProvider",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validateWithFailureAndProvider",
	_testRequest(
		[
			"topReqProvider.validate",
			"logFailure",
			"overridingFailureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailureAndProvider
			},
			providers: [ _overridingFailureProvider ],
			failureLog:
			[
				{
					currProviderName: "topReqProvider",
					failureProviderName: "overridingFailureProvider",
					failureCode: "ValidationFailed"
				}
			]
		}
	)
	
));

suite.export( module );
