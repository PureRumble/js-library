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

var _getProvider =
sys.getFunc(
new FuncVer( undefined, "func" ),
function()
{
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
	
	Provider.prototype.validate = _validate;
	Provider.prototype.provide = _provide;
	
	sys.inherits( Provider, RequestProvider );
	
	return Provider;
});

var TopReqProvider = _getProvider();
var FailureProvider = _getProvider();
var OverridingFailureProvider = _getProvider();
var ErrorProvider = _getProvider();

var _callStack = undefined;

var _topReqProvider = new TopReqProvider( "topReqProvider" );
var _failureProvider = new FailureProvider( "failureProvider" );
var _overridingFailureProvider =
	new OverridingFailureProvider( "overridingFailureProvider" )
;
var _errorProvider = new ErrorProvider( "errorProvider" );

var _USED_PROVIDERS = [
	TopReqProvider,
	FailureProvider,
	OverridingFailureProvider,
	ErrorProvider
];

var _failureLog = undefined;
var _errorLog = undefined;

_REQ_DATA =
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "+
"Mariam DainHolm was walking the longer road home for a walk "
;

var _validate =
sys.getFunc(
RequestProvider.VALIDATE_FV,
function( request, cb )
{
	_callStack.push( this.getName()+".validate" );
	
	cb( undefined, true );
});

var _validateWithFailure =
sys.getFunc(
RequestProvider.VALIDATE_FV,
function( request, cb )
{
	_callStack.push( this.getName()+".validateWithFailure" );
	
	cb( undefined, false, "ValidationFailed" );
});

var _validateWithFailureAndProvider =
sys.getFunc(
RequestProvider.VALIDATE_FV,
function( request, cb )
{
	_callStack.push(
		this.getName()+".validateWithFailureAndProvider"
	);
	
	cb(
		undefined,
		false,
		"ValidationFailed",
		_overridingFailureProvider
	);
});

var _prepare =
sys.getFunc(
RequestProvider.PREPARE_FV,
function( request, cb )
{
	_callStack.push( this.getName()+".prepare" );
	
	cb( undefined );
});

var _handOver =
sys.getFunc(
RequestProvider.HAND_OVER_FV,
function( request )
{
	_callStack.push( this.getName()+".handOver" );
	
	return undefined;
});

var _provide =
sys.getFunc(
RequestProvider.PROVIDE_FV,
function( request, cb )
{
	_callStack.push( this.getName()+".provide" );
	
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
});

var _logFailure =
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
	
	cb();
});


var _logError =
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
});

var _resetTests =
sys.getFunc(
new FuncVer(),
function()
{
	_failureLog = [];
	_errorLog = [];
	
	_callStack = [];
	
	for( var item in _USED_PROVIDERS )
	{
		var Provider = _USED_PROVIDERS[ item ];
		
		Provider.prototype.validate = _validate;
		
		if( "prepare" in Provider.prototype === true )
		{
			delete Provider.prototype.prepare;
		}
		
		if( "handOver" in Provider.prototype === true )
		{
			delete Provider.prototype.handOver;
		}
		
		Provider.prototype.provide = _provide;
	}
	
	_logFailureFunc = _logFailure;
	
	_logErrorFunc = _logError;
});

var _testRequest =
sys.getFunc(
new FuncVer(
	[
		"func",
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
			},
			extraProps:false
		}
	],
	"obj"
),
function(
	testFunc, callStack, sendStr, recStr, opts
)
{
	opts = opts !== undefined ? opts: {};
	
	var providers = opts.providers;
	var failureLog = opts.failureLog;
	var errorLog = opts.errorLog;
	
	var providers = providers !== undefined ? providers : [];
	var failureLog = failureLog !== undefined ? failureLog : []; 
	var errorLog = errorLog !== undefined ? errorLog : []; 
	
	var server =
	new Server(
		_topReqProvider,
		_failureProvider,
		_logFailure,
		_errorProvider,
		_logError,
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
			
			_resetTests();
			
			testFunc();
			
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

var suite = vows.describe( "server" );
suite.options.error = false;


suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, provide",
	_testRequest(
		function()
		{
		},
		[ "topReqProvider.validate", "topReqProvider.provide" ],
		_REQ_DATA,
		_REQ_DATA
	)
	
));

// _topReqProvider provides
suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, prepare, handOver, provide",
	_testRequest(
		function()
		{
			TopReqProvider.prototype.prepare = _prepare;
			
			TopReqProvider.prototype.handOver = _handOver;
		},
		[
			"topReqProvider.validate",
			"topReqProvider.prepare",
			"topReqProvider.handOver",
			"topReqProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validateWithFailure",
	_testRequest(
		function()
		{
			TopReqProvider.prototype.validate =
				_validateWithFailure
			;
		},
		[
			"topReqProvider.validateWithFailure",
			"logFailure",
			"failureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			failureLog:[
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
		function()
		{
			TopReqProvider.prototype.validate =
				_validateWithFailureAndProvider
			;
		},
		[
			"topReqProvider.validateWithFailureAndProvider",
			"logFailure",
			"overridingFailureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			providers: [ _overridingFailureProvider ],
			failureLog:[
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
