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

var _callStack = undefined;

var TopReqProvider = _getProvider();
var FailureProvider = _getProvider();
var OverridingFailureProvider = _getProvider();
var ErrorProvider = _getProvider();

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

var _logFailure =
sys.getFunc(
Server.LOG_VALIDATION_FAILURE_FV,
function()
{
	_callStack.push( "logFailure" );
});

var _logError =
sys.getFunc(
Server.LOG_ERROR_FV,
function()
{
	_callStack.push( "logError" );
});

var _server = new Server(
	_topReqProvider,
	_failureProvider,
	sys.getFunc(
	Server.LOG_VALIDATION_FAILURE_FV,
	function()
	{
		_logFailureFunc.apply( _logFailureFunc, arguments );
	}),
	_errorProvider,
	sys.getFunc(
	Server.LOG_ERROR_FV,
	function()
	{
		_logErrorFunc.apply( _logErrorFunc, arguments );
	}),
	[ _overridingFailureProvider ]
);

_server.start();

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

var _resetTests =
sys.getFunc(
new FuncVer(),
function()
{
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
	[ "func", "arr", "str/undef", "str/undef" ], "obj"
),
function(
	testFunc,
	callStack,
	providers,
	sendStr,
	recStr
)
{
	var returnVar =
	Testing.getTests(
		
		"topic",
		function()
		{
			_resetTests();
			
			testFunc();
			
			var server = new Server(
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
				})
			);
			
			server.start(
				sys.getFunc(
				new FuncVer(),
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
						this.callback
					);
				})
			);
		},
		
		"turns out OK",
		sys.getFunc(
		new FuncVer()
			.addArgs( [ Error ] )
			.addArgs( [
				"null/undef", FuncVer.NON_NEG_INT, [ Buffer, "undef" ]
			]),
		function( err, statusCode, resBuf )
		{
			Testing.errorCheckArgs( arguments );
			
			var res = resBuf.toString();
			
			try {
			
			assert(
				res === recStr, "Didnt receive expected response data"
			);
			
			assert(
				Testing.areEqual( _callStack, callStack ),
				"Server funcs havent been called in the expected order"
			);
			
			}
			finally
			{
				server.close();
			}
		})
	);
	
	return returnVar;
});

var suite = vows.describe( "server" );
suite.options.error = false;

// _topReqProvider provides
suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, prepare, handOver, provide",
	_testRequest(
		function()
		{
			_topReqProvider.prepare = _prepare;
			
			_topReqProvider.handOver = _handOver;
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

suite.addBatch( Testing.getTests(
	
	"topReqProvider validateWithFailure",
	_testRequest(
		function()
		{
			_topReqProvider.validate = _validateWithFailure;
		},
		[
			"topReqProvider.validateWithFailure",
			"logFailure",
			"failureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validateWithFailureAndProvider",
	_testRequest(
		function()
		{
			_topReqProvider.validate = _validateWithFailureAndProvider;
		},
		[
			"topReqProvider.validateWithFailureAndProvider",
			"logFailure",
			"overridingFailureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA
	)
	
));

suite.export( module );
