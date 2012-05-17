var vows = require("vows");

var timers = require("timers");
var crypto = require("crypto");

var RuntimeError = require("ourglobe").RuntimeError;
var TestRuntimeError =
	require("ourglobe/testing").TestRuntimeError
;
var ServerRuntimeError =
	require("ourglobe/webframework").ServerRuntimeError
;

var Testing = require("ourglobe/testing").Testing;

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

var _REQUEST_PROVIDER_S =
{
	types: [ "obj", "undef" ],
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
};

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
				
				serverReq.once(
					"end",
					sys.getFunc(
						new FuncVer(),
						function()
						{
							serverRes.write( reqData, "utf8" );
							
							serverRes.end();
							
							serverRes.once(
								"close",
								sys.getFunc(
									new FuncVer(),
									function()
									{
										cb();
									}
								)
							);
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
	[ RequestProvider.PROVIDER_NAME_S, _REQUEST_PROVIDER_S ],
	RequestProvider
),
function( name, opts )
{
	if( opts === undefined )
	{
		opts = {};
	}
	
	var newOpts = {};
	
	newOpts.validate = opts.validate;
	newOpts.prepare = opts.prepare;
	newOpts.handOver = opts.handOver;
	newOpts.provide = opts.provide;
	
	var ProviderClass = _getProviderClass( newOpts );
	
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

var _validateWithFailureAndOverridingProvider =
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

var _throwErr =
sys.getFunc(
new FuncVer().setExtraArgs( "any" ),
function()
{
	throw new TestRuntimeError(
		"This Error was thrown from _throwErr() in "+
		"server-test.js"
	);
});

var _giveErrToCb =
sys.getFunc(
new FuncVer().setExtraArgs( "any" ),
function()
{
	var nrArgs = arguments.length;
	
	if(
		nrArgs === 0 ||
		sys.hasType( arguments[ nrArgs-1 ], "func" ) === false
	)
	{
		throw new RuntimeError(
			"Last arg must be a func but is: "+
			Testing.getPrettyStr( arguments[ nrArgs-1 ] )
		);
	}
	
	var cb = arguments[ nrArgs-1 ];
	
	cb(
		new TestRuntimeError(
			"This Error was given to cb from _throwErr() in "+
			"server-test.js"
		)
	);
});

var _getBasicRequestTest =
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
				failureLog:
					{ types:"arr/undef", extraItems:"obj" }
				,
				errorLog:
					{ types:"arr/undef", extraItems:"obj" }
				,
				topReqProvider: [ RequestProvider, _REQUEST_PROVIDER_S ],
				failureProvider:
					[ RequestProvider, _REQUEST_PROVIDER_S ]
				,
				errorProvider: [ RequestProvider, _REQUEST_PROVIDER_S ],
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
	var port = 1337;
	
	if( opts === undefined )
	{
		opts = {};
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
		opts.topReqProvider instanceof RequestProvider === true ?
		opts.topReqProvider :
		_getProvider( "topReqProvider", opts.topReqProvider )
	;
	var failureProvider =
		opts.failureProvider instanceof RequestProvider === true ?
		opts.failureProvider :
		_getProvider(  "failureProvider", opts.failureProvider )
	;
	var errorProvider =
		opts.errorProvider instanceof RequestProvider === true ?
		opts.errorProvider :
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
		
		logObj.ourGlobeCode = err.ourGlobeCode;
		logObj.errorClass = err.constructor;
		logObj.err = {};
		logObj.err.stack = err.stack;
		
		_errorLog.push( logObj );
		
		_callStack.push( "logError" );
		
// Arg opts belongs to the containing function, and not this
// function. opts.logError is to be executed if its defined
		
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
		sys.getFunc(
			new FuncVer( [ Error ] ),
			function( err )
			{
				throw err;
			}
		),
		port
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
								port:port,
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
				Testing.errorCheckArgs( arguments );
				
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
				Testing.errorCheckArgs( arguments );
				
				var areEqual = true;
				
				if( _errorLog.length !== errorLog.length )
				{
					areEqual = false;
				}
				else
				{
					for(
						var item = 0;
						item < _errorLog.length;
						item++
					)
					{
						var currEntry = _errorLog[ item ];
						var errClass = currEntry.errorClass;
						var ourGlobeCode = currEntry.ourGlobeCode;
						
						var expectedEntry = errorLog[ item ];
						
						if(
							(
								(
									errClass === expectedEntry.errorClass ||
									(
										errClass === TestRuntimeError &&
										expectedEntry.errorClass === undefined
									)
								) &&
								ourGlobeCode === expectedEntry.ourGlobeCode
							) === false
						)
						{
							areEqual = false;
							break;
						}
						else
						{
							currEntry.errorClass = expectedEntry.errorClass;
							if( "errorClass" in expectedEntry === false )
							{
								delete currEntry.errorClass;
							}
							
							currEntry.ourGlobeCode =
								expectedEntry.ourGlobeCode
							;
							
							if( "ourGlobeCode" in expectedEntry === false )
							{
								delete currEntry.ourGlobeCode;
							}
							
							delete currEntry.err;
						}
					}
					
					if( areEqual === true )
					{
						areEqual = Testing.areEqual( _errorLog, errorLog );
					}
				}
				
				if( areEqual === false )
				{
					throw new RuntimeError(
						"The errorLog isnt as expected. Current and "+
						"expected errorLogs are: "+
						Testing.getPrettyStr( {
							current:_errorLog, expected:errorLog
						})
					);
				}
			}
		),
			
		"yields expected validationFailureLog",
		sys.getFunc(
			MoreHttp.REQUEST_CB_FV,
			function( err, statusCode, resBuf )
			{
				Testing.errorCheckArgs( arguments );
				
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

var _getRequestTest =
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
				nrHandovers: [ FuncVer.NON_NEG_INT, "undef" ],
				failureLog:
					{ types:"arr/undef", extraItems:"obj" }
				,
				errorLog:
					{ types:"arr/undef", extraItems:"obj" }
				,
				topReqProvider: _REQUEST_PROVIDER_S,
				failureProvider: _REQUEST_PROVIDER_S,
				errorProvider: _REQUEST_PROVIDER_S,
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
	
	if( opts.nrHandovers === undefined )
	{
		opts.nrHandovers = 2;
	}
	
	var nrHandovers = opts.nrHandovers;
	delete opts.nrHandovers;
	
	if( nrHandovers === 0 )
	{
		var returnVar =
			_getBasicRequestTest( callStack, sendStr, recStr, opts )
		;
		
		return returnVar;
	}
	
		var topReqProvider =
			_getProvider( "topReqProvider", opts.topReqProvider )
		;
	
	var testObj = {};
	var currObj = testObj;
	
	for(
		var currNrHandovers = 0;
		currNrHandovers <= nrHandovers;
		currNrHandovers++
	)
	{
		var topReqProviderToUse = topReqProvider;
		var callStackToUse = callStack.slice();
		
		for( var i = 0; i < currNrHandovers; i++ )
		{
			
// The handoverProvider must return the next RequestProvider in
// handOver(), this requires a scope where the variable pointing
// to the RequestProvider doesnt change. The handoverProvider is
// therefore produced within an inner function that is called per
// loop of this for-stmt
			
			var produceHandover =
			sys.getFunc(
				new FuncVer(),
				function()
				{
					var handoverNr = currNrHandovers - i - 1;
					
// The variable that holds the next RequestProvider (to be handed
// handed over) and doesnt change is handoverProvider
					
					var handoverProvider = topReqProviderToUse;
					
					var providerName = "handoverProvider"+handoverNr;
					
					topReqProviderToUse =
					_getProvider(
						providerName,
						{
							prepare: true,
							handOver:
							sys.getFunc(
								RequestProvider.HAND_OVER_FV,
								function( request )
								{
									return handoverProvider;
								}
							)
						}
					);
					
					var beforeCurrStack =
					[
						providerName+".validate",
						providerName+".prepare",
						providerName+".handOver",
					];
					
					callStackToUse =
						beforeCurrStack.concat( callStackToUse )
					;
				}
			);
			
			produceHandover();
		}
		
		opts.topReqProvider = topReqProviderToUse;
		
// The tests must be executed sequentially (due to global vars
// that are used). The test objs are therefore baked into one
// another
		
		var testName =
			"- testing with "+currNrHandovers+" handovers"
		;
		
		currObj[ testName ] =
			_getBasicRequestTest(
				callStackToUse,
				sendStr,
				recStr,
				opts
			)
		;
		
		currObj = currObj[ testName ];
	}
	
	return testObj;
});

var _localFailureProvider =
	_getProvider( "localFailureProvider" )
;

var _overridingFailureProvider =
	_getProvider( "overridingFailureProvider" )
;

var _localErrorProvider = _getProvider( "localErrorProvider" );

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

var _testOrdinaryRequests =
function()
{

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, provide",
	_getRequestTest(
		[ "topReqProvider.validate", "topReqProvider.provide" ],
		_REQ_DATA,
		_REQ_DATA
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate, prepare, handOver, provide",
	_getRequestTest(
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

}

var _testFailingValidation =
function()
{

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with failure",
	_getRequestTest(
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
	
	"topReqProvider validate with failure and local "+
	"failureProvider",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logFailure",
			"localFailureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure,
				failureProvider: _localFailureProvider
			},
			failureLog:
			[
				{
					currProviderName: "topReqProvider",
					failureProviderName: "localFailureProvider",
					failureCode: "ValidationFailed"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with failure and overriding "+
	"failureProvider",
	_getRequestTest(
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
				validate: _validateWithFailureAndOverridingProvider
			},
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

suite.addBatch( Testing.getTests(
	
	"topReqProvider has local failureProvider, validate with "+
	"failure and overriding failureProvider",
	_getRequestTest(
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
				validate: _validateWithFailureAndOverridingProvider,
				failureProvider: _localFailureProvider
			},
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

}

var _testBasicErrors =
function()
{

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with error",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _throwErr
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidation"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with error at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _giveErrToCb
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationCb"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider prepare with error",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.prepare",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				prepare: _throwErr
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtPreparation"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider prepare with error at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.prepare",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				prepare: _giveErrToCb
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtPreparationCb"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider handOver with error",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.handOver",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				handOver: _throwErr
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtHandover"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider provide with error",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.provide",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				provide: _throwErr
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtProvision"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider provide with error at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.provide",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				provide: _giveErrToCb
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtProvisionCb"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider with localErrorProvider, "+
	"provide with error at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.provide",
			"logError",
			"localErrorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				provide: _giveErrToCb,
				errorProvider: _localErrorProvider
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtProvisionCb"
				}
			]
		}
	)
	
));

}

var _testErrorsAtValidationFailureProvision =
function()
{

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with failure, "+
	"failureProvider provide with error",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logFailure",
			"failureProvider.provide",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure
			},
			failureProvider:
			{
				provide: _throwErr
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationFailureProvision",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			],
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
	
	"topReqProvider validate with failure, "+
	"failureProvider provide with error at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logFailure",
			"failureProvider.provide",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure
			},
			failureProvider:
			{
				provide: _giveErrToCb
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationFailureProvisionCb",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			],
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

suite.addBatch( Testing.getVar(
function() {
	
	var localFailureProvider =
		_getProvider(
			"localFailureProvider",
			{
				provide: _giveErrToCb
			}
		)
	;
	
	var returnVar =
	Testing.getTests(
		
		"topReqProvider validate with failure and local "+
		"failureProvider, "+
		"localFailureProvider provide with error at cb",
		_getRequestTest(
			[
				"topReqProvider.validate",
				"logFailure",
				"localFailureProvider.provide",
				"logError",
				"errorProvider.provide"
			],
			_REQ_DATA,
			_REQ_DATA,
			{
				topReqProvider:
				{
					validate: _validateWithFailure,
					failureProvider: localFailureProvider
				},
				errorLog:
				[
					{
						currProviderName: "topReqProvider",
						errorCode: "ErrorAtValidationFailureProvisionCb",
						failureProviderName: "localFailureProvider",
						failureCode: "ValidationFailed"
					}
				],
				failureLog:
				[
					{
						currProviderName: "topReqProvider",
						failureProviderName: "localFailureProvider",
						failureCode: "ValidationFailed"
					}
				]
			}
		)
	);
	
	return returnVar;
}));

suite.addBatch( Testing.getVar(
function()
{
	
	var overridingFailureProvider =
		_getProvider(
			"overridingFailureProvider",
			{
				provide: _giveErrToCb
			}
		)
	;
	
	var returnVar =
	Testing.getTests(
		
		"topReqProvider validate with failure and overriding "+
		"failureProvider, "+
		"overridingFailureProvider provide with error at cb",
		_getRequestTest(
			[
				"topReqProvider.validate",
				"logFailure",
				"overridingFailureProvider.provide",
				"logError",
				"errorProvider.provide"
			],
			_REQ_DATA,
			_REQ_DATA,
			{
				topReqProvider:
				{
					validate:
					sys.getFunc(
						RequestProvider.VALIDATE_FV,
						function( request, cb )
						{
							cb(
								undefined,
								false,
								"ValidationFailed",
								overridingFailureProvider
							);
						}
					),
				},
				errorLog:
				[
					{
						currProviderName: "topReqProvider",
						errorCode: "ErrorAtValidationFailureProvisionCb",
						failureProviderName: "overridingFailureProvider",
						failureCode: "ValidationFailed"
					}
				],
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
	);
	
	return returnVar;
}));

}

var _testErrorsAtErrorProvision =
function()
{

suite.addBatch( Testing.getTests(

"topReqProvider prepare with err, "+
"errorProvider provide with err",
_getRequestTest(
	[
		"topReqProvider.validate",
		"topReqProvider.prepare",
		"logError",
		"errorProvider.provide",
		"logError"
	],
	_REQ_DATA,
	undefined,
	{
		topReqProvider:
		{
			prepare: _throwErr
		},
		errorProvider:
		{
			provide: _throwErr
		},
		errorLog:
		[
			{
				currProviderName: "topReqProvider",
				errorCode: "ErrorAtPreparation"
			},
			{
				currProviderName: "topReqProvider",
				errorCode: "ErrorAtErrorProvision"
			}
		]
	}
)

));

suite.addBatch( Testing.getVar(
function()
{
	var localErrorProvider =
	_getProvider(
		"localErrorProvider",
		{
			provide: _throwErr
		}
	);
	
	var returnVar =
	Testing.getTests(
	
	"topReqProvider with localErrProvider, "+
	"prepare with err at cb, "+
	"localErrorProvider provide with err at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"topReqProvider.prepare",
			"logError",
			"localErrorProvider.provide",
			"logError"
		],
		_REQ_DATA,
		undefined,
		{
			topReqProvider:
			{
				prepare: _throwErr,
				errorProvider: localErrorProvider
			},
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtPreparation"
				},
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtErrorProvision"
				}
			]
		}
	));
	
	return returnVar;
}));

}

var _testErrorsAtValidationFailureLogging =
function()
{

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with failure, "+
	"logFailure with error, "+
	"failureProvider provide",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logFailure",
			"logError",
			"failureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure
			},
			logFailure: _throwErr,
			failureLog:
			[
				{
					currProviderName: "topReqProvider",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			],
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationFailureLogging"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with failure, "+
	"logFailure with error at cb, "+
	"failureProvider provide",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logFailure",
			"logError",
			"failureProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure
			},
			logFailure: _giveErrToCb,
			failureLog:
			[
				{
					currProviderName: "topReqProvider",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			],
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationFailureLoggingCb"
				}
			]
		}
	)
	
));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with failure, "+
	"logFailure with error at cb, "+
	"failureProvider provide with error at cb",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logFailure",
			"logError",
			"failureProvider.provide",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _validateWithFailure
			},
			failureProvider:
			{
				provide: _giveErrToCb
			},
			logFailure: _giveErrToCb,
			failureLog:
			[
				{
					currProviderName: "topReqProvider",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			],
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationFailureLoggingCb"
				},
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidationFailureProvisionCb",
					failureProviderName: "failureProvider",
					failureCode: "ValidationFailed"
				}
			]
		}
	)
	
));

}

var _testErrorsAtErrorLogging =
function()
{

suite.addBatch( Testing.getVar(
function()
{
	
	var overridingFailureProvider =
		_getProvider(
			"overridingFailureProvider",
			{
				provide: _giveErrToCb
			}
		)
	;
	
	var returnVar =
	Testing.getTests(
		
		"topReqProvider validate with failure and overriding "+
		"failureProvider, "+
		"overridingFailureProvider provide with error at cb, "+
		"logError with error at cb, "+
		"errorProvider provide",
		_getRequestTest(
			[
				"topReqProvider.validate",
				"logFailure",
				"logError",
				"overridingFailureProvider.provide",
				"logError",
				"errorProvider.provide"
			],
			_REQ_DATA,
			_REQ_DATA,
			{
				topReqProvider:
				{
					validate:
					sys.getFunc(
						RequestProvider.VALIDATE_FV,
						function( request, cb )
						{
							cb(
								undefined,
								false,
								"ValidationFailed",
								overridingFailureProvider
							);
						}
					),
				},
				logFailure: _giveErrToCb,
				errorLog:
				[
					{
						currProviderName: "topReqProvider",
						errorCode: "ErrorAtValidationFailureLoggingCb"
					},
					{
						currProviderName: "topReqProvider",
						errorCode: "ErrorAtValidationFailureProvisionCb",
						failureProviderName: "overridingFailureProvider",
						failureCode: "ValidationFailed"
					}
				],
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
	);
	
	return returnVar;
}));

suite.addBatch( Testing.getTests(
	
	"topReqProvider validate with err, "+
	"logError with err, "+
	"errorProvider provide",
	_getRequestTest(
		[
			"topReqProvider.validate",
			"logError",
			"errorProvider.provide"
		],
		_REQ_DATA,
		_REQ_DATA,
		{
			topReqProvider:
			{
				validate: _throwErr
			},
			logError: _throwErr,
			errorLog:
			[
				{
					currProviderName: "topReqProvider",
					errorCode: "ErrorAtValidation"
				}
			]
		}
	)
	
));

}

var _testEndingOfServerResponseAndErrors =
function()
{

suite.addBatch( Testing.getTests(

"topReqProvider provide with no error but "+
"doesnt end ServerResponse",
_getRequestTest(
	[
		"topReqProvider.validate",
		"topReqProvider.provide",
		"logError",
		"errorProvider.provide"
	],
	_REQ_DATA,
	_REQ_DATA,
	{
		topReqProvider:
		{
			provide:
			sys.getFunc(
				RequestProvider.PROVIDE_FV,
				function( request, cb )
				{
					cb();
				}
			)
		},
		errorLog:
		[
			{
				currProviderName: "topReqProvider",
				errorCode: "ErrorAtProvisionCb",
				errorClass: ServerRuntimeError,
				ourGlobeCode: "ServerResponseObjIsStillWritable"
			}
		]
	}
)

));

suite.addBatch( Testing.getTests(

"topReqProvider provide with err but ends ServerResponse, "+
"NO errorProvider",
_getRequestTest(
	[
		"topReqProvider.validate",
		"topReqProvider.provide"
	],
	_REQ_DATA,
	undefined,
	{
		topReqProvider:
		{
			provide:
			sys.getFunc(
				RequestProvider.PROVIDE_FV,
				function( request, cb )
				{
					var serverRes = request.getReqObj().serverRes;
					
					serverRes.end();
					
					serverRes.once(
						"close",
						sys.getFunc(
							new FuncVer(),
							function()
							{
								cb(
									new TestRuntimeError(
										"This err was given to cb of provide() in "+
										"server-test.js"
									)
								);
							}
						)
					);
				}
			)
		}
	}
)

));

}

_testOrdinaryRequests();
_testFailingValidation();
_testBasicErrors();
_testErrorsAtValidationFailureProvision();
_testErrorsAtErrorProvision();
_testErrorsAtValidationFailureLogging();
_testErrorsAtErrorLogging();
_testEndingOfServerResponseAndErrors();

suite.export( module );
