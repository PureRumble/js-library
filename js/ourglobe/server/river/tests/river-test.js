ourGlobe.require(
[
	"timers",
	"crypto",
	"ourglobe/dual/testing",
	"ourglobe/server/morehttp",
	"ourglobe/server/river"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;
var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var Class = ourGlobe.Class;
var getS = ourGlobe.getS;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;

var timers = mods.get( "timers" );
var crypto = mods.get( "crypto" );

var TestRuntimeError = mods.get( "testing" ).TestRuntimeError;
var TestingError = mods.get( "testing" ).TestingError;
var RiverRuntimeError = mods.get( "river" ).RiverRuntimeError;
var StreamError = mods.get( "river" ).StreamError;

var MoreHttp = mods.get( "morehttp" ).MoreHttp;

var River = mods.get( "river" ).River;
var Stream = mods.get( "river" ).Stream;
var Drop = mods.get( "river" ).Drop;

var Test = mods.get( "testing" ).Test;
var Suite = mods.get( "testing" ).Suite;

var RiverTest =
Class.create(
{
	name: "RiverTest"
});

Class.addStatic(
RiverTest,
{
	EXPECTED_PARAMS:
		{
			testParamOne: undefined,
			testParamTwo: "dingo",
			testParamThree:{ dango: "dongo" },
			testParamFour:[ "dinga" ]
		}
	,
	EXPECTED_PARAMS_UNDEF:
		{
			testParamOne: undefined,
			testParamTwo: undefined,
			testParamThree:undefined,
			testParamFour:undefined
		}
	,
	REQ_PARAM: "serverRequest",
	RES_PARAM: "serverResponse",
	RIVER_PORT: 1337,
	GET_STREAM_OPTS_S:
		{
			types: "obj/undef",
			extraProps: false,
			props:
			{
				stack: "arr/undef",
				params: "arr/undef",
				branches: "arr/undef",
				stackBeginRiverFlow: "bool/undef",
				beginRiverFlow: "func/bool/undef",
				begin: "func/bool/undef",
				validate: "func/bool/undef",
				prepare: "func/bool/undef",
				branch: "func/bool/undef",
				serve: "func/bool/undef",
				serveFailure: "func/bool/undef",
				serveErr: "func/bool/undef",
				finish: "func/bool/undef"
			}
		}
	,
	GET_RIVER_TEST_OPTS_S:
	{
		props:
		{
			stack: "arr/undef",
			nrBranchings:{ types:"int/undef", gte: 0 },
			reqStr: "str/undef",
			resStr: "str/undef",
			vars: "func/undef",
			topicStream: "func",
			vows: "arr/undef"
		},
		extraProps: false
	}
});

Class.add(
RiverTest,
{

getStreamClass:
[
"static",
getA( [ RiverTest.GET_STREAM_OPTS_S, "undef" ] ),
getR( "func" ),
function( opts )
{
	if( opts === undefined )
	{
		opts = {};
	}
	
	var stack = opts.stack;
	var streamParams = opts.params;
	var branchingStreams = opts.branches;
	var stackBeginRiverFlow = opts.stackBeginRiverFlow;
	var beginRiverFlow = opts.beginRiverFlow;
	var begin = opts.begin;
	var validate = opts.validate;
	var prepare = opts.prepare;
	var branch = opts.branch;
	var serve = opts.serve;
	var serveFailure = opts.serveFailure;
	var serveErr = opts.serveErr;
	var finish = opts.finish;
	
	if( stack === undefined )
	{
		stack = [];
	}
	
	if( stackBeginRiverFlow === undefined )
	{
		stackBeginRiverFlow = false;
	}
	
	if( beginRiverFlow === undefined || beginRiverFlow === true )
	{
		beginRiverFlow =
		function( drop, opts, cb )
		{
			cb();
		};
	}
	
	if( begin === true )
	{
		begin =
		function( drop, cb )
		{
			cb();
		};
	}
	
	if( validate === undefined || validate === true )
	{
		validate =
		function( drop, cb )
		{
			cb();
		};
	}
	
	if( prepare === true )
	{
		prepare =
		function( drop, cb )
		{
			cb();
		};
	}
	
	if( branch === true )
	{
		branch =
		function( drop, cb )
		{
			cb();
		};
	}
	
	if( serve === true )
	{
		serve = RiverTest.endDrop();
	}
	
	if( serveFailure === undefined || serveFailure === true )
	{
		serveFailure = RiverTest.endDrop();
	}
	
	if( serveErr === undefined || serveErr === true )
	{
		serveErr = RiverTest.endDrop();
	}
	
	if( finish === true )
	{
		finish =
		function( drop, cb )
		{
			cb();
		};
	}
	
	var TestStream =
	Class.create(
	{
	name: "TestStream",
	extends: Stream,
	constr:
	[
	getA( "str" ),
	function( streamName )
	{
		this.ourGlobeCallSuper(
			undefined, streamName, branchingStreams, streamParams
		);
	}]
	});
	
	var classAddObj = {};
	
	if( hasT( beginRiverFlow, "func" ) === true )
	{
		classAddObj.beginRiverFlow =
		[
			Stream.BEGIN_RIVER_FLOW_V,
			function()
			{
				if( stackBeginRiverFlow === true )
				{
					stack.push( this.getStreamName() + ".beginRiverFlow" );
				}
				
				beginRiverFlow.apply( this, arguments );
			}
		];
	}
	
	if( hasT( begin, "func" ) === true )
	{
		classAddObj.begin =
		[
			Stream.BEGIN_V,
			function()
			{
				stack.push( this.getStreamName() + ".begin" );
				
				begin.apply( this, arguments );
			}
		];
	}
	
	if( hasT( validate, "func" ) === true )
	{
		classAddObj.validate =
		[
			Stream.VALIDATE_V,
			function()
			{
				stack.push( this.getStreamName() + ".validate" );
				
				validate.apply( this, arguments );
			}
		];
	}
	
	if( hasT( prepare, "func" ) === true )
	{
		classAddObj.prepare =
		[
			Stream.PREPARE_V,
			function()
			{
				stack.push( this.getStreamName() + ".prepare" );
				
				prepare.apply( this, arguments );
			}
		];
	}
	
	if( hasT( branch, "func" ) === true )
	{
		classAddObj.branch =
		[
			Stream.BRANCH_V,
			function()
			{
				stack.push( this.getStreamName() + ".branch" );
				
				branch.apply( this, arguments );
			}
		];
	}
	
	if( hasT( serve, "func" ) === true )
	{
		classAddObj.serve =
		[
			Stream.SERVE_V,
			function()
			{
				stack.push( this.getStreamName() + ".serve" );
				
				serve.apply( this, arguments );
			}
		];
	}
	
	if( hasT( serveFailure, "func" ) === true )
	{
		classAddObj.serveFailure =
		[
			Stream.SERVE_FAILURE_V,
			function( drop, cb )
			{
				stack.push( this.getStreamName() + ".serveFailure" );
				stack.push(
					{
						failureCode: drop.failureCode
					}
				);
				
				serveFailure.apply( this, arguments );
			}
		];
	}
	
	if( hasT( serveErr, "func" ) === true )
	{
		classAddObj.serveErr =
		[
			Stream.SERVE_ERR_V,
			function( drop, opts, cb )
			{
				var riverErr = opts.err;
				
				var errObj =
					{
						errClass: Class.getClass( riverErr ),
						errCode: riverErr.ourGlobeCode
					}
				;
				
				var err = riverErr.getErr();
				
				if( err !== undefined )
				{
					errObj.origErrClass = Class.getClass( err );
					errObj.origErrCode = err.ourGlobeCode;
				}
				
				stack.push( this.getStreamName() + ".serveErr" );
				stack.push( errObj );
				
// temporary
				if( err !== undefined )
				{
					console.log( err.stack );
				}
				else
				{
					console.log( riverErr.stack );
				}
				
				serveErr.apply( this, arguments );
			}
		];
	}
	
	if( hasT( finish, "func" ) === true )
	{
		classAddObj.finish =
		[
			Stream.FINISH_V,
			function()
			{
				stack.push( this.getStreamName() + ".finish" );
				
				finish.apply( this, arguments );
			}
		];
	}
	
	if( Object.keys( classAddObj ).length !== 0 )
	{
		Class.add( TestStream, classAddObj );
	}
	
	return TestStream;
}],

getStream:
[
"static",
getA( "str", [ RiverTest.GET_STREAM_OPTS_S, "undef" ] ),
getR( Stream ),
function( streamName, opts )
{
	var StreamClass = RiverTest.getStreamClass( opts );
	
	return new StreamClass( streamName );
}],

failValidation:
[
"static",
getA( "str/undef" ),
getR( "func" ),
function( failureCode )
{
	if( failureCode === undefined )
	{
		failureCode = "TestValidationFailed";
	}
	
	return(
		function( drop, cb )
		{
			cb( undefined, failureCode );
		}
	);
}],

throwErr:
[
"static",
getA( [ Error, "undef" ] ),
getR( "func" ),
function( err )
{
	if( err === undefined )
	{
		err =
			new TestingError(
				"This err has been created for testing module river",
				{ TestingError: "TestingError" },
				"TestingError"
			)
		;
	}
	
	return(
		function()
		{
			throw err;
		}
	);
}],

giveCbErr:
[
"static",
getA( [ Error, "undef" ] ),
getR( "func" ),
function( err )
{
	if( err === undefined )
	{
		err =
			new TestingError(
				"This err has been created for testing module river",
				{ TestingError: TestingError },
				"TestingError"
			)
		;
	}
	
	return(
		function()
		{
			var nrArgs = arguments.length;
			
			if(
				nrArgs === 0 ||
				hasT( arguments[ nrArgs-1 ], "func" ) === false
			)
			{
				throw new TestRuntimeError( "Last arg must be a func" );
			}
			
			var cb = arguments[ nrArgs-1 ];
			
			cb( err );
		}
	);
}],

callCb:
[
"static",
getA.ANY_ARGS,
getR( "func" ),
function()
{
	var args = arguments;
	
	return(
		function()
		{
			var nrArgs = arguments.length;
			
			if(
				nrArgs === 0 ||
				hasT( arguments[ nrArgs-1 ], "func" ) === false
			)
			{
				throw new TestRuntimeError( "Last arg must be a func" );
			}
			
			var cb = arguments[ nrArgs-1 ];
			
			cb.apply( {}, args );
		}
	);
}],

branchToStream:
[
"static",
getA( "str" ),
getR( "func" ),
function( branchName )
{
	return(
		function( drop, cb )
		{
			cb( undefined, branchName );
		}
	);
}],

endDrop:
[
"static",
getR( "func" ),
function()
{
	var func =
	function()
	{
		var args = arguments;
		
		if(
			args.length === 0 || args[ 0 ] instanceof Drop === false
		)
		{
			throw new TestRuntimeError( "First arg must be a Drop" );
		}
		
		if(
			args.length === 0 ||
			hasT( args[ args.length-1 ], "func" ) === false
		)
		{
			throw new TestRuntimeError( "Last arg must be a func" );
		}
		
		var drop = args[ 0 ];
		var req = drop.riverDrop.request;
		var res = drop.riverDrop.response;
		var cb = args[ args.length-1 ];
		
		req.setEncoding( "utf8" );
		
		var reqData = "";
		
		req.on(
			"data",
			getF(
			getA( "str" ),
			function( chunk )
			{
				reqData += chunk;
			})
		);
		
		req.once(
			"end",
			getF(
			function()
			{
				res.write( reqData, "utf8" );
				
				res.once( "finish", cb );
				res.end();
			})
		);
	};
	
	return func;
}],

getSimpleRiverTest:
[
"static",
getA( RiverTest.GET_RIVER_TEST_OPTS_S, { gte: 0 } ),
getR( "obj" ),
function( opts, nrBranchings )
{
	var expectedCallStack = opts.stack;
	var getLocal = opts.vars;
	var vows = opts.vows;
	var reqStr = opts.reqStr;
	var resStr = opts.resStr;
	
	if( reqStr === undefined )
	{
		reqStr = "";
	}
	
	if( getLocal === undefined )
	{
		getLocal =
		function()
		{
			return {};
		};
	}
	
	if( vows === undefined )
	{
		vows = [];
	}
	
	vows = vows.slice();
	
	var expectedAutoCallStack = [];
	var actualAutoCallStack = [];
	var response = undefined;
	var river = undefined;
	
	var vars = getLocal();
	vars[ "getRiverTest.stack" ] = [];
	vars[ "getRiverTest.nrBranchings" ] = nrBranchings;
	
	var getRiverTestStreamName = "getRiverTest_BranchingStream";
	
	if( nrBranchings > 0 )
	{
		expectedAutoCallStack.push(
			getRiverTestStreamName+"0.beginRiverFlow"
		);
	}
	
	for(
		var currStreamNr = 0;
		currStreamNr < nrBranchings;
		currStreamNr++
	)
	{
		var streamName = getRiverTestStreamName+currStreamNr;
		
		expectedAutoCallStack.push( streamName+".begin" );
		expectedAutoCallStack.push( streamName+".validate" );
		expectedAutoCallStack.push( streamName+".branch" );
	}
	
	for(
		var currStreamNr = nrBranchings-1;
		currStreamNr >= 0;
		currStreamNr--
	)
	{
		var streamName = getRiverTestStreamName+currStreamNr;
		
		expectedAutoCallStack.push(
			streamName+".finish"
		);
	}
	
	vows.push(
		"(getRiverTest vow) The call stack for the "+
		"first branching Streams that are automatically added by "+
		"getRiverTest() is as expected"
	);
	vows.push(
		function( err, statusCode, res )
		{
			Test.assert(
				Test.areEqual(
					expectedAutoCallStack, actualAutoCallStack
				)
				=== true,
				"The call stack for the first branching Streams (that "+
				"were added automatically by getRiverTest()) isnt as "+
				"expected",
				{
					expectedCallStack: expectedAutoCallStack,
					actualCallStack: actualAutoCallStack
				}
			);
		}
	);
	
	if( resStr !== undefined )
	{
		vows.push(
			"(getRiverTest vow) The response str from the server is "+
			"as expected"
		);
		vows.push(
			function()
			{
				Test.assert( response === resStr );
			}
		);
	}
	
	if( expectedCallStack !== undefined )
	{
		vows.push(
			"(getRiverTest vow) The call stack for the "+
			"Streams given to getRiverTest() is as expected"
		);
		vows.push(
			function()
			{
				Test.assert(
					Test.areEqual(
						expectedCallStack,
						this.getV( "getRiverTest.stack" )
					)
					=== true,
					"The Streams given to getRiverTest() didnt yield the "+
					"expected call stack",
					{
						expectedCallStack: expectedCallStack,
						actualCallStack: this.getV( "getRiverTest.stack" )
					}
				);
			}
		);
	}
	
	var suiteObj =
	{
		vars: vars,
		argsVer:[ Stream ],
		vows: vows,
		topicCb:
		function()
		{
			var topicStream = opts.topicStream.call( this );
			
			if( topicStream instanceof Stream === false )
			{
				throw new TestRuntimeError(
					"The func topicStream provided to getRiverTest() "+
					"must return a Stream",
					{ returnedValue: topicStream }
				);
			}
			
			var currStream = topicStream;
			
			for(
				var currStreamNr = nrBranchings-1;
				currStreamNr >= 0;
				currStreamNr--
			)
			{
				var nextStream = currStream;
				
				currStream =
				RiverTest.getStream(
					getRiverTestStreamName+currStreamNr,
					{
						branches:[ nextStream ],
						stackBeginRiverFlow: true,
						begin: true,
						validate: true,
						branch:
							RiverTest.branchToStream(
								nextStream.getStreamName()
							),
						finish: true,
						stack: actualAutoCallStack
					}
				);
			}
			
			river = new River( currStream, RiverTest.RIVER_PORT );
			
			river.flow(
				getCb(
				this,
				River.FLOW_CB_V,
				function()
				{
					MoreHttp.request(
						"localhost",
						{
							method: "GET",
							port: RiverTest.RIVER_PORT,
							data: reqStr,
							headers:
							{
								"Content-Length": reqStr.length,
								"Content-Type":
									"application/x-www-form-urlencoded"
							}
						},
						getCb(
						this,
						MoreHttp.REQUEST_CB_V,
						function( err, statusCode, res )
						{
							if( err !== undefined )
							{
								this.callCb( err );
								
								return;
							}
							else
							{
								if( res === undefined )
								{
									response = "";
								}
								else
								{
									response = res.toString();
								}
								
								this.callCb( topicStream );
							}
						})
					)
				})
			);
		},
		afterCb:
		function()
		{
			if( river === undefined )
			{
				this.callCb();
				
				return;
			}
			
			river.freeze(
				getCb(
				this,
				River.FREEZE_CB_V,
				function()
				{
					this.callCb();
				})
			);
		}
	};
	
	return suiteObj;
}],

getRiverTest:
[
"static",
getA( RiverTest.GET_RIVER_TEST_OPTS_S ),
getA( "func" ),
getR( "obj" ),
function( opts )
{
	var nrBranchings = opts.nrBranchings;
	
	if( nrBranchings === undefined )
	{
		nrBranchings = 2;
	}
	
	var suites = [];
	
	for(
		var currNrBranchings = 0;
		currNrBranchings <= nrBranchings;
		currNrBranchings++
	)
	{
		var testObj =
			RiverTest.getSimpleRiverTest( opts, currNrBranchings )
		;
		
		suites.push(
			"The Stream is put after "+currNrBranchings+" "+
			"branching(s) Streams"
		);
		suites.push( testObj );
	}
	
	return { next: suites };
}],

getSuite:
[
getA(),
getR( Suite ),
function()
{

var suite =
	new Suite( "River", { sequential: true, cbTimeout: 1000 } )
;

suite.add(
"Stream with stone beginRiverFlow",
[

"Stream with stones beginRiverFlow, begin and serve",
RiverTest.getRiverTest(
{
	nrBranchings: 0,
	stack:
	[
		"FirstStream.beginRiverFlow",
		"FirstStream.begin",
		"FirstStream.validate",
		"FirstStream.serve"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				stackBeginRiverFlow: true,
				beginRiverFlow: true,
				begin: true,
				serve: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones beginRiverFlow and finish where "+
"beginRiverFlow throws an err",
RiverTest.getRiverTest(
{
	nrBranchings: 0,
	stack:
	[
		"FirstStream.beginRiverFlow",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtBeginRiverFlow",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				stackBeginRiverFlow: true,
				beginRiverFlow: RiverTest.throwErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones beginRiverFlow and finish where "+
"beginRiverFlow gives a cb err",
RiverTest.getRiverTest(
{
	nrBranchings: 0,
	stack:
	[
		"FirstStream.beginRiverFlow",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtBeginRiverFlowCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				stackBeginRiverFlow: true,
				beginRiverFlow: RiverTest.giveCbErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones beginRiverFlow and finish where "+
"beginRiverFlow provides invalid args for cb",
RiverTest.getRiverTest(
{
	nrBranchings: 0,
	stack:
	[
		"FirstStream.beginRiverFlow",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "InvalidArgsForBeginRiverFlowCb"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				params:[ "TestParamOne" ],
				stackBeginRiverFlow: true,
				beginRiverFlow:
				function( drop, opts, cb )
				{
					cb( { TestParamOne: "dingo" } );
				},
				finish: true
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone begin",
[

"Stream with stones begin, validate and serve",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.begin",
		"FirstStream.validate",
		"FirstStream.serve"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				begin: true,
				validate: true,
				serve: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones begin and finish where begin throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.begin",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtBegin",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish",
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				begin: RiverTest.throwErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones begin and finish where begin gives an err "+
"to the cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.begin",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtBeginCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish",
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				begin: RiverTest.giveCbErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones begin and finish where begin gives invalid "+
"args to the cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.begin",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "InvalidArgsForBeginCb"
		},
		"FirstStream.finish",
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				begin: RiverTest.callCb( false ),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone validate",
[

"Stream with stones validate, branch and serve",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.branch",
		"FirstStream.serve"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: true,
				branch: true,
				serve: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones validate, serveFailure and finish where "+
"validate states the Drop is invalid",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serveFailure",
		{ failureCode: "TestValidationFailed" },
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: RiverTest.failValidation(),
				serve: true,
				serveFailure: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones validate and serveErr where validate "+
"throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtValidate",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: RiverTest.throwErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones validate and serveErr where validate "+
"gives an err to cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtValidateCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: RiverTest.giveCbErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones validate and serveErr where validate "+
"gives invalid args to cb",
{
	next:
	[
	
	"validate calls cb with a bool",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidArgsForValidateCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					validate: RiverTest.callCb( undefined, true ),
					serve: true,
					serveErr: true,
					finish: true
				}
			);
			
			return firstStream;
		}
	}),
	
	"validate calls cb with an invalid failure code",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidArgsForValidateCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					validate: RiverTest.callCb( undefined, "failed-0" ),
					serve: true,
					serveErr: true,
					finish: true
				}
			);
			
			return firstStream;
		}
	})
	
	]
}

]);

suite.add(
"Stream with stone serveFailure",
[

"Stream with stones serveFailure and finish where "+
"serveFailure throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serveFailure",
		{ failureCode: "TestValidationFailed" },
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServeFailure",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: RiverTest.failValidation(),
				serve: true,
				serveFailure: RiverTest.throwErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serveFailure and finish where "+
"serveFailure gives an err to cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serveFailure",
		{ failureCode: "TestValidationFailed" },
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServeFailureCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: RiverTest.failValidation(),
				serve: true,
				serveFailure: RiverTest.giveCbErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serveFailure and finish where "+
"serveFailure gives invalid args to cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serveFailure",
		{ failureCode: "TestValidationFailed" },
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "InvalidArgsForServeFailureCb"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				validate: RiverTest.failValidation(),
				serve: true,
				serveFailure: RiverTest.callCb( null ),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone prepare",
[

"Stream with stones prepare, branch and serve",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.prepare",
		"FirstStream.branch",
		"FirstStream.serve"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				prepare: true,
				branch: true,
				serve: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones prepare, serveErr and finish where "+
"prepare throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.prepare",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtPrepare",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				prepare: RiverTest.throwErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones prepare, serveErr and finish where "+
"prepare gives a cb err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.prepare",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtPrepareCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				prepare: RiverTest.giveCbErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones prepare, serveErr and finish where "+
"prepare provides invalid args for cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.prepare",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "InvalidArgsForPrepareCb"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				params:[ "TestParamOne" ],
				prepare:
				function( drop, cb )
				{
// The Stream params must be the second arg given to cb
					cb( { TestParamOne: "dingo" } );
				},
				finish: true
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone branch",
[

"Stream with stones branch, serve and finish",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.branch",
		"FirstStream.serve",
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				branch: true,
				serve: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones branch, serveErr and finish where "+
"branch throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.branch",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtBranch",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				branch: RiverTest.throwErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones branch, serveErr and finish where "+
"branch gives a cb err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.branch",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtBranchCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				branch: RiverTest.giveCbErr(),
				serve: true,
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones branch, serveErr and finish where "+
"branch provides invalid args for cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.branch",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "InvalidArgsForBranchCb"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var lastStream =
		RiverTest.getStream(
			"LastStream", { stack: this.getV( "getRiverTest.stack" ) }
		);
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				branches:[ lastStream ],
				branch:
				function( drop, cb )
				{
// The Stream name to branch to must be the second arg
					cb( "LastStream" );
				},
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones branch, serveErr and finish where "+
"branch branches to a Stream that it hasnt declared as a branch",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.branch",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "BranchingToNonexistentStream"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var lastStream =
		RiverTest.getStream(
			"LastStream", { stack: this.getV( "getRiverTest.stack" ) }
		);
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				branches:[ lastStream ],
				branch:
				function( drop, cb )
				{
					cb( undefined, "SomeOtherStream" );
				},
				finish: true
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone serve",
[

"Stream with stones serve and finish",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serve, serveErr and finish where "+
"serve throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServe",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: RiverTest.throwErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones serve, serveErr and finish where "+
"serve gives a cb err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServeCb",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var topStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: RiverTest.giveCbErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return topStream;
	}
}),

"Stream with stones serve, serveErr and finish where "+
"serve provides invalid args for cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "InvalidArgsForServeCb"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve:
				function( drop, cb )
				{
					cb( true );
				},
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone serveErr",
[

"Stream with stones serve, serveErr and finish "+
"where serve throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServe",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: RiverTest.throwErr(),
				serveErr: true,
				finish: true
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serve, serveErr and finish "+
"where serve and serveErr throw an errs",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServe",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: RiverTest.throwErr(),
				serveErr: RiverTest.throwErr(),
				finish: RiverTest.endDrop()
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serve, serveErr and finish "+
"where serve throws an err and serveErr gives an err to its cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServe",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: RiverTest.throwErr(),
				serveErr: RiverTest.giveCbErr(),
				finish: RiverTest.endDrop()
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serve, serveErr and finish "+
"where serve throws an err and serveErr gives invalid args to "+
"its cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.serveErr",
		{
			errClass: StreamError,
			errCode: "ErrAtServe",
			origErrClass: TestingError,
			origErrCode: "TestingError"
		},
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: RiverTest.throwErr(),
				serveErr: RiverTest.callCb( undefined, true ),
				finish: RiverTest.endDrop()
			}
		);
		
		return firstStream;
	}
})

]);

suite.add(
"Stream with stone finish",
[

"Stream with stones serve and finish where finish throws an err",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: true,
				finish: RiverTest.throwErr()
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serve and finish where finish gives an err "+
"to its cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: true,
				finish: RiverTest.giveCbErr()
			}
		);
		
		return firstStream;
	}
}),

"Stream with stones serve and finish where finish gives "+
"invalid args to its cb",
RiverTest.getRiverTest(
{
	stack:
	[
		"FirstStream.validate",
		"FirstStream.serve",
		"FirstStream.finish"
	],
	topicStream:
	function()
	{
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				stack: this.getV( "getRiverTest.stack" ),
				serve: true,
				finish: RiverTest.callCb( undefined, true )
			}
		);
		
		return firstStream;
	}
}),

]);

suite.add(
"Stream that handles Stream params",
{

vars:
{
	getParamStream:
	getF(
		getA(
			"str",
			{
				types: "obj/undef",
				props:
				{
					stack: "arr/undef",
					params: "arr/undef",
					setPrepareParams: "obj/undef",
					setBeginRiverFlowParams: "obj/undef",
					getParams: "arr/undef",
					branch:[ Stream, "undef" ],
					failValidation: "bool/undef",
					failBranching: "bool/undef",
					paramsObj: "obj/undef",
					finish:
					{
						values:
						[
							"throwErr",
							"giveCbErr",
							"giveInvalidArgs",
							undefined
						]
					}
				},
				extraProps: false
			}
		),
		getR( Stream ),
		function( streamName, opts )
		{
			if( opts === undefined )
			{
				opts = {};
			}
			
			var setPrepareParams = opts.setPrepareParams;
			var setBeginRiverFlowParams = opts.setBeginRiverFlowParams;
			var getParams = opts.getParams;
			var branch = opts.branch;
			var failValidation = opts.failValidation;
			var failBranching = opts.failBranching;
			var paramsObj = opts.paramsObj;
			var params = opts.params;
			var stack = opts.stack;
			var finish = opts.finish;
			
			if(
				( getParams === undefined ) !==
					( paramsObj === undefined )
			)
			{
				throw new TestRuntimeError(
					"Props getParams and paramsObj of arg opts must "+
					"either both be undef or set"
				);
			}
			
			if( failValidation === undefined )
			{
				failValidation = false;
			}
			
			if( failBranching === undefined )
			{
				failBranching = false;
			}
			
			var branchName = undefined;
			
			if( branch !== undefined )
			{
				branchName = branch.getStreamName();
				branch = [ branch ];
			}
			
			var getStoneParams =
			getF(
				getA( "str", Drop ),
				function( stoneName, drop )
				{
					if( getParams === undefined )
					{
						return;
					}
					
					paramsObj[ stoneName ] = {};
					
					for( var item in getParams )
					{
						var param = getParams[ item ];
						
						paramsObj[ stoneName ][ param ] =
							drop.getParam( param )
						;
					}
				}
			);
			
			var paramStream =
			RiverTest.getStream(
				streamName,
				{
					stack: stack,
					params: params,
					branches: branch,
					beginRiverFlow:
					function( drop, opts, cb )
					{
						cb( undefined, setBeginRiverFlowParams );
					},
					begin:
					function( drop, cb )
					{
						getStoneParams( "begin", drop );
						
						cb();
					},
					validate:
					function( drop, cb )
					{
						getStoneParams( "validate", drop );
						
						if( failValidation === true )
						{
							cb( undefined, "TestValidationFailed" );
							
							return;
						}
						else
						{
							cb();
						}
					},
					prepare:
					function( drop, cb )
					{
						getStoneParams( "prepare", drop );
						
						cb( undefined, setPrepareParams );
					},
					branch:
					function( drop, cb )
					{
						getStoneParams( "branch", drop );
						
						if( failBranching === true )
						{
							throw new TestingError();
						}
						else
						{
							cb( undefined, branchName );
							
							return;
						}
					},
					serve:
					function( drop, cb )
					{
						getStoneParams( "serve", drop );
						
						var func = RiverTest.endDrop();
						
						func.call( this, drop, cb );
					},
					serveFailure:
					function( drop, cb )
					{
						getStoneParams( "serveFailure", drop );
						
						throw new TestingError();
					},
					serveErr:
					function( drop, opts, cb )
					{
						getStoneParams( "serveErr", drop );
						
						var func = RiverTest.endDrop();
						
						func.call( this, drop, cb );
					},
					finish:
					function( drop, cb )
					{
						getStoneParams( "finish", drop );
						
							if( finish === "throwErr" )
							{
								throw new TestingError(
									"This err is for testing local Stream vars",
									undefined,
									"TestingError"
								);
							}
							else if( finish === "giveCbErr" )
							{
								cb(
									new TestingError(
										"This err is for testing local Stream vars",
										undefined,
										"TestingError"
									)
								);
								
								return;
							}
							else if( finish === "giveInvalidArgs" )
							{
								cb( undefined, true );
								
								return;
							}
							else
							{
								cb();
								
								return;
							}
					}
				}
			);
			
			return paramStream;
		}
	)
},

next:
[

"Stream with Stream params and stone beginRiverFlow that sets "+
"some of those Stream params. The params are read later",
{
	next:
	[
	
	"The Stream doesnt branch and reads the Stream params itself",
	{
		vars:
		{
			PARAMS:
			[
				"testParamOne",
				"testParamTwo",
				"testParamThree",
				"testParamFour"
			],
			GET_PARAMS:
			[
				"testParamOne",
				"testParamTwo",
				"testParamThree",
				"testParamFour"
			],
			SET_PARAMS:
			{
				testParamTwo: "dingo",
				testParamThree:{ dango: "dongo" },
				testParamFour:[ "dinga" ]
			},
			EXP_PARAMS:
			{
				testParamOne: undefined,
				testParamTwo: "dingo",
				testParamThree:{ dango: "dongo" },
				testParamFour:[ "dinga" ]
			}
		},
		
		next:
		[
		
		"The Stream reads the Stream params in the stones "+
		"begin, validate, prepare, branch, serve and finish",
		RiverTest.getRiverTest(
		{
			nrBranchings: 0,
			vars:
			function()
			{
				return { paramsObj:{} };
			},
			topicStream:
			function()
			{
				var getParamStream = this.getV( "getParamStream" );
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "PARAMS" ),
							setBeginRiverFlowParams: this.getV( "SET_PARAMS" ),
							getParams: this.getV( "GET_PARAMS" ),
							paramsObj: this.getV( "paramsObj" ),
							branch: undefined,
							failValidation: false
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params",
				function()
				{
					var expectedParams =
						{
							begin: this.getV( "EXP_PARAMS" ),
							validate: this.getV( "EXP_PARAMS" ),
							prepare: this.getV( "EXP_PARAMS" ),
							branch: this.getV( "EXP_PARAMS" ),
							serve: this.getV( "EXP_PARAMS" ),
							finish: this.getV( "EXP_PARAMS" )
						}
					;
					
					var actualParams = this.getV( "paramsObj" );
					
					Test.assert(
						true ===
							Test.areEqual( actualParams, expectedParams ),
						"Stream params dont have expected values",
						{
							expectedParams: expectedParams,
							actualParams: actualParams
						}
					);
				}
			]
		}),
		
		"The Stream reads the Stream params in the stones "+
		"begin, validate, serveFailure, serveErr and finish",
		RiverTest.getRiverTest(
		{
			nrBranchings: 0,
			vars:
			function()
			{
				return { paramsObj:{} };
			},
			topicStream:
			function()
			{
				var getParamStream = this.getV( "getParamStream" );
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "PARAMS" ),
							setBeginRiverFlowParams: this.getV( "SET_PARAMS" ),
							getParams: this.getV( "GET_PARAMS" ),
							paramsObj: this.getV( "paramsObj" ),
							branch: undefined,
							failValidation: true
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params",
				function()
				{
					var expectedParams =
						{
							begin: this.getV( "EXP_PARAMS" ),
							validate: this.getV( "EXP_PARAMS" ),
							serveFailure: this.getV( "EXP_PARAMS" ),
							serveErr: this.getV( "EXP_PARAMS" ),
							finish: this.getV( "EXP_PARAMS" ),
						}
					;
					
					var actualParams = this.getV( "paramsObj" )
					
					Test.assert(
						true ===
							Test.areEqual( actualParams, expectedParams ),
						"Stream params dont have expected values",
						{
							expectedParams: expectedParams,
							actualParams: actualParams
						}
					);
				}
			]
		})
		
		]
	},
	
	"The Stream reads the Stream params in its own stones but "+
	"the Drop branches to other Streams that also read the "+
	"params and set and read their own params too",
	{
		vars:
		{
			FIRST_PARAMS:
			[
				"firstParamOne",
				"firstParamTwo",
				"firstParamThree",
			],
			FIRST_GET_PARAMS:
			[
				"firstParamOne",
				"firstParamTwo",
				"firstParamThree"
			],
			FIRST_SET_PARAMS:
			{
				"firstParamTwo": "dango",
				"firstParamThree": "dongo",
			},
			FIRST_EXP_PARAMS:
			{
				"firstParamOne": undefined,
				"firstParamTwo": "dango",
				"firstParamThree": "dongo",
			},
			LAST_PARAMS:
			[
				"secondParamOne",
				"secondParamTwo",
				"secondParamThree",
			],
			LAST_GET_PARAMS:
			[
				"firstParamOne",
				"firstParamTwo",
				"firstParamThree",
				"secondParamOne",
				"secondParamTwo",
				"secondParamThree",
			],
			LAST_SET_PARAMS:
			{
				"secondParamTwo": "dango",
				"secondParamThree":[ "dinga", "donga", {} ]
			},
			LAST_EXP_PARAMS_PRE:
			{
				"firstParamOne": undefined,
				"firstParamTwo": "dango",
				"firstParamThree": "dongo",
				"secondParamOne": undefined,
				"secondParamTwo": undefined,
				"secondParamThree": undefined
			},
			LAST_EXP_PARAMS:
			{
				"firstParamOne": undefined,
				"firstParamTwo": "dango",
				"firstParamThree": "dongo",
				"secondParamOne": undefined,
				"secondParamTwo": "dango",
				"secondParamThree":[ "dinga", "donga", {} ]
			}
		},
		
		next:
		[
		
		"The Stream branches to another Stream that reads "+
		"the Stream params in the stones begin, validate, "+
		"prepare, branch, serve and finish. The former Stream then "+
		"reads its params in the stone finish",
		RiverTest.getRiverTest(
		{
			nrBranchings: 0,
			vars:
			function()
			{
				return { firstParamsObj:{}, lastParamsObj:{} };
			},
			topicStream:
			function()
			{
				var getParamStream = this.getV( "getParamStream" );
				var lastParamsObj = this.getV( "lastParamsObj" );
				
				var lastStream =
					getParamStream(
						"LastStream",
						{
							params: this.getV( "LAST_PARAMS" ),
							setPrepareParams: this.getV( "LAST_SET_PARAMS" ),
							branch: undefined,
							failValidation: false,
							getParams: this.getV( "LAST_GET_PARAMS" ),
							paramsObj: this.getV( "lastParamsObj" )
						}
					)
				;
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "FIRST_PARAMS" ),
							setBeginRiverFlowParams:
								this.getV( "FIRST_SET_PARAMS" ),
							branch: lastStream,
							failValidation: false,
							getParams: this.getV( "FIRST_GET_PARAMS" ),
							paramsObj: this.getV( "firstParamsObj" )
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params "+
				"when the first Stream reads them in its stones",
				function()
				{
					var expectedStreamParams =
						{
							begin: this.getV( "FIRST_EXP_PARAMS" ),
							validate: this.getV( "FIRST_EXP_PARAMS" ),
							prepare: this.getV( "FIRST_EXP_PARAMS" ),
							branch: this.getV( "FIRST_EXP_PARAMS" ),
							finish: this.getV( "FIRST_EXP_PARAMS" )
						}
					;
					
					var actualStreamParams = this.getV( "firstParamsObj" );
					
					Test.assert(
						true ===
							Test.areEqual(
								actualStreamParams, expectedStreamParams
							),
						"Stream params dont have expected values",
						{
							expectedParams: expectedStreamParams,
							actualParams: actualStreamParams
						}
					);
				},
				
				"Correct values are yielded for the Stream params "+
				"when the last Stream reads them in its stones",
				function()
				{
					var expectedStreamParams =
						{
							begin: this.getV( "LAST_EXP_PARAMS_PRE" ),
							validate: this.getV( "LAST_EXP_PARAMS_PRE" ),
							prepare: this.getV( "LAST_EXP_PARAMS_PRE" ),
							branch: this.getV( "LAST_EXP_PARAMS" ),
							serve: this.getV( "LAST_EXP_PARAMS" ),
							finish: this.getV( "LAST_EXP_PARAMS" )
						}
					;
					
					var actualStreamParams = this.getV( "lastParamsObj" );
					
					Test.assert(
						true ===
							Test.areEqual(
								actualStreamParams, expectedStreamParams
							),
						"Stream params dont have expected values",
						{
							expectedParams: expectedStreamParams,
							actualParams: actualStreamParams
						}
					);
				}
			]
		}),
		
		"The Stream branches to another Stream that reads "+
		"the Stream params in the stones begin, validate, "+
		"serveFailure, serveErr and finish",
		RiverTest.getRiverTest(
		{
			nrBranchings: 0,
			vars:
			function()
			{
				return { firstParamsObj:{}, lastParamsObj:{} };
			},
			topicStream:
			function()
			{
				var getParamStream = this.getV( "getParamStream" );
				
				var lastStream =
					getParamStream(
						"LastStream",
						{
							params: this.getV( "LAST_PARAMS" ),
							setPrepareParams: this.getV( "LAST_SET_PARAMS" ),
							branch: undefined,
							failValidation: true,
							getParams: this.getV( "LAST_GET_PARAMS" ),
							paramsObj: this.getV( "lastParamsObj" )
						}
					)
				;
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "FIRST_PARAMS" ),
							setBeginRiverFlowParams:
								this.getV( "FIRST_SET_PARAMS" ),
							branch: lastStream,
							failValidation: false,
							getParams: this.getV( "FIRST_GET_PARAMS" ),
							paramsObj: this.getV( "firstParamsObj" )
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params "+
				"when the first Stream reads them in its stones",
				function()
				{
					var expectedParams =
						{
							begin: this.getV( "FIRST_EXP_PARAMS" ),
							validate: this.getV( "FIRST_EXP_PARAMS" ),
							prepare: this.getV( "FIRST_EXP_PARAMS" ),
							branch: this.getV( "FIRST_EXP_PARAMS" ),
							finish: this.getV( "FIRST_EXP_PARAMS" )
						}
					;
					
					var actualParams = this.getV( "firstParamsObj" );
					
					Test.assert(
						true ===
							Test.areEqual( actualParams, expectedParams ),
						"Stream params dont have expected values",
						{
							expectedParams: expectedParams,
							actualParams: actualParams
						}
					);
				},
				
				"Correct values are yielded for the Stream params "+
				"when the last Stream reads them in its stones",
				function()
				{
					var expectedStreamParams =
						{
							begin: this.getV( "LAST_EXP_PARAMS_PRE" ),
							validate: this.getV( "LAST_EXP_PARAMS_PRE" ),
							serveFailure: this.getV( "LAST_EXP_PARAMS_PRE" ),
							serveErr: this.getV( "LAST_EXP_PARAMS_PRE" ),
							finish: this.getV( "LAST_EXP_PARAMS_PRE" )
						}
					;
					
					var actualStreamParams = this.getV( "lastParamsObj" );
					
					Test.assert(
						true ===
							Test.areEqual(
								actualStreamParams, expectedStreamParams
							),
						"Stream params dont have expected values",
						{
							expectedParams: expectedStreamParams,
							actualParams: actualStreamParams
						}
					);
				}
			]
		}),
		
		"The Stream branches to another Stream that sets some of "+
		"its own Stream params. The second (middle) Stream then "+
		"branches to the last Stream that also sets some of its "+
		"own params and then reads its own and the first Stream's "+
		"params that have been set. The first Stream finally reads "+
		"its Stream params in stone finish",
		RiverTest.getRiverTest(
		{
			nrBranchings: 0,
			vars:
			function()
			{
				return(
					{
						firstParamsObj:{},
						lastParamsObj:{},
						MIDDLE_PARAMS:
						[
							"middleParamOne",
							"middleParamTwo",
							"middleParamThree"
						],
						MIDDLE_SET_PARAMS:
						{
							"middleParamOne": 42,
							"middleParamThree": { dingo:{}, dango:[ {} ] }
						}
					}
				);
			},
			topicStream:
			function()
			{
				var lastParamsObj = this.getV( "lastParamsObj" );
				
				var getParamStream = this.getV( "getParamStream" );
				
				var lastStream =
					getParamStream(
						"LastStream",
						{
							params: this.getV( "LAST_PARAMS" ),
							setPrepareParams: this.getV( "LAST_SET_PARAMS" ),
							branch: undefined,
							failValidation: false,
							getParams: this.getV( "LAST_GET_PARAMS" ),
							paramsObj: this.getV( "lastParamsObj" )
						}
					)
				;
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "FIRST_PARAMS" ),
							setBeginRiverFlowParams:
								this.getV( "FIRST_SET_PARAMS" ),
							branch: lastStream,
							failValidation: false,
							getParams: this.getV( "FIRST_GET_PARAMS" ),
							paramsObj: this.getV( "firstParamsObj" )
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params "+
				"when the first Stream reads them in its stones",
				function()
				{
					var expectedStreamParams =
						{
							begin: this.getV( "FIRST_EXP_PARAMS" ),
							validate: this.getV( "FIRST_EXP_PARAMS" ),
							prepare: this.getV( "FIRST_EXP_PARAMS" ),
							branch: this.getV( "FIRST_EXP_PARAMS" ),
							finish: this.getV( "FIRST_EXP_PARAMS" )
						}
					;
					
					var actualStreamParams = this.getV( "firstParamsObj" );
					
					Test.assert(
						true ===
							Test.areEqual(
								actualStreamParams, expectedStreamParams
							),
						"Stream params dont have expected values",
						{
							expectedParams: expectedStreamParams,
							actualParams: actualStreamParams
						}
					);
				},
				
				"Correct values are yielded for the Stream params "+
				"when the last Stream reads them in its stones",
				function()
				{
					var expectedStreamParams =
						{
							begin: this.getV( "LAST_EXP_PARAMS_PRE" ),
							validate: this.getV( "LAST_EXP_PARAMS_PRE" ),
							prepare: this.getV( "LAST_EXP_PARAMS_PRE" ),
							branch: this.getV( "LAST_EXP_PARAMS" ),
							serve: this.getV( "LAST_EXP_PARAMS" ),
							finish: this.getV( "LAST_EXP_PARAMS" )
						}
					;
					
					var actualStreamParams = this.getV( "lastParamsObj" );
					
					Test.assert(
						true ===
							Test.areEqual(
								actualStreamParams, expectedStreamParams
							),
						"Stream params dont have expected values",
						{
							expectedParams: expectedStreamParams,
							actualParams: actualStreamParams
						}
					);
				}
			]
		})
		
		]
	}
	
	]
},

"Stream with Stream params and stone beginRiverFlow that sets "+
"Stream params incorrectly",
{
	next:
	[
	
	"Stream with Stream params and stones beginRiverFlow and "+
	"finish where beginRiverFlow sets a non existent Stream param",
	RiverTest.getRiverTest(
	{
		nrBranchings: 0,
		stack:
		[
			"FirstStream.beginRiverFlow",
			"FirstStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidStreamParamsForBeginRiverFlowCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:
					[
						"TestParamOne", "TestParamTwo", "TestParamThree"
					],
					stackBeginRiverFlow: true,
					beginRiverFlow:
					function( drop, opts, cb )
					{
						cb( undefined, { TestParamFour: "dingo" } );
					},
					finish: true
				}
			);
			
			return firstStream;
		}
	}),
	
	"Stream with Stream params and stones beginRiverFlow branch, "+
	"serveErr and finish where beginRiverFlow sets a param "+
	"that is declared by another later Stream",
	RiverTest.getRiverTest(
	{
		nrBranchings: 0,
		stack:
		[
			"FirstStream.beginRiverFlow",
			"FirstStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidStreamParamsForBeginRiverFlowCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var lastStream =
			RiverTest.getStream(
				"LastStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "TestParamFour" ]
				}
			);
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:
					[
						"TestParamOne", "TestParamTwo", "TestParamThree"
					],
					stackBeginRiverFlow: true,
					beginRiverFlow:
					function( drop, opts, cb )
					{
						cb( undefined, { TestParamFour: "dingo" } );
					},
					branches:[ lastStream ],
					finish: true
				}
			);
			
			return firstStream;
		}
	})
	
	]
},

"Stream with Stream params and stone prepare that sets "+
"some of those Stream params. The params are read later",
{
	next:
	[
	
	"The Stream doesnt branch and reads the Stream params itself",
	{
		vars:
		{
			PARAMS:
			[
				"testParamOne",
				"testParamTwo",
				"testParamThree",
				"testParamFour"
			],
			GET_PARAMS:
			[
				"testParamOne",
				"testParamTwo",
				"testParamThree",
				"testParamFour"
			],
			SET_PARAMS:
			{
				testParamTwo: "dingo",
				testParamThree:{ dango: "dongo" },
				testParamFour:[ "dinga" ]
			},
			EXP_PARAMS:
			{
				testParamOne: undefined,
				testParamTwo: "dingo",
				testParamThree:{ dango: "dongo" },
				testParamFour:[ "dinga" ]
			},
			EXP_PARAMS_PRE:
			{
				testParamOne: undefined,
				testParamTwo: undefined,
				testParamThree: undefined,
				testParamFour: undefined
			}
		},
		
		next:
		[
		
		"The Stream reads the Stream params in the stones "+
		"begin, validate, prepare, branch, serve and finish",
		RiverTest.getRiverTest(
		{
			vars:
			function()
			{
				return { paramsObj:{} };
			},
			topicStream:
			function()
			{
				var getParamStream = this.getV( "getParamStream" );
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "PARAMS" ),
							setPrepareParams: this.getV( "SET_PARAMS" ),
							getParams: this.getV( "GET_PARAMS" ),
							paramsObj: this.getV( "paramsObj" ),
							branch: undefined,
							failValidation: false
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params",
				function()
				{
					var expectedParams =
						{
							begin: this.getV( "EXP_PARAMS_PRE" ),
							validate: this.getV( "EXP_PARAMS_PRE" ),
							prepare: this.getV( "EXP_PARAMS_PRE" ),
							branch: this.getV( "EXP_PARAMS" ),
							serve: this.getV( "EXP_PARAMS" ),
							finish: this.getV( "EXP_PARAMS" )
						}
					;
					
					var actualParams = this.getV( "paramsObj" );
					
					Test.assert(
						true ===
							Test.areEqual( actualParams, expectedParams ),
						"Stream params dont have expected values",
						{
							expectedParams: expectedParams,
							actualParams: actualParams
						}
					);
				}
			]
		}),
		
		"The Stream reads the Stream params in the stones "+
		"begin, validate, prepare, branch, serveErr and finish",
		RiverTest.getRiverTest(
		{
			vars:
			function()
			{
				return { paramsObj:{} };
			},
			topicStream:
			function()
			{
				var getParamStream = this.getV( "getParamStream" );
				
				var firstStream =
					getParamStream(
						"FirstStream",
						{
							params: this.getV( "PARAMS" ),
							setPrepareParams: this.getV( "SET_PARAMS" ),
							getParams: this.getV( "GET_PARAMS" ),
							paramsObj: this.getV( "paramsObj" ),
							branch: undefined,
							failBranching: true
						}
					)
				;
				
				return firstStream;
			},
			vows:
			[
				"Correct values are yielded for the Stream params",
				function()
				{
					var expectedParams =
						{
							begin: this.getV( "EXP_PARAMS_PRE" ),
							validate: this.getV( "EXP_PARAMS_PRE" ),
							prepare: this.getV( "EXP_PARAMS_PRE" ),
							branch: this.getV( "EXP_PARAMS" ),
							serveErr: this.getV( "EXP_PARAMS" ),
							finish: this.getV( "EXP_PARAMS" ),
						}
					;
					
					var actualParams = this.getV( "paramsObj" )
					
					Test.assert(
						true ===
							Test.areEqual( actualParams, expectedParams ),
						"Stream params dont have expected values",
						{
							expectedParams: expectedParams,
							actualParams: actualParams
						}
					);
				}
			]
		})
		
		]
	},
	
	"The Stream branches to another Stream that sets some of "+
	"its own Stream params. The second (middle) Stream then "+
	"branches to the last Stream that also sets some of its "+
	"own params and then reads its own and the first Stream's "+
	"params that have been set. The first Stream finally reads "+
	"its Stream params in stone finish",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					firstParamsObj:{},
					FIRST_PARAMS:
					[
						"firstParamOne",
						"firstParamTwo",
						"firstParamThree",
					],
					FIRST_GET_PARAMS:
					[
						"firstParamOne",
						"firstParamTwo",
						"firstParamThree"
					],
					FIRST_SET_PARAMS:
					{
						"firstParamTwo": "dango",
						"firstParamThree": "dongo",
					},
					FIRST_EXP_PARAMS:
					{
						"firstParamOne": undefined,
						"firstParamTwo": "dango",
						"firstParamThree": "dongo",
					},
					FIRST_EXP_PARAMS_PRE:
					{
						"firstParamOne": undefined,
						"firstParamTwo": undefined,
						"firstParamThree": undefined,
					},
					
					MIDDLE_PARAMS:
					[
						"middleParamOne",
						"middleParamTwo",
						"middleParamThree"
					],
					MIDDLE_SET_PARAMS:
					{
						"middleParamOne": 42,
						"middleParamThree": { dingo:{}, dango:[ {} ] }
					},
					
					lastParamsObj:{},
					LAST_PARAMS:
					[
						"secondParamOne",
						"secondParamTwo",
						"secondParamThree",
					],
					LAST_GET_PARAMS:
					[
						"firstParamOne",
						"firstParamTwo",
						"firstParamThree",
						"secondParamOne",
						"secondParamTwo",
						"secondParamThree",
					],
					LAST_SET_PARAMS:
					{
						"secondParamTwo": "dango",
						"secondParamThree":[ "dinga", "donga", {} ]
					},
					LAST_EXP_PARAMS_PRE:
					{
						"firstParamOne": undefined,
						"firstParamTwo": "dango",
						"firstParamThree": "dongo",
						"secondParamOne": undefined,
						"secondParamTwo": undefined,
						"secondParamThree": undefined
					},
					LAST_EXP_PARAMS:
					{
						"firstParamOne": undefined,
						"firstParamTwo": "dango",
						"firstParamThree": "dongo",
						"secondParamOne": undefined,
						"secondParamTwo": "dango",
						"secondParamThree":[ "dinga", "donga", {} ]
					}
				}
			);
		},
		topicStream:
		function()
		{
			var getParamStream = this.getV( "getParamStream" );
			var lastParamsObj = this.getV( "lastParamsObj" );
			
			var lastStream =
				getParamStream(
					"LastStream",
					{
						params: this.getV( "LAST_PARAMS" ),
						setPrepareParams: this.getV( "LAST_SET_PARAMS" ),
						branch: undefined,
						failValidation: false,
						getParams: this.getV( "LAST_GET_PARAMS" ),
						paramsObj: this.getV( "lastParamsObj" )
					}
				)
			;
			
			var firstStream =
				getParamStream(
					"FirstStream",
					{
						params: this.getV( "FIRST_PARAMS" ),
						setPrepareParams: this.getV( "FIRST_SET_PARAMS" ),
						branch: lastStream,
						failValidation: false,
						getParams: this.getV( "FIRST_GET_PARAMS" ),
						paramsObj: this.getV( "firstParamsObj" )
					}
				)
			;
			
			return firstStream;
		},
		vows:
		[
			"Correct values are yielded for the Stream params "+
			"when the first Stream reads them in its stones",
			function()
			{
				var expectedStreamParams =
					{
						begin: this.getV( "FIRST_EXP_PARAMS_PRE" ),
						validate: this.getV( "FIRST_EXP_PARAMS_PRE" ),
						prepare: this.getV( "FIRST_EXP_PARAMS_PRE" ),
						branch: this.getV( "FIRST_EXP_PARAMS" ),
						finish: this.getV( "FIRST_EXP_PARAMS" )
					}
				;
				
				var actualStreamParams = this.getV( "firstParamsObj" );
				
				Test.assert(
					true ===
						Test.areEqual(
							actualStreamParams, expectedStreamParams
						),
					"Stream params dont have expected values",
					{
						expectedParams: expectedStreamParams,
						actualParams: actualStreamParams
					}
				);
			},
			
			"Correct values are yielded for the Stream params "+
			"when the last Stream reads them in its stones",
			function()
			{
				var expectedStreamParams =
					{
						begin: this.getV( "LAST_EXP_PARAMS_PRE" ),
						validate: this.getV( "LAST_EXP_PARAMS_PRE" ),
						prepare: this.getV( "LAST_EXP_PARAMS_PRE" ),
						branch: this.getV( "LAST_EXP_PARAMS" ),
						serve: this.getV( "LAST_EXP_PARAMS" ),
						finish: this.getV( "LAST_EXP_PARAMS" )
					}
				;
				
				var actualStreamParams = this.getV( "lastParamsObj" );
				
				Test.assert(
					true ===
						Test.areEqual(
							actualStreamParams, expectedStreamParams
						),
					"Stream params dont have expected values",
					{
						expectedParams: expectedStreamParams,
						actualParams: actualStreamParams
					}
				);
			}
		]
	})
	
	]
},

"Stream with Stream params and stone prepare that sets "+
"Stream params incorrectly",
{
	next:
	[
	
	"Stream with Stream params and stones prepare, serveErr and "+
	"finish where prepare sets a non existent Stream param",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.prepare",
			"FirstStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidStreamParamsForPrepareCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:
						[ "TestParamOne", "TestParamTwo", "TestParamThree" ],
					prepare:
					function( drop, cb )
					{
						cb( undefined, { TestParamFour: "dingo" } );
					},
					finish: true
				}
			);
			
			return firstStream;
		}
	}),

	"Stream with Stream params and stones prepare, branch, "+
	"serveErr and finish where prepare sets a param "+
	"that is declared by another later Stream",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.prepare",
			"FirstStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidStreamParamsForPrepareCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var lastStream =
			RiverTest.getStream(
				"LastStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "TestParamFour" ]
				}
			);
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:
					[
						"TestParamOne", "TestParamTwo", "TestParamThree"
					],
					prepare:
					function( drop, cb )
					{
						cb( undefined, { TestParamFour: "dingo" } );
					},
					branches:[ lastStream ],
					finish: true
				}
			);
			
			return firstStream;
		}
	}),
	
	"Stream that declares a Stream param and branches to another "+
	"Stream that tries to modify the first Stream's param",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.branch",
			"LastStream.validate",
			"LastStream.prepare",
			"LastStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidStreamParamsForPrepareCb"
			},
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var lastStream =
			RiverTest.getStream(
				"LastStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					prepare:
					function( drop, cb )
					{
						cb( undefined, { TestParamOne: "dingo" } );
					},
				}
			);
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "TestParamOne" ],
					branches:[ lastStream ],
					branch: RiverTest.branchToStream( "LastStream" ),
					finish: true
				}
			);
			
			return firstStream;
		}
	}),
	
	"Stream that declares a Stream param (and modifies it in "+
	"stone prepare) and branches to another "+
	"Stream that in turn branches to another Stream that finally "+
	"tries to modify the first Stream's param",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.prepare",
			"FirstStream.branch",
			"MiddleStream.validate",
			"MiddleStream.branch",
			"LastStream.validate",
			"LastStream.prepare",
			"LastStream.serveErr",
			{
				errClass: StreamError,
				errCode: "InvalidStreamParamsForPrepareCb"
			},
			"MiddleStream.finish",
			"FirstStream.finish"
		],
		topicStream:
		function()
		{
			var lastStream =
			RiverTest.getStream(
				"LastStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					prepare:
					function( drop, cb )
					{
						cb( undefined, { TestParamOne: "dingo" } );
					}
				}
			);
			
			var middleStream =
			RiverTest.getStream(
				"MiddleStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					branches:[ lastStream ],
					branch: RiverTest.branchToStream( "LastStream" ),
					finish: true
				}
			);
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "TestParamOne" ],
					branches:[ middleStream ],
					prepare:
					function( drop, cb )
					{
						cb( undefined, { TestParamOne: "dingo" } );
					},
					branch: RiverTest.branchToStream( "MiddleStream" ),
					finish: true
				}
			);
			
			return firstStream;
		}
	})
	
	]
},

"Stream that tries to read Stream params in stone finish, but "+
"the params are set by other Streams that are located after "+
"the previously mentioned Stream in the River",
{
	next:
	[
	
	"The other Streams' stone finish are not faulty and end by "+
	"calling their cb's correctly",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.branch",
			"MiddleStream.begin",
			"MiddleStream.validate",
			"MiddleStream.prepare",
			"MiddleStream.branch",
			"LastStream.begin",
			"LastStream.validate",
			"LastStream.prepare",
			"LastStream.branch",
			"LastStream.serve",
			"LastStream.finish",
			"MiddleStream.finish",
			"FirstStream.finish",
		],
		vars:
		function()
		{
			return(
				{
					middleParamErr: undefined,
					lastParamErr: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var getParamStream = this.getV( "getParamStream" );
			
			var suite = this;
			
			var lastStream =
			getParamStream(
				"LastStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "lastParam" ],
					setPrepareParams:{ lastParam: "dongo" }
				}
			);
			
			var middleStream =
			getParamStream(
				"MiddleStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "middleParam" ],
					setPrepareParams:{ middleParam: "dingo" },
					branch: lastStream
				}
			);
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					branches:[ middleStream ],
					branch: RiverTest.branchToStream( "MiddleStream" ),
					finish:
					function( drop, cb )
					{
						try
						{
							drop.getParam( "middleParam" );
						}
						catch( e )
						{
							suite.setV( "middleParamErr", e );
						}
						
						try
						{
							drop.getParam( "lastParam" );
						}
						catch( e )
						{
							suite.setV( "lastParamErr", e );
						}
						
						cb();
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"The first Stream encounters the correct err when it "+
			"tries to read the Stream param set by the middle Stream",
			function()
			{
				var err = this.getV( "middleParamErr" );
				
				Test.assert(
					err instanceof RiverRuntimeError === true &&
					true ===
						err.hasErrCode( "UndeclaredStreamParamRequested" )
				);
			},
			"The first Stream encounters the correct err when it "+
			"tries to read the Stream param set by the last Stream",
			function()
			{
				var err = this.getV( "lastParamErr" );
				
				Test.assert(
					err instanceof RiverRuntimeError === true &&
					true ===
						err.hasErrCode( "UndeclaredStreamParamRequested" )
				);
			}
		]
	}),
	
	"There are three other Streams, and each of them has "+
	"incorrect stone finish that throws an err, gives a cb err "+
	"or provides invalid args to its cb",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.validate",
			"FirstStream.branch",
			"MiddleStream.begin",
			"MiddleStream.validate",
			"MiddleStream.prepare",
			"MiddleStream.branch",
			"LowerStream.begin",
			"LowerStream.validate",
			"LowerStream.prepare",
			"LowerStream.branch",
			"LastStream.begin",
			"LastStream.validate",
			"LastStream.prepare",
			"LastStream.branch",
			"LastStream.serve",
			"LastStream.finish",
			"LowerStream.finish",
			"MiddleStream.finish",
			"FirstStream.finish",
		],
		vars:
		function()
		{
			return(
				{
					middleParamErr: undefined,
					lowerParamErr: undefined,
					lastParamErr: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var getParamStream = this.getV( "getParamStream" );
			
			var suite = this;
			
			var lastStream =
			getParamStream(
				"LastStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "lastParam" ],
					setPrepareParams:{ lastParam: "dongo" },
					finish: "throwErr"
				}
			);
			
			var lowerStream =
			getParamStream(
				"LowerStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "lowerParam" ],
					setPrepareParams:{ lowerParam: "dongo" },
					branch: lastStream,
					finish: "giveCbErr"
				}
			);
			
			var middleStream =
			getParamStream(
				"MiddleStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					params:[ "middleParam" ],
					setPrepareParams:{ middleParam: "dingo" },
					branch: lowerStream,
					finish: "giveInvalidArgs"
				}
			);
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					stack: this.getV( "getRiverTest.stack" ),
					branches:[ middleStream ],
					branch: RiverTest.branchToStream( "MiddleStream" ),
					finish:
					function( drop, cb )
					{
						try
						{
							drop.getParam( "middleParam" );
						}
						catch( e )
						{
							suite.setV( "middleParamErr", e );
						}
						
						try
						{
							drop.getParam( "lowerParam" );
						}
						catch( e )
						{
							suite.setV( "lowerParamErr", e );
						}
						
						try
						{
							drop.getParam( "lastParam" );
						}
						catch( e )
						{
							suite.setV( "lastParamErr", e );
						}
						
						cb();
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"The first Stream encounters the correct err when it "+
			"tries to read the Stream param set by the middle Stream",
			function()
			{
				var err = this.getV( "middleParamErr" );
				
				Test.assert(
					err instanceof RiverRuntimeError === true &&
					true ===
						err.hasErrCode( "UndeclaredStreamParamRequested" )
				);
			},
			"The first Stream encounters the correct err when it "+
			"tries to read the Stream param set by the lower Stream",
			function()
			{
				var err = this.getV( "lowerParamErr" );
				
				Test.assert(
					err instanceof RiverRuntimeError === true &&
					true ===
						err.hasErrCode( "UndeclaredStreamParamRequested" )
				);
			},
			"The first Stream encounters the correct err when it "+
			"tries to read the Stream param set by the last Stream",
			function()
			{
				var err = this.getV( "lastParamErr" );
				
				Test.assert(
					err instanceof RiverRuntimeError === true &&
					true ===
						err.hasErrCode( "UndeclaredStreamParamRequested" )
				);
			}
		]
	})
	
	]
}

]

});

suite.add(
"Stream that handles local Stream vars",
[

"Stream that sets local Stream vars in stone beginRiverFlow",
{
	next:
	[
	
	"The local Stream vars are read by every stone except "+
	"serveFailure",
	RiverTest.getRiverTest(
	{
		nrBranchings: 0,
		vars:
		function()
		{
			return(
				{
					brfGetsBrfOne: undefined,
					brfGetsBrfTwo: undefined,
					
					bGetsBrfOne: undefined,
					bGetsBrfTwo: undefined,
					
					vGetsBrfOne: undefined,
					vGetsBrfTwo: undefined,
					
					pGetsBrfOne: undefined,
					pGetsBrfTwo: undefined,
					
					brGetsBrfOne: undefined,
					brGetsBrfTwo: undefined,
					
					sGetsBrfOne: undefined,
					sGetsBrfTwo: undefined,
					
					seGetsBrfOne: undefined,
					seGetsBrfTwo: undefined,
					
					fGetsBrfOne: undefined,
					fGetsBrfTwo: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					beginRiverFlow:
					function( drop, opts, cb )
					{
						drop.set( "brfOne", "dingo" );
						drop.set( "brfOne", "dango" );
						drop.set( "brfTwo", "dongo" );
						
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV(
								"brfGetsBrfOne", drop.get( "brfOne" )
							);
							suite.setV(
								"brfGetsBrfTwo", drop.get( "brfTwo" )
							);
						}
						
						cb();
					},
					begin:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "bGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "bGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						
						cb();
					},
					validate:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "vGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "vGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						
						cb();
					},
					prepare:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "pGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "pGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						
						cb();
					},
					branch:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "brGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "brGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						cb();
					},
					serve:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "sGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "sGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						throw new TestingError();
					},
					serveErr:
					function( drop, opts, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "seGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "seGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						cb();
					},
					finish:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "fGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "fGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						var func = RiverTest.endDrop();
						
						func( drop, cb );
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"beginRiverFlow can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "brfGetsBrfOne" ) === "dango" &&
					this.getV( "brfGetsBrfTwo" ) === "dongo"
				);
			},
			
			"begin can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "bGetsBrfOne" ) === "dango" &&
					this.getV( "bGetsBrfTwo" ) === "dongo"
				);
			},
			
			"validate can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "vGetsBrfOne" ) === "dango" &&
					this.getV( "vGetsBrfTwo" ) === "dongo"
				);
			},
			
			"prepare can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "pGetsBrfOne" ) === "dango" &&
					this.getV( "pGetsBrfTwo" ) === "dongo"
				);
			},
			
			"branch can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "brGetsBrfOne" ) === "dango" &&
					this.getV( "brGetsBrfTwo" ) === "dongo"
				);
			},
			
			"serve can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "sGetsBrfOne" ) === "dango" &&
					this.getV( "sGetsBrfTwo" ) === "dongo"
				);
			},
			
			"serveErr can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "seGetsBrfOne" ) === "dango" &&
					this.getV( "seGetsBrfTwo" ) === "dongo"
				);
			},
			
			"finish can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "fGetsBrfOne" ) === "dango" &&
					this.getV( "fGetsBrfTwo" ) === "dongo"
				);
			},
		]
	}),
	
	"The local Stream vars are read by stone serveFailure",
	RiverTest.getRiverTest(
	{
		nrBranchings: 0,
		vars:
		function()
		{
			return(
				{
					sfGetsBrfOne: undefined,
					sfGetsBrfTwo: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					beginRiverFlow:
					function( drop, opts, cb )
					{
						drop.set( "brfOne", "dango" );
						drop.set( "brfTwo", "dongo" );
						
						cb();
					},
					validate: RiverTest.failValidation(),
					serve: true,
					serveFailure:
					function( drop, cb )
					{
						if(
							drop.isSet( "brfOne" ) === true &&
							drop.isSet( "brfTwo" ) === true
						)
						{
							suite.setV( "sfGetsBrfOne", drop.get( "brfOne" ) );
							suite.setV( "sfGetsBrfTwo", drop.get( "brfTwo" ) );
						}
						
						cb();
					},
					finish: RiverTest.endDrop()
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"serveFailure can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "sfGetsBrfOne" ) === "dango" &&
					this.getV( "sfGetsBrfTwo" ) === "dongo"
				);
			},
		]
	})
	
	]
},

"Stream that sets local Stream vars in stone begin",
{
	next:
	[
	
	"The local Stream vars are read by every stone except "+
	"serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					bGetsVarOne: undefined,
					bGetsVarTwo: undefined,
					
					vGetsVarOne: undefined,
					vGetsVarTwo: undefined,
					
					pGetsVarOne: undefined,
					pGetsVarTwo: undefined,
					
					brGetsVarOne: undefined,
					brGetsVarTwo: undefined,
					
					sGetsVarOne: undefined,
					sGetsVarTwo: undefined,
					
					seGetsVarOne: undefined,
					seGetsVarTwo: undefined,
					
					fGetsVarOne: undefined,
					fGetsVarTwo: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					begin:
					function( drop, cb )
					{
						drop.set( "varOne", "dingo" );
						drop.set( "varOne", "dango" );
						drop.set( "varTwo", "dongo" );
						
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "bGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "bGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					validate:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "vGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "vGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					prepare:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "pGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "pGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					branch:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "brGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "brGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					serve:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "sGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "sGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						throw new TestingError();
					},
					serveErr:
					function( drop, opts, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "seGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "seGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					finish:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						var func = RiverTest.endDrop();
						
						func( drop, cb );
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"begin can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "bGetsVarOne" ) === "dango" &&
					this.getV( "bGetsVarTwo" ) === "dongo"
				);
			},
			
			"validate can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "vGetsVarOne" ) === "dango" &&
					this.getV( "vGetsVarTwo" ) === "dongo"
				);
			},
			
			"prepare can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "pGetsVarOne" ) === "dango" &&
					this.getV( "pGetsVarTwo" ) === "dongo"
				);
			},
			
			"branch can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "brGetsVarOne" ) === "dango" &&
					this.getV( "brGetsVarTwo" ) === "dongo"
				);
			},
			
			"serve can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "sGetsVarOne" ) === "dango" &&
					this.getV( "sGetsVarTwo" ) === "dongo"
				);
			},
			
			"serveErr can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "seGetsVarOne" ) === "dango" &&
					this.getV( "seGetsVarTwo" ) === "dongo"
				);
			},
			
			"finish can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "fGetsVarOne" ) === "dango" &&
					this.getV( "fGetsVarTwo" ) === "dongo"
				);
			},
		]
	}),
	
	"The local Stream vars are read by stone serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					sfGetsVarOne: undefined,
					sfGetsVarTwo: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					begin:
					function( drop, cb )
					{
						drop.set( "varOne", "dango" );
						drop.set( "varTwo", "dongo" );
						
						cb();
					},
					validate: RiverTest.failValidation(),
					serve: true,
					serveFailure:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "sfGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "sfGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					finish: RiverTest.endDrop()
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"serveFailure can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "sfGetsVarOne" ) === "dango" &&
					this.getV( "sfGetsVarTwo" ) === "dongo"
				);
			},
		]
	})
	
	]
},

"Stream that sets local Stream vars in stone validate",
{
	next:
	[
	
	"The local Stream vars are read by every stone except "+
	"serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					vGetsVarOne: undefined,
					vGetsVarTwo: undefined,
					
					pGetsVarOne: undefined,
					pGetsVarTwo: undefined,
					
					brGetsVarOne: undefined,
					brGetsVarTwo: undefined,
					
					sGetsVarOne: undefined,
					sGetsVarTwo: undefined,
					
					seGetsVarOne: undefined,
					seGetsVarTwo: undefined,
					
					fGetsVarOne: undefined,
					fGetsVarTwo: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					validate:
					function( drop, cb )
					{
						drop.set( "varOne", "dingo" );
						drop.set( "varOne", "dango" );
						drop.set( "varTwo", "dongo" );
						
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "vGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "vGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					prepare:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "pGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "pGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					branch:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "brGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "brGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					serve:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "sGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "sGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						throw new TestingError();
					},
					serveErr:
					function( drop, opts, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "seGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "seGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					finish:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						var func = RiverTest.endDrop();
						
						func( drop, cb );
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"validate can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "vGetsVarOne" ) === "dango" &&
					this.getV( "vGetsVarTwo" ) === "dongo"
				);
			},
			
			"prepare can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "pGetsVarOne" ) === "dango" &&
					this.getV( "pGetsVarTwo" ) === "dongo"
				);
			},
			
			"branch can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "brGetsVarOne" ) === "dango" &&
					this.getV( "brGetsVarTwo" ) === "dongo"
				);
			},
			
			"serve can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "sGetsVarOne" ) === "dango" &&
					this.getV( "sGetsVarTwo" ) === "dongo"
				);
			},
			
			"serveErr can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "seGetsVarOne" ) === "dango" &&
					this.getV( "seGetsVarTwo" ) === "dongo"
				);
			},
			
			"finish can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "fGetsVarOne" ) === "dango" &&
					this.getV( "fGetsVarTwo" ) === "dongo"
				);
			},
		]
	}),
	
	"The local Stream vars are read by stone serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					sfGetsVarOne: undefined,
					sfGetsVarTwo: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					validate:
					function( drop, cb )
					{
						drop.set( "varOne", "dango" );
						drop.set( "varTwo", "dongo" );
						
						cb( undefined, "ValidationFailed" );
					},
					serve: true,
					serveFailure:
					function( drop, cb )
					{
						if(
							drop.isSet( "varOne" ) === true &&
							drop.isSet( "varTwo" ) === true
						)
						{
							suite.setV( "sfGetsVarOne", drop.get( "varOne" ) );
							suite.setV( "sfGetsVarTwo", drop.get( "varTwo" ) );
						}
						
						cb();
					},
					finish: RiverTest.endDrop()
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"serveFailure can read the local Stream vars",
			function()
			{
				Test.assert(
					this.getV( "sfGetsVarOne" ) === "dango" &&
					this.getV( "sfGetsVarTwo" ) === "dongo"
				);
			},
		]
	})
	
	]
},

"Stream that sets local Stream vars in stone serveFailre and "+
"reads the vars in the same stone and stone finish",
RiverTest.getRiverTest(
{
	vars:
	function()
	{
		return(
			{
				sfGetsVarOne: undefined,
				sfGetsVarTwo: undefined,
				
				fGetsVarOne: undefined,
				fGetsVarTwo: undefined
			}
		);
	},
	topicStream:
	function()
	{
		var suite = this;
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				validate: RiverTest.failValidation(),
				serve: true,
				serveFailure:
				function( drop, cb )
				{
					drop.set( "varOne", "dingo" );
					drop.set( "varOne", "dango" );
					drop.set( "varTwo", "dongo" );
					
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "sfGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "sfGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				finish:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					var func = RiverTest.endDrop();
					
					func( drop, cb );
				}
			}
		);
		
		return firstStream;
	},
	vows:
	[
		"serveFailure can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "sfGetsVarOne" ) === "dango" &&
				this.getV( "sfGetsVarTwo" ) === "dongo"
			);
		},
		
		"finish can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "fGetsVarOne" ) === "dango" &&
				this.getV( "fGetsVarTwo" ) === "dongo"
			);
		},
	]
}),

"Stream that sets local Stream vars in stone prepare and reads "+
"the vars in the same stone and every following stone",
RiverTest.getRiverTest(
{
	vars:
	function()
	{
		return(
			{
				pGetsVarOne: undefined,
				pGetsVarTwo: undefined,
				
				brGetsVarOne: undefined,
				brGetsVarTwo: undefined,
				
				sGetsVarOne: undefined,
				sGetsVarTwo: undefined,
				
				seGetsVarOne: undefined,
				seGetsVarTwo: undefined,
				
				fGetsVarOne: undefined,
				fGetsVarTwo: undefined
			}
		);
	},
	topicStream:
	function()
	{
		var suite = this;
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				prepare:
				function( drop, cb )
				{
					drop.set( "varOne", "dingo" );
					drop.set( "varOne", "dango" );
					drop.set( "varTwo", "dongo" );
					
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "pGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "pGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				branch:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "brGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "brGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				serve:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "sGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "sGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					throw new TestingError();
				},
				serveErr:
				function( drop, opts, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "seGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "seGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				finish:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					var func = RiverTest.endDrop();
					
					func( drop, cb );
				}
			}
		);
		
		return firstStream;
	},
	vows:
	[
		"prepare can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "pGetsVarOne" ) === "dango" &&
				this.getV( "pGetsVarTwo" ) === "dongo"
			);
		},
		
		"branch can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "brGetsVarOne" ) === "dango" &&
				this.getV( "brGetsVarTwo" ) === "dongo"
			);
		},
		
		"serve can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "sGetsVarOne" ) === "dango" &&
				this.getV( "sGetsVarTwo" ) === "dongo"
			);
		},
		
		"serveErr can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "seGetsVarOne" ) === "dango" &&
				this.getV( "seGetsVarTwo" ) === "dongo"
			);
		},
		
		"finish can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "fGetsVarOne" ) === "dango" &&
				this.getV( "fGetsVarTwo" ) === "dongo"
			);
		},
	]
}),

"Stream that sets local Stream vars in stone branch "+
"and reads the vars in the same stone and every following stone",
RiverTest.getRiverTest(
{
	vars:
	function()
	{
		return(
			{
				brGetsVarOne: undefined,
				brGetsVarTwo: undefined,
				
				sGetsVarOne: undefined,
				sGetsVarTwo: undefined,
				
				seGetsVarOne: undefined,
				seGetsVarTwo: undefined,
				
				fGetsVarOne: undefined,
				fGetsVarTwo: undefined
			}
		);
	},
	topicStream:
	function()
	{
		var suite = this;
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				branch:
				function( drop, cb )
				{
					drop.set( "varOne", "dingo" );
					drop.set( "varOne", "dango" );
					drop.set( "varTwo", "dongo" );
					
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "brGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "brGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				serve:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "sGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "sGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					throw new TestingError();
				},
				serveErr:
				function( drop, opts, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "seGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "seGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				finish:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					var func = RiverTest.endDrop();
					
					func( drop, cb );
				}
			}
		);
		
		return firstStream;
	},
	vows:
	[
		"branch can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "brGetsVarOne" ) === "dango" &&
				this.getV( "brGetsVarTwo" ) === "dongo"
			);
		},
		
		"serve can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "sGetsVarOne" ) === "dango" &&
				this.getV( "sGetsVarTwo" ) === "dongo"
			);
		},
		
		"serveErr can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "seGetsVarOne" ) === "dango" &&
				this.getV( "seGetsVarTwo" ) === "dongo"
			);
		},
		
		"finish can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "fGetsVarOne" ) === "dango" &&
				this.getV( "fGetsVarTwo" ) === "dongo"
			);
		},
	]
}),

"Stream that sets local Stream vars in stone serve and reads "+
"the vars in the same stone and every following stone",
RiverTest.getRiverTest(
{
	vars:
	function()
	{
		return(
			{
				sGetsVarOne: undefined,
				sGetsVarTwo: undefined,
				
				seGetsVarOne: undefined,
				seGetsVarTwo: undefined,
				
				fGetsVarOne: undefined,
				fGetsVarTwo: undefined
			}
		);
	},
	topicStream:
	function()
	{
		var suite = this;
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				serve:
				function( drop, cb )
				{
					drop.set( "varOne", "dingo" );
					drop.set( "varOne", "dango" );
					drop.set( "varTwo", "dongo" );
					
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "sGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "sGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					throw new TestingError();
				},
				serveErr:
				function( drop, opts, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "seGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "seGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				finish:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					var func = RiverTest.endDrop();
					
					func( drop, cb );
				}
			}
		);
		
		return firstStream;
	},
	vows:
	[
		"serve can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "sGetsVarOne" ) === "dango" &&
				this.getV( "sGetsVarTwo" ) === "dongo"
			);
		},
		
		"serveErr can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "seGetsVarOne" ) === "dango" &&
				this.getV( "seGetsVarTwo" ) === "dongo"
			);
		},
		
		"finish can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "fGetsVarOne" ) === "dango" &&
				this.getV( "fGetsVarTwo" ) === "dongo"
			);
		},
	]
}),

"Stream that sets local Stream vars in stone serveErr and "+
"reads the vars in the same stone and every following stone",
RiverTest.getRiverTest(
{
	vars:
	function()
	{
		return(
			{
				seGetsVarOne: undefined,
				seGetsVarTwo: undefined,
				
				fGetsVarOne: undefined,
				fGetsVarTwo: undefined
			}
		);
	},
	topicStream:
	function()
	{
		var suite = this;
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				serve: RiverTest.throwErr(),
				serveErr:
				function( drop, opts, cb )
				{
					drop.set( "varOne", "dingo" );
					drop.set( "varOne", "dango" );
					drop.set( "varTwo", "dongo" );
					
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "seGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "seGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				},
				finish:
				function( drop, cb )
				{
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					var func = RiverTest.endDrop();
					
					func( drop, cb );
				}
			}
		);
		
		return firstStream;
	},
	vows:
	[
		"serveErr can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "seGetsVarOne" ) === "dango" &&
				this.getV( "seGetsVarTwo" ) === "dongo"
			);
		},
		
		"finish can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "fGetsVarOne" ) === "dango" &&
				this.getV( "fGetsVarTwo" ) === "dongo"
			);
		},
	]
}),

"Stream that sets local Stream vars in stone finish and reads "+
"the vars in the same stone",
RiverTest.getRiverTest(
{
	vars:
	function()
	{
		return(
			{
				fGetsVarOne: undefined,
				fGetsVarTwo: undefined
			}
		);
	},
	topicStream:
	function()
	{
		var suite = this;
		
		var firstStream =
		RiverTest.getStream(
			"FirstStream",
			{
				serve: true,
				finish:
				function( drop, cb )
				{
					drop.set( "varOne", "dingo" );
					drop.set( "varOne", "dango" );
					drop.set( "varTwo", "dongo" );
					
					if(
						drop.isSet( "varOne" ) === true &&
						drop.isSet( "varTwo" ) === true
					)
					{
						suite.setV( "fGetsVarOne", drop.get( "varOne" ) );
						suite.setV( "fGetsVarTwo", drop.get( "varTwo" ) );
					}
					
					cb();
				}
			}
		);
		
		return firstStream;
	},
	vows:
	[
		"finish can read the local Stream vars",
		function()
		{
			Test.assert(
				this.getV( "fGetsVarOne" ) === "dango" &&
				this.getV( "fGetsVarTwo" ) === "dongo"
			);
		},
	]
}),

"Stream that reads and sets the same local Stream var in "+
"various stones",
{
	next:
	[
	
	"The local Stream var are read and set in every stone "+
	"except serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					brfSeesVar: undefined,
					brfGetsVar: undefined,
					bSeesVar: undefined,
					bGetsVar: undefined,
					vSeesVar: undefined,
					vGetsVar: undefined,
					pSeesVar: undefined,
					pGetsVar: undefined,
					brSeesVar: undefined,
					brGetsVar: undefined,
					sSeesVar: undefined,
					sGetsVar: undefined,
					seSeesVar: undefined,
					seGetsVar: undefined,
					fSeesVar: undefined,
					fGetsVar: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					beginRiverFlow:
					function( drop, opts, cb )
					{
						suite.setV( "brfSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "brfGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "beginRiverFlow" );
						
						cb();
					},
					begin:
					function( drop, cb )
					{
						suite.setV( "bSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "bGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "begin" );
						
						cb();
					},
					validate:
					function( drop, cb )
					{
						suite.setV( "vSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "vGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "validate" );
						
						cb();
					},
					prepare:
					function( drop, cb )
					{
						suite.setV( "pSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "pGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "prepare" );
						
						cb();
					},
					branch:
					function( drop, cb )
					{
						suite.setV( "brSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "brGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "branch" );
						
						cb();
					},
					serve:
					function( drop, cb )
					{
						suite.setV( "sSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "sGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "serve" );
						
						throw new TestingError();
					},
					serveErr:
					function( drop, opts, cb )
					{
						suite.setV( "seSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "seGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "serveErr" );
						
						cb();
					},
					finish:
					function( drop, cb )
					{
						suite.setV( "fSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "fGetsVar", drop.get( "localVar" ) );
						
						var func = RiverTest.endDrop();
						
						func( drop, cb );
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"beginRiverFlow can read the var",
			function()
			{
				if( this.getV( "getRiverTest.nrBranchings" ) === 0 )
				{
					Test.assert(
						this.getV( "brfSeesVar" ) === false &&
						this.getV( "brfGetsVar" ) === undefined
					);
				}
			},
			
			"begin can read the var set by previous stone",
			function()
			{
				if( this.getV( "getRiverTest.nrBranchings" ) === 0 )
				{
					Test.assert(
						this.getV( "bSeesVar" ) === true &&
						this.getV( "bGetsVar" ) === "beginRiverFlow"
					);
				}
				else
				{
					Test.assert(
						this.getV( "bSeesVar" ) === false &&
						this.getV( "bGetsVar" ) === undefined
					);
				}
			},
			
			"validate can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "vSeesVar" ) === true &&
					this.getV( "vGetsVar" ) === "begin"
				);
			},
			
			"prepare can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "pSeesVar" ) === true &&
					this.getV( "pGetsVar" ) === "validate"
				);
			},
			
			"branch can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "brSeesVar" ) === true &&
					this.getV( "brGetsVar" ) === "prepare"
				);
			},
			
			"serve can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "sSeesVar" ) === true &&
					this.getV( "sGetsVar" ) === "branch"
				);
			},
			
			"serveErr can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "seSeesVar" ) === true &&
					this.getV( "seGetsVar" ) === "serve"
				);
			},
			
			"finish can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "fSeesVar" ) === true &&
					this.getV( "fGetsVar" ) === "serveErr"
				);
			},
		]
	}),
	
	"The local Stream var are set and read in the stones "+
	"validate, serveFailure and finish",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					sfSeesVar: undefined,
					sfGetsVar: undefined,
					fSeesVar: undefined,
					fGetsVar: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					validate:
					function( drop, cb )
					{
						drop.set( "localVar", "validate" );
						
						cb( undefined, "ValidationFailed" );
					},
					serve: true,
					serveFailure:
					function( drop, cb )
					{
						suite.setV( "sfSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "sfGetsVar", drop.get( "localVar" ) );
						
						drop.set( "localVar", "serveFailure" );
						
						cb();
					},
					finish:
					function( drop, cb )
					{
						suite.setV( "fSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "fGetsVar", drop.get( "localVar" ) );
						
						var func = RiverTest.endDrop();
						
						func( drop, cb );
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"serveFailure can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "sfSeesVar" ) === true &&
					this.getV( "sfGetsVar" ) === "validate"
				);
			},
			
			"finish can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "fSeesVar" ) === true &&
					this.getV( "fGetsVar" ) === "serveFailure"
				);
			},
		]
	})
	
	]
},

"Stream that reads an unset local Stream var in various stones",
{
	next:
	[
	
	"The unset local Stream var is read in every stone "+
	"except serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					brfSeesVar: undefined,
					brfGetsVar: undefined,
					bSeesVar: undefined,
					bGetsVar: undefined,
					vSeesVar: undefined,
					vGetsVar: undefined,
					pSeesVar: undefined,
					pGetsVar: undefined,
					brSeesVar: undefined,
					brGetsVar: undefined,
					sSeesVar: undefined,
					sGetsVar: undefined,
					seSeesVar: undefined,
					seGetsVar: undefined,
					fSeesVar: undefined,
					fGetsVar: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					beginRiverFlow:
					function( drop, opts, cb )
					{
						suite.setV( "brfSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "brfGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					begin:
					function( drop, cb )
					{
						suite.setV( "bSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "bGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					validate:
					function( drop, cb )
					{
						suite.setV( "vSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "vGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					prepare:
					function( drop, cb )
					{
						suite.setV( "pSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "pGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					branch:
					function( drop, cb )
					{
						suite.setV( "brSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "brGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					serve:
					function( drop, cb )
					{
						suite.setV( "sSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "sGetsVar", drop.get( "localVar" ) );
						
						throw new TestingError();
					},
					serveErr:
					function( drop, opts, cb )
					{
						suite.setV( "seSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "seGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					finish:
					function( drop, cb )
					{
						suite.setV( "fSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "fGetsVar", drop.get( "localVar" ) );
						
						var func = RiverTest.endDrop();
						
						func( drop, cb );
					}
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"beginRiverFlow can read the var",
			function()
			{
				if( this.getV( "getRiverTest.nrBranchings" ) === 0 )
				{
					Test.assert(
						this.getV( "brfSeesVar" ) === false &&
						this.getV( "brfGetsVar" ) === undefined
					);
				}
			},
			
			"begin can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "bSeesVar" ) === false &&
					this.getV( "bGetsVar" ) === undefined
				);
			},
			
			"validate can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "vSeesVar" ) === false &&
					this.getV( "vGetsVar" ) === undefined
				);
			},
			
			"prepare can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "pSeesVar" ) === false &&
					this.getV( "pGetsVar" ) === undefined
				);
			},
			
			"branch can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "brSeesVar" ) === false &&
					this.getV( "brGetsVar" ) === undefined
				);
			},
			
			"serve can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "sSeesVar" ) === false &&
					this.getV( "sGetsVar" ) === undefined
				);
			},
			
			"serveErr can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "seSeesVar" ) === false &&
					this.getV( "seGetsVar" ) === undefined
				);
			},
			
			"finish can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "fSeesVar" ) === false &&
					this.getV( "fGetsVar" ) === undefined
				);
			},
		]
	}),
	
	"The unset local Stream var is read in the stone serveFailure",
	RiverTest.getRiverTest(
	{
		vars:
		function()
		{
			return(
				{
					sfSeesVar: undefined,
					sfGetsVar: undefined
				}
			);
		},
		topicStream:
		function()
		{
			var suite = this;
			
			var firstStream =
			RiverTest.getStream(
				"FirstStream",
				{
					validate: RiverTest.failValidation(),
					serve: true,
					serveFailure:
					function( drop, cb )
					{
						suite.setV( "sfSeesVar", drop.isSet( "localVar" ) );
						suite.setV( "sfGetsVar", drop.get( "localVar" ) );
						
						cb();
					},
					finish: RiverTest.endDrop()
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"serveFailure can read the var set by previous stone",
			function()
			{
				Test.assert(
					this.getV( "sfSeesVar" ) === false &&
					this.getV( "sfGetsVar" ) === undefined
				);
			}
		]
	})
	
	]
},

"Stream that reads local Stream vars that are named the same "+
"as local Stream vars set by other Streams in the River",
{
	vars:
	{
		getLocalVarStream:
		getF(
			getA(
				"str",
				{
					types: "obj/undef",
					extraProps: false,
					props:
					{
						setVar: "str",
						getVars:
							{ types: "arr/undef", extraItems: "+str" }
						,
						getVarsRes: "obj/undef",
						branch:[ Stream, "undef" ],
						stack: "arr/undef",
						finish:
						{
							values:
							[
								"throwErr",
								"giveCbErr",
								"giveInvalidArgs",
								"endDrop",
								undefined
							]
						}
					}
				}
			),
			getR( Stream ),
			function( streamName, opts )
			{
				var branch = opts.branch;
				var setVar = opts.setVar;
				var getVars = opts.getVars;
				var getVarsRes = opts.getVarsRes;
				var stack = opts.stack;
				var finish = opts.finish;
				
				if(
					( getVars === undefined ) !==
						( getVarsRes === undefined )
				)
				{
					throw new TestRuntimeError(
						"In arg opts, both props getVars and "+
						"getVarsRes must be either undef or not",
						{ getVars: getVars, getVarsRes: getVarsRes }
					);
				}
				
				var branchName = undefined;
				var branches = undefined;
				if( branch !== undefined )
				{
					branchName = branch.getStreamName();
					branches = [ branch ];
				}
				
				var handleVars =
				getF(
					getA( Drop ),
					function( drop )
					{
						if( setVar !== undefined )
						{
							drop.set( setVar, "dingo" );
						}
						
						if( getVars !== undefined )
						{
							var varIsSet = false;
							
							for( item in getVars )
							{
								var varName = getVars[ item ];
								
								if(
									drop.isSet( varName ) === true ||
									drop.get( varName ) !== undefined
								)
								{
									varIsSet = true;
								}
							}
							
							getVarsRes.isSet = varIsSet;
						}
					}
				);
				
				var stream =
				RiverTest.getStream(
					streamName,
					{
						stack: stack,
						branches: branches,
						beginRiverFlow:
						function( drop, opts, cb )
						{
							handleVars( drop );
							
							cb();
						},
						begin:
						function( drop, cb )
						{
							handleVars( drop );
							
							cb();
						},
						validate:
						function( drop, cb )
						{
							handleVars( drop );
							
							cb();
						},
						prepare:
						function( drop, cb )
						{
							handleVars( drop );
							
							cb();
						},
						branch:
						function( drop, cb )
						{
							handleVars( drop );
							
							cb( undefined, branchName );
						},
						serve:
						function( drop, cb )
						{
							handleVars( drop );
							
							throw new TestingError(
								"This err was created for testing local Stream "+
								"vars",
								undefined,
								"TestingError"
							);
						},
						serveErr:
						function( drop, opts, cb )
						{
							handleVars( drop );
							
							cb();
						},
						finish:
						function( drop, cb )
						{
							handleVars( drop );
							
							if( finish === "endDrop" )
							{
								var func = RiverTest.endDrop();
								
								func( drop, cb );
								
								return;
							}
							else if( finish === "throwErr" )
							{
								throw new TestingError(
									"This err is for testing local Stream vars",
									undefined,
									"TestingError"
								);
							}
							else if( finish === "giveCbErr" )
							{
								cb(
									new TestingError(
										"This err is for testing local Stream vars",
										undefined,
										"TestingError"
									)
								);
								
								return;
							}
							else if( finish === "giveInvalidArgs" )
							{
								cb( undefined, true );
								
								return;
							}
							else
							{
								cb();
								
								return;
							}
						},
					}
				);
				
				return stream;
			}
		)
	},
	
	next:
	[
	
	"The Stream branches to the other Streams. Once the other "+
	"Streams are done the first Stream reads the local Stream "+
	"vars in stone finish",
	{
		next:
		[
		
		"The other Streams' stone finish are not faulty and end by "+
		"calling their cb's correctly",
		RiverTest.getRiverTest(
		{
			stack:
			[
				"FirstStream.begin",
				"FirstStream.validate",
				"FirstStream.prepare",
				"FirstStream.branch",
				"MiddleStream.begin",
				"MiddleStream.validate",
				"MiddleStream.prepare",
				"MiddleStream.branch",
				"LastStream.begin",
				"LastStream.validate",
				"LastStream.prepare",
				"LastStream.branch",
				"LastStream.serve",
				"LastStream.serveErr",
				{
					errClass: StreamError,
					errCode: "ErrAtServe",
					origErrClass: TestingError,
					origErrCode: "TestingError"
				},
				"LastStream.finish",
				"MiddleStream.finish",
				"FirstStream.finish"
			],
			vars:
			function()
			{
				return(
					{
						getVarsRes:{}
					}
				);
			},
			topicStream:
			function()
			{
				var getLocalVarStream = this.getV( "getLocalVarStream" );
				
				var lastStream =
				getLocalVarStream(
					"LastStream",
					{
						setVar: "lastVar",
						stack: this.getV( "getRiverTest.stack" )
					}
				);
				
				var middleStream =
				getLocalVarStream(
					"MiddleStream",
					{
						branch: lastStream,
						setVar: "middleVar",
						stack: this.getV( "getRiverTest.stack" )
					}
				);
				
				var firstStream =
				getLocalVarStream(
					"FirstStream",
					{
						branch: middleStream,
						getVars:[ "middleVar", "lastVar" ],
						getVarsRes: this.getV( "getVarsRes" ),
						stack: this.getV( "getRiverTest.stack" ),
						finish: "endDrop"
					}
				);
				
				return firstStream;
			},
			vows:
			[
				"The Stream cant read the other Streams' local vars "+
				"when it reads its own local vars",
				function()
				{
					Test.assert(
						this.getV( "getVarsRes" ).isSet === false
					);
				}
			]
		}),
		
		"There are three other Streams, and each of them has "+
		"incorrect stone finish that throws an err, gives a cb err "+
		"or provides invalid args to its cb",
		RiverTest.getRiverTest(
		{
			stack:
			[
				"FirstStream.begin",
				"FirstStream.validate",
				"FirstStream.prepare",
				"FirstStream.branch",
				"MiddleStream.begin",
				"MiddleStream.validate",
				"MiddleStream.prepare",
				"MiddleStream.branch",
				"LowerStream.begin",
				"LowerStream.validate",
				"LowerStream.prepare",
				"LowerStream.branch",
				"LastStream.begin",
				"LastStream.validate",
				"LastStream.prepare",
				"LastStream.branch",
				"LastStream.serve",
				"LastStream.serveErr",
				{
					errClass: StreamError,
					errCode: "ErrAtServe",
					origErrClass: TestingError,
					origErrCode: "TestingError"
				},
				"LastStream.finish",
				"LowerStream.finish",
				"MiddleStream.finish",
				"FirstStream.finish"
			],
			vars:
			function()
			{
				return { getVarsRes:{} };
			},
			topicStream:
			function()
			{
				var getLocalVarStream = this.getV( "getLocalVarStream" );
				
				var lastStream =
				getLocalVarStream(
					"LastStream",
					{
						setVar: "lastVar",
						stack: this.getV( "getRiverTest.stack" ),
						finish: "throwErr"
					}
				);
				
				var lowerStream =
				getLocalVarStream(
					"LowerStream",
					{
						branch: lastStream,
						setVar: "lowerVar",
						stack: this.getV( "getRiverTest.stack" ),
						finish: "giveCbErr"
					}
				);
				
				var middleStream =
				getLocalVarStream(
					"MiddleStream",
					{
						branch: lowerStream,
						setVar: "middleVar",
						stack: this.getV( "getRiverTest.stack" ),
						finish: "giveInvalidArgs"
					}
				);
				
				var firstStream =
				getLocalVarStream(
					"FirstStream",
					{
						branch: middleStream,
						getVars:[ "middleVar", "lowerVar", "lastVar" ],
						getVarsRes: this.getV( "getVarsRes" ),
						stack: this.getV( "getRiverTest.stack" ),
						finish: "endDrop"
					}
				);
				
				return firstStream;
			},
			vows:
			[
				"The Stream cant read the other Streams' local vars "+
				"when it reads its own local vars",
				function()
				{
					Test.assert(
						this.getV( "getVarsRes" ).isSet === false
					);
				}
			]
		})
		
		]
	},
	
	"The other Streams branch to the Stream that reads the local "+
	"Stream vars in every stone except serveFailure",
	RiverTest.getRiverTest(
	{
		stack:
		[
			"FirstStream.begin",
			"FirstStream.validate",
			"FirstStream.prepare",
			"FirstStream.branch",
			"MiddleStream.begin",
			"MiddleStream.validate",
			"MiddleStream.prepare",
			"MiddleStream.branch",
			"LastStream.begin",
			"LastStream.validate",
			"LastStream.prepare",
			"LastStream.branch",
			"LastStream.serve",
			"LastStream.serveErr",
			{
				errClass: StreamError,
				errCode: "ErrAtServe",
				origErrClass: TestingError,
				origErrCode: "TestingError"
			},
			"LastStream.finish",
			"MiddleStream.finish",
			"FirstStream.finish"
		],
		vars:
		function()
		{
			return(
				{
					getVarsRes:{}
				}
			);
		},
		topicStream:
		function()
		{
			var getLocalVarStream = this.getV( "getLocalVarStream" );
			
			var lastStream =
			getLocalVarStream(
				"LastStream",
				{
					getVars:[ "firstVar", "middleVar" ],
					getVarsRes: this.getV( "getVarsRes" ),
					stack: this.getV( "getRiverTest.stack" )
				}
			);
			
			var middleStream =
			getLocalVarStream(
				"MiddleStream",
				{
					branch: lastStream,
					setVar: "middleVar",
					stack: this.getV( "getRiverTest.stack" )
				}
			);
			
			var firstStream =
			getLocalVarStream(
				"FirstStream",
				{
					branch: middleStream,
					setVar: "firstVar",
					stack: this.getV( "getRiverTest.stack" ),
					finish: "endDrop"
				}
			);
			
			return firstStream;
		},
		vows:
		[
			"The Stream cant read the other Streams' local vars "+
			"when it reads its own local vars",
			function()
			{
				Test.assert( this.getV( "getVarsRes" ).isSet === false );
			}
		]
	})
	
	]
}

]);

return suite;

}]

});

var riverTest = new RiverTest();

var suite = riverTest.getSuite();

suite.run();

});
