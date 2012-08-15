ourglobe.require(
[
	"ourglobe/dual/testing",
	"ourglobe/dual/testing/suiteholder",
	"ourglobe/dual/testing/suiterun"
],
function( mods )
{

debugger;

var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "testing" ).SuiteRuntimeError;
var TestRuntimeError = mods.get( "testing" ).TestRuntimeError;
var TestingError = mods.get( "testing" ).TestingError;
var test = mods.get( "testing" ).Test;
var expectErr = test.expectErr;
var assert = test.assert;
var SuiteHolder = mods.get( "suiteholder" );
var SuiteRun = mods.get( "suiterun" );

var expectCbErr =
function( errClass, errFunc, refFunc )
{
	return(
		test.expectCbErr(
			errClass,
			SuiteRun.DEFAULT_CB_TIMEOUT + 2000,
			errFunc,
			refFunc
		)
	);
}

var throwErr = 
function( name, err )
{
	console.log( "An err occurred when testing '"+name+"':\n" );
	throw err;
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
		cbTime = SuiteRun.DEFAULT_CB_TIMEOUT + 1000;
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
	
	try
	{
	
	suiteRun.run(
	undefined,
	function( err, res )
	{
		if( err !== undefined )
		{
			throwErr( name, err );
		}
		
		if( cbCalled === true )
		{
			throwErr(
				name,
				new TestRuntimeError(
					"The cb given to SuiteRun.run() has been called twice",
					{ providedArgs: arguments }
				)
			);
		}
		
		cbCalled = true;
		
		try
		{
			cb( res );
		}
		catch( e )
		{
			throwErr( name, e );
		}
	});
	
	}
	catch( e )
	{
		throwErr( name, e );
	}
	
	setTimeout(
		function()
		{
			if( cbCalled === false )
			{
				throwErr(
					name,
					new TestRuntimeError(
						"The cb given to SuiteRun.run() hasnt been called"
					)
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ] === "dango" &&
			run.steps.argsVer.status === "done" &&
			run.steps.topic.error === undefined &&
			run.steps.vows.status === "done" &&
			run.steps.vows.vows === undefined,
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
					if( dango !== "dango" )
					{
						throw new TestingError();
					}
				},
				"dengo",
				function( dango )
				{
					if( dango === "dango" )
					{
						throw new TestingError();
					}
				}
			]
		}
	),
	function( run )
	{
		assert(
			run.runOk === false &&
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ] === "dango" &&
			run.steps.topic.error === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "failed" &&
			Object.keys( run.steps.vows.vows ).length === 1 &&
			run.steps.vows.vows.dengo.error.constructor ===
				TestingError
			,
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === false &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === SuiteRuntimeError &&
			run.steps.topic.result[ 0 ].constructor ===
				SuiteRuntimeError
			&&
			run.steps.topic.errByCb === false &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === SuiteRuntimeError &&
			run.steps.topic.result === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 0 &&
			run.steps.topic.error === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "done" &&
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
				
				cb( undefined, "dingo", "dango", "dongo", "dingi" );
			},
			argsVer:[ "undef", "str", "str", "str", "str" ],
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
		var res = run.steps.topic.result;
		var argsOne = betaVowArgsOne;
		var argsTwo = betaVowArgsTwo;
		
		assert(
			run.runOk === true &&
			run.steps.topic.status === "done" &&
			run.steps.topic.error === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "done" &&
			res.length === 5 &&
			argsOne.length === 5 &&
			argsTwo.length === 5 &&
			res[ 0 ] === undefined &&
			argsOne[ 0 ] === undefined &&
			argsTwo[ 0 ] === undefined &&
			res[ 1 ] === "dingo" &&
			argsOne[ 1 ] === "dingo" &&
			argsTwo[ 1 ] === "dingo" &&
			res[ 2 ] === "dango" &&
			argsOne[ 2 ] === "dango" &&
			argsTwo[ 2 ] === "dango" &&
			res[ 3 ] === "dongo" &&
			argsOne[ 3 ] === "dongo" &&
			argsTwo[ 3 ] === "dongo" &&
			res[ 4 ] === "dingi" &&
			argsOne[ 4 ] === "dingi" &&
			argsTwo[ 4 ] === "dingi",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.error === undefined &&
			run.steps.topic.result.length === 0 &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "failed" &&
			Object.keys( run.steps.vows.vows ).length === 1 &&
			run.steps.vows.vows.dingo.error.constructor ===
				TestingError
			,
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ].constructor ===
				TestingError
			&&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.error === undefined &&
			run.steps.topic.result.length === 0 &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "failed" &&
			Object.keys( run.steps.vows.vows ).length === 1 &&
			run.steps.vows.vows.dingo.error.constructor ===
				TestingError
			,
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ].constructor ===
				TestingError
			&&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with err and bool via cb and faulty "+
	"vow",
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.topic.result.length === 2 &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.topic.result[ 1 ] === true &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with err and bool via delayed cb and "+
	"faulty vow",
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.topic.result.length === 2 &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.topic.result[ 1 ] === true &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with the calls cb(err) and cb() and "+
	"faulty cancelled vow",
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"faulty topicCb with the calls cb(err) and cb(err) "+
	"and faulty cancelled vow",
	new SuiteHolder(
		"suite",
		{
			topicCb:
			function()
			{
				var cb = this.getCb();
				
				cb( new TestingError() );
				
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
				
				cb( new TestingError() );
				
				throw new TestingError();
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === true &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
						cb( new TestingError() );
					},
					100
				);
				
				throw new TestingError();
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === TestingError &&
			run.steps.topic.errByCb === false &&
			run.steps.topic.result[ 0 ].constructor === TestingError &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
			"run result is invalid"
		);
	}
);

console.log(
	"faulty topicCb with double call to cb() (expecting err) and "+
	"another faulty topicCb with calls to cb(err) and cb() "+
	"(expecting no errors)"
);

expectCbErr(
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
				undefined,
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
			.run( undefined, cb )
		;
	}
);

console.log(
	"faulty topicCb calling cb() and cb(err) (expecting err) and "+
	"another faulty topicCb calling cb(err) and cb(err) "+
	"(expecting no errors)"
);

expectCbErr(
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
						
						cb( new TestingError() );
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
				undefined,
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
						
						cb( new TestingError() );
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
			.run( undefined, cb )
		;
	}
);

console.log(
	"faulty topicCb calling cb() and throwing err "+
	"(expecting err) and another faulty topicCb throwing err and "+
	"calling delayed cb() (expecting no err)"
);

expectCbErr(
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
				undefined,
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
			.run( undefined, cb )
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === SuiteRuntimeError &&
			run.steps.topic.errByCb === undefined &&
			run.steps.topic.result === undefined &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
					SuiteRun.DEFAULT_CB_TIMEOUT+1000
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
			run.steps.topic.status === "failed" &&
			run.steps.topic.error.constructor === SuiteRuntimeError &&
			run.steps.topic.result === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "cancelled" &&
			run.steps.vows.status === "cancelled",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 1 &&
			"0" in run.steps.topic.result === true &&
			run.steps.topic.result[ 0 ] === undefined &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "done",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result[ 0 ] === "dingo" &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "done",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result[ 0 ] === "dingo" &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "failed" &&
			run.steps.argsVer.error.constructor ===
				SuiteRuntimeError
			&&
			run.steps.vows.status === "cancelled",
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 0 &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "done",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb(undef,'dingo',42,true) "+
	"that upholds argsVer with multiple args",
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
						cb( undefined, "dingo", 42, true );
					},
					100
				);
			},
			argsVer:
				getV( [ "str" ] ).addA( "undef", "str", "int", "bool" ),
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 4 &&
			run.steps.topic.result[ 0 ] === undefined &&
			run.steps.topic.result[ 1 ] === "dingo" &&
			run.steps.topic.result[ 2 ] === 42 &&
			run.steps.topic.result[ 3 ] === true &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.vows.status === "done",
			"run result is invalid"
		);
	}
);

testSuiteRun(
	"healthy topicCb with delayed call cb(undef,'dengo') that "+
	"fails argsVer with multiple args",
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
						cb( undefined, "dengo" );
					},
					100
				);
			},
			argsVer:
				getV( [] )
					.addA( "undef", "int" )
					.addA( "undef", "bool" )
			,
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 2 &&
			run.steps.topic.result[ 0 ] === undefined &&
			run.steps.topic.result[ 1 ] === "dengo" &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "failed" &&
			run.steps.argsVer.error.constructor ===
				SuiteRuntimeError
			&&
			run.steps.vows.status === "cancelled",
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
				verArgs: false
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
			run.steps.topic.status === "done" &&
			run.steps.topic.result.length === 1 &&
			run.steps.topic.result[ 0 ] === "dingo" &&
			run.steps.topic.error === undefined &&
			run.steps.topic.errByCb === undefined &&
			run.steps.argsVer.status === "done" &&
			run.steps.argsVer.error === undefined &&
			run.steps.vows.status === "done",
			"run result is invalid"
		);
	}
);

console.log(
	"SuiteRun given faulty cb and topicCb with direct call of cb "+
	"(expecting err) and SuiteRun given healthy cb "+
	"(expecting no err)"
);

expectErr(
	SuiteRuntimeError,
	function( e )
	{
		assert(
			e.ourGlobeVar.thrownErr !== undefined &&
			e.ourGlobeVar.thrownErr.__proto__ ===
				TestingError.prototype
			,
			"the err isnt as expected"
		)
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
				undefined,
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
				undefined,
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

});
