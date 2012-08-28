ourglobe.require(
[
	"ourglobe/dual/testing/suiteruntimeerror",
	"ourglobe/dual/testing/testruntimeerror",
	"ourglobe/dual/testing/testingerror",
	"ourglobe/dual/testing/test",
	"ourglobe/dual/testing/suiteholder",
	"ourglobe/dual/testing/suiterun",
	"ourglobe/dual/testing/cbstep"
],
function( mods )
{

debugger;

var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var TestRuntimeError = mods.get( "testruntimeerror" );
var TestingError = mods.get( "testingerror" );
var test = mods.get( "test" );
var expectErr = test.expectErr;
var assert = test.assert;
var SuiteHolder = mods.get( "suiteholder" );
var SuiteRun = mods.get( "suiterun" );
var CbStep = mods.get( "cbstep" );

var expectCbErr =
function( testName, errClass, errFunc, refFunc )
{
	return(
		test.expectCbErr(
			testName,
			errClass,
			CbStep.DEFAULT_CB_TIMEOUT + 1000,
			errFunc,
			refFunc
		)
	);
}

var testSuiteRun =
function( name, suiteHolder, cbTime, cb )
{
	if( arguments.length < 3 || arguments.length > 4 )
	{
		throw new TestRuntimeError(
			"Between three and four args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( cbTime instanceof Function === true && cb === undefined )
	{
		cb = cbTime;
		cbTime = CbStep.DEFAULT_CB_TIMEOUT + 1000;
	}
	
	if( typeof( name ) !== "string" )
	{
		throw new TestRuntimeError( "Arg name must be a string" );
	}
	
	if( suiteHolder instanceof SuiteHolder === false )
	{
		throw new TestRuntimeError(
			"Arg suiteHolder must be a SuiteHolder"
		);
	}
	
	if( cb instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg cb must be a func"
		);
	}
	
	var suiteRun = new SuiteRun( suiteHolder );
	
	var cbCalled = false;
	
	console.log( name );
	
	var errPrefix = "An err occurred when testing '"+name+"':\n";
	
	try
	{
	
	suiteRun.run(
	function( err, res )
	{
		if( err !== undefined )
		{
			throw new TestRuntimeError(
				errPrefix + err.message, { occurredErr: err }
			);
		}
		
		if( cbCalled === true )
		{
			throw new TestRuntimeError(
				errPrefix+
				"The cb given to SuiteRun.run() has been called twice",
				{ providedArgs: arguments }
			);
		}
		
		cbCalled = true;
		
		try
		{
			cb( suiteRun );
		}
		catch( e )
		{
			throw new TestRuntimeError(
				errPrefix + e.message, { occurredErr: e }
			);
		}
	});
	
	}
	catch( e )
	{
		throw new TestRuntimeError(
			errPrefix + e.message, { occurredErr: e }
		);
	}
	
	setTimeout(
		function()
		{
			if( cbCalled === false )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to SuiteRun.run() hasnt been called"
				);
			}
		},
		cbTime
	);
};

testSuiteRun(
	"healthy topic with single vow",
	new SuiteHolder(
		"dingo",
		{
			topic: function() { return "dango"; },
			argsVer: [ "str" ],
			vows:[ "dongo", function( dango ) { } ]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.thrownErr === undefined &&
			run.topic.err === undefined &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dango" &&
			run.vows.length === 1 &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic with healthy and faulty vow",
	new SuiteHolder(
		"suite",
		{
			topic: function() { return "dango"; },
			argsVer: [ "str" ],
			vows:
			[
				"dongo",
				function( dango )
				{
				},
				"dengo",
				function( dango )
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.thrownErr === undefined &&
			run.topic.err === undefined &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dango" &&
			run.vows.length === 2 &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 1 ].err.constructor === TestingError,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topic with faulty vow",
	new SuiteHolder(
		"suite",
		{
			topic: function() { throw new TestingError(); },
			argsVer: getV().setE( "any" ),
			vows:[
				"dongo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.thrownErr === undefined &&
			run.topic.result === undefined &&
			run.vows.length === 1 &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topic (tries to getCb()) with faulty vow",
	new SuiteHolder(
		"suite",
		{
			topic: function() { this.getCb(); },
			argsVer: getV().setE( "any" ),
			vows:[
				"dongo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.err instanceof Error === true &&
			run.topic.thrownErr === undefined &&
			run.topic.result === undefined &&
			run.vows.length === 1 &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb (tries to return var) with faulty vow",
	new SuiteHolder(
		"suite",
		{
			topicCb: function() { return "dingo" },
			argsVer: getV().setE( "any" ),
			vows:[
				"dongo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.vows.length === 1 &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined
			,
			"run result is invalid"
		);
	}
);

var alphaVowArgsOne = undefined;
var alphaVowArgsTwo = undefined;

testSuiteRun(
	"healthy topicCb giving no args and args received by "+
	"two vows",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb();
			},
			argsVer: [],
			vows:[
				"dingo",
				function()
				{
					alphaVowArgsOne = arguments;
				},
				"dango",
				function()
				{
					alphaVowArgsTwo = arguments;
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.result.length === 0 &&
			run.topic.thrownErr === undefined &&
			run.vows[ 0 ].stepOk === true &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 1 ].stepOk === true &&
			run.vows[ 1 ].err === undefined &&
			alphaVowArgsOne.length === 0 &&
			alphaVowArgsTwo.length === 0,
			"run result is invalid"
		);
	}
);

var betaVowArgsOne = undefined;
var betaVowArgsTwo = undefined;

testSuiteRun(
	"healthy topicCb giving four args and args received "+
	"by two vows",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb( "dingo", "dango", "dongo", "dingi" );
			},
			argsVer: [ "str", "str", "str", "str" ],
			vows:[
				"dingo",
				function()
				{
					betaVowArgsOne = arguments;
				},
				"dango",
				function()
				{
					betaVowArgsTwo = arguments;
				}
			]
		}
	),
	function( run )
	{
		var res = run.topic.result;
		var argsOne = betaVowArgsOne;
		var argsTwo = betaVowArgsTwo;
		
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.thrownErr === undefined &&
			run.vows[ 0 ].stepOk === true &&
			run.vows[ 1 ].stepOk === true &&
			run.vows[ 0 ].err === undefined &&
			run.vows[ 1 ].err === undefined &&
			res.length === 4 &&
			betaVowArgsOne.length === 4 &&
			betaVowArgsTwo.length === 4 &&
			res[ 0 ] === "dingo" &&
			argsOne[ 0 ] === "dingo" &&
			argsTwo[ 0 ] === "dingo" &&
			res[ 1 ] === "dango" &&
			argsOne[ 1 ] === "dango" &&
			argsTwo[ 1 ] === "dango" &&
			res[ 2 ] === "dongo" &&
			argsOne[ 2 ] === "dongo" &&
			argsTwo[ 2 ] === "dongo" &&
			res[ 3 ] === "dingi" &&
			argsOne[ 3 ] === "dingi" &&
			argsTwo[ 3 ] === "dingi",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with call cb() and with faulty vow "+
	"and healthy vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb();
			},
			argsVer: [],
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				},
				"dango",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.vows[ 0 ].stepOk === false &&
			run.vows[ 0 ].err.constructor === TestingError &&
			run.vows[ 1 ].stepOk === true &&
			run.vows[ 1 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb (err via cb) with faulty vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb( new TestingError() );
			},
			argsVer: getV().setE( "any" ),
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.thrownErr === undefined &&
			run.topic.cbErr === undefined &&
			run.topic.result === undefined &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb() and with "+
	"faulty vow and healthy vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb();
					},
					100
				);
			},
			argsVer: [],
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				},
				"dango",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.result.length === 0 &&
			run.vows[ 0 ].stepOk === false &&
			run.vows[ 0 ].err.constructor === TestingError &&
			run.vows[ 1 ].stepOk === true &&
			run.vows[ 1 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb (err via delayed cb) with faulty vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb( new TestingError() );
					},
					100
				);
			},
			argsVer: getV().setE( "any" ),
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with err and bool via cb and faulty vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb( new TestingError(), true );
			},
			argsVer: getV().setE( "any" ),
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.result === undefined &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with err and bool via delayed cb and "+
	"faulty cancelled vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb( new TestingError(), true );
					},
					100
				);
			},
			argsVer: getV().setE( "any" ),
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with cb(err) followed by "+
	"throwing an err and faulty cancelled vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb( new TestingError( undefined, undefined, "cbErr" ) );
				
				throw new TestingError(
					undefined, undefined, "thrownErr"
				);
			},
			argsVer: getV().setE( "any" ),
			vows:[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.err.ourGlobeCode === "thrownErr" &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with thrown err followed by delayed "+
	"cb(err) and faulty cancelled vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb(
							new TestingError( undefined, undefined, "cbErr" )
						);
					},
					100
				);
				
				throw new TestingError(
					undefined, undefined, "thrownErr"
				);
			},
			argsVer: getV().setE( "any" ),
			vows:
			[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.err.ourGlobeCode === "thrownErr" &&
			run.vows[ 0 ].stepOk === undefined &&
			run.vows[ 0 ].err === undefined,
			"run result is invalid"
		);
	}
);

expectCbErr(
	"faulty topicCb with double call to cb() (expecting err) and "+
	"another faulty topicCb with calls to cb(err) and "+
	"delayed cb() (expecting no errors)",
	SuiteRuntimeError,
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
						
						cb();
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						cb( err );
					}
				}
			)
		;
	},
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb( new TestingError() );
						
						setTimeout(
							function()
							{
								cb();
							},
							100
						);
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run( cb )
		;
	}
);

expectCbErr(
	"faulty topicCb calling direct cb(err) and direct cb() "+
	"(expecting err) and another faulty topicCb calling cb(err) "+
	"and cb(err) (expecting no errors)",
	SuiteRuntimeError,
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb( new TestingError() );
						
						cb();
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						cb( err );
					}
				}
			)
		;
	},
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb( new TestingError() );
						
						setTimeout(
							function()
							{
								cb( new TestingError() );
							},
							100
						);
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run( cb )
		;
	}
);

expectCbErr(
	"faulty topicCb with double call to delayed cb() "+
	"(expecting err) and another faulty topicCb throwing err and "+
	"calling delayed cb() (expecting no err)",
	SuiteRuntimeError,
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						setTimeout(
							function()
							{
								cb();
							},
							100
						);
						
						setTimeout(
							function()
							{
								cb();
							},
							200
						);
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						cb( err );
					}
				}
			)
		;
	},
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						setTimeout(
							function()
							{
								cb();
							},
							100
						);
						
						throw new TestingError();
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run( cb )
		;
	}
);

testSuiteRun(
	"faulty topicCb with no call to cb() and faulty "+
	"cancelled vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
			},
			argsVer: getV().setE( "any" ),
			vows:
			[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with no call to cb() within timeout limit "+
	"and delayed call cb() and cb(err) and faulty cancelled vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb();
						cb( new TestingError() );
					},
					CbStep.DEFAULT_CB_TIMEOUT+100
				);
			},
			argsVer: getV().setE( "any" ),
			vows:
			[
				"dingo",
				function()
				{
					throw new TestingError();
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic that returns undef and upholds argsVer",
	new SuiteHolder(
		"suite",
		{
			topic:
			function()
			{
			},
			argsVer: [ "undef" ],
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === undefined &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic that returns 'dingo' and upholds argsVer",
	new SuiteHolder(
		"suite",
		{
			topic:
			function()
			{
				return "dingo";
			},
			argsVer: getV( [ { values:[ "dingo" ] } ] ),
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dingo" &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic that returns 'dingo' and doesnt uphold argsVer",
	new SuiteHolder(
		"suite",
		{
			topic:
			function()
			{
				return "dingo";
			},
			argsVer: getV( [ { values:[ "dengo" ] } ] ),
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ] === "dingo" &&
			run.argsVer.stepOk === false &&
			run.argsVer.err.constructor === SuiteRuntimeError &&
			run.argsVer.err.ourGlobeCode === "ArgsAreNotValid" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb() that upholds argsVer",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb();
					},
					100
				);
			},
			argsVer: getV( [ "str" ] ).addA(),
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb('dingo',42,true) that "+
	"upholds argsVer with multiple args",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb( "dingo", 42, true );
					},
					100
				);
			},
			argsVer: getV( [ "str" ] ).addA( "str", "int", "bool" ),
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb('dengo') that fails "+
	"argsVer with multiple args",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb( "dengo" );
					},
					100
				);
			},
			argsVer: getV( [] ).addA( "int" ).addA( "bool" ),
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === false &&
			run.argsVer.err.constructor === SuiteRuntimeError &&
			run.argsVer.err.ourGlobeCode === "ArgsAreNotValid" &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topic and vow with no argsVer",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				verifyArgs: false
			},
			topic:
			function()
			{
				return "dingo";
			},
			argsVer: undefined,
			vows:
			[
				"dingo",
				function()
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.argsVer.stepOk === true &&
			run.argsVer.err === undefined &&
			run.vows[ 0 ].stepOk === true,
			"run result is invalid"
		);
	}
);

expectErr(
	"SuiteRun given faulty cb and topicCb with direct call of cb "+
	"(expecting err) and SuiteRun given healthy cb "+
	"(expecting no err)",
	TestingError,
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						throw err;
					}
					
					throw new TestingError();
				}
			)
		;
	},
	function()
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						cb();
					},
					argsVer:[],
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						throw err;
					}
				}
			)
		;
	}
);

var charlieVowArgs = undefined;

testSuiteRun(
	"faulty topic allowed to throw err with healthy vow",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowThrownErr: true
			},
			topic:
			function()
			{
				throw new TestingError();
			},
			argsVer:[ TestingError ],
			vows:
			[
				"dingo",
				function( err )
				{
					charlieVowArgs = arguments;
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.thrownErr.constructor === TestingError &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ].constructor === TestingError &&
			run.argsVer.stepOk === true &&
			run.vows[ 0 ].stepOk === true &&
			charlieVowArgs.length === 1 &&
			charlieVowArgs[ 0 ].constructor === TestingError,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topic allowed to throw err but fails argsVer",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowThrownErr: true
			},
			topic:
			function()
			{
				throw new TestingError();
			},
			argsVer:[ "undef" ],
			vows:
			[
				"dingo",
				function( err )
				{
					
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.thrownErr.constructor === TestingError &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ].constructor === TestingError &&
			run.argsVer.stepOk === false &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

var deltaVowArgs = undefined;

testSuiteRun(
	"faulty topicCb allowed to pass err to cb and healthy vow",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowCbErr: true
			},
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb( new TestingError() );
					},
					100
				);
			},
			argsVer:[ [ TestingError ] ],
			vows:
			[
				"dingo",
				function( err )
				{
					deltaVowArgs = arguments;
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === true &&
			run.topic.stepOk === true &&
			run.topic.err === undefined &&
			run.topic.cbErr.constructor === TestingError &&
			run.topic.result.length === 1 &&
			run.topic.result[ 0 ].constructor === TestingError &&
			run.argsVer.stepOk === true &&
			run.vows[ 0 ].stepOk === true &&
			deltaVowArgs.length === 1 &&
			deltaVowArgs[ 0 ].constructor === TestingError,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb throws allowed err and calls cb",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowThrownErr: true
			},
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb();
				
				throw new TestingError();
			},
			argsVer: getV().addA( TestingError ).addA(),
			vows:
			[
				"dingo",
				function( err )
				{
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "ErrThrownAndCbCalled" &&
			run.topic.result === undefined &&
			run.topic.thrownErr === undefined &&
			run.topic.cbErr === undefined &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

expectCbErr(
	"faulty topicCb allowed to throw err but calls delayed cb "+
	"too (expecting err) and faulty topicCb throws unallowed err",
	SuiteRuntimeError,
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					conf:
					{
						allowThrownErr: true
					},
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						setTimeout(
							function()
							{
								cb();
							},
							100
						);
						
						throw new TestingError();
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run(
				function( err )
				{
					if( err !== undefined )
					{
						cb( err );
					}
				}
			)
		;
	},
	function( cb )
	{
		new SuiteRun(
			new SuiteHolder(
				"suite",
				{
					topicCb:
					function()
					{
						var cb = this.getCb();
						
						setTimeout(
							function()
							{
								cb();
							},
							100
						);
						
						throw new TestingError();
					},
					argsVer: getV().setE( "any" ),
					vows:
					[
						"dingo",
						function() {}
					]
				}
			)
		)
			.run( cb )
		;
	}
);

testSuiteRun(
	"faulty topicCb allowed to throw err but instead gives err "+
	"to cb and healthy vow",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowThrownErr: true
			},
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				setTimeout(
					function()
					{
						cb( new TestingError() );
					},
					100
				);
			},
			argsVer:[ TestingError ],
			vows:
			[
				"dingo", function() { }
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.result === undefined &&
			run.topic.cbErr === undefined &&
			run.topic.thrownErr === undefined &&
			run.argsVer.stepOk === undefined &&
			run.vows[ 0 ].stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb allowed to give err to cb but instead "+
	"throws err and healthy vow",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowCbErr: true
			},
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb( new TestingError( undefined, undefined, "cbErr" ) );
				
				throw new TestingError(
					undefined, undefined, "thrownErr"
				);
			},
			argsVer:[ TestingError ],
			vows:
			[
				"dingo", function() { }
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === TestingError &&
			run.topic.err.ourGlobeCode === "thrownErr" &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb allowed to throw and give err to cb but "+
	"never calls cb and healthy vow",
	new SuiteHolder(
		"suite",
		{
			conf:
			{
				allowThrownErr: true,
				allowCbErr: true
			},
			topicCb:
			function()
			{
			},
			argsVer: getV().setE( "any" ),
			vows:
			[
				"dingo", function() { }
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.topic.stepOk === false &&
			run.topic.err.constructor === SuiteRuntimeError &&
			run.topic.err.ourGlobeCode === "SuiteStepCbNotCalled" &&
			run.argsVer.stepOk === undefined,
			"run result is invalid"
		);
	}
);

});
