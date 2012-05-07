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

var _logFailureFunc = undefined;
var _logErrorFunc = undefined;

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

var TestProvider = require("./testprovider").TestProvider;

var _failureProvider = new TestProvider( "failureProvider" );

var _errorProvider = new TestProvider( "errorProvider" );

var _topReqProvider = new TestProvider(
	"topReqProvider", _failureProvider, _errorProvider
);

var _overridingFailureProvider =
	new TestProvider( "overridingFailureProvider" )
;

var _USED_PROVIDERS = [
	_failureProvider,
	_errorProvider,
	_topReqProvider,
	_overridingFailureProvider
];

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

var _callStack = undefined;

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

var _request =
sys.getFunc(
new FuncVer()
	.addArgs(  [ "str", "func" ] )
	.addArgs( [
		"str",
		{
			types:"obj/undef",
			props:
			{
				method:"str/undef"
			},
			extraProps:false
		}
	] ),
function( data, opts, cb )
{
	if( sys.hasType( opts, "func" ) === true )
	{
		cb = opts;
		opts = undefined;
	}
	
	opts = opts !== undefined ? opts : {};
	
	var method = opts.method !== undefined ? opts.method : "GET";
	

});

var _resetTests =
sys.getFunc(
new FuncVer(),
function()
{
	for( var item in _USED_PROVIDERS )
	{
		var provider = _USED_PROVIDERS[ item ];
		
		provider.validate = _validate;
		
		if( "prepare" in provider === true )
		{
			delete provider.prepare;
		}
		
		if( "handOver" in provider === true )
		{
			delete provider.handOver;
		}
		
		provider.provide = _provide;
	}
	
	_logFailureFunc = _logFailure;
	
	_logErrorFunc = _logError;
}
);

var _testRequest =
sys.getFunc(
new FuncVer(
	[ "func", "arr", "str/undef", "str/undef" ], "obj"
),
function( testFunc, callStack, sendStr, recStr )
{
	return Testing.getTests(
		
		"topic",
		function()
		{
			_callStack = [];
			
			_resetTests();
			
			testFunc();
			
			MoreHttp.request(
				"localhost",
				{
					method:"GET",
					port:1337,
					data:sendStr,
					headers:
					{
						"Content-Length": sendStr.length,
						"Content-Type": "application/x-www-form-urlencoded"
					}
				},
				this.callback
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
			
			try
			{
			
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
			
			_resetTests();
			
			}
			
		})
	);
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
