ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./suiteholder"
],
function( mods )
{

var TestRuntimeError = undefined;
var SuiteHolder = undefined;

mods.delay(
	function()
	{
		TestRuntimeError = mods.get( "testruntimeerror" );
		SuiteHolder = mods.get( "suiteholder" );
	}
);

var SuiteRun =
function( suiteHolder )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided"
		);
	}
	
	if( suiteHolder instanceof SuiteHolder === false )
	{
		throw new TestRuntimeError(
			"Arg suiteHolder must be a SuiteHolder"
		);
	}
	
	this.suiteHolder = suiteHolder;
	
	this.cbSteps = {};
	
	this.cbSteps.topicCb = {};
	this.cbSteps.topicCb.callDone = false;
	this.cbSteps.topicCb.storedErr = undefined;
	this.cbSteps.topicCb.timerId = undefined;
	
	this.steps = {};
	
	this.steps.topic = {};
	this.steps.topic.status = undefined;
	this.steps.topic.result = undefined;
	this.steps.topic.error = undefined;
	this.steps.topic.errByCb = undefined;
	
	this.steps.argsVer = {};
	this.steps.argsVer.status = undefined;
	this.steps.argsVer.error = undefined;
	
	this.steps.vows = {};
	this.steps.vows.status = undefined;
	this.steps.vows.vows = undefined;
	
	this.suiteRunCb = undefined;
	this.runOk = undefined;
};

SuiteRun.DEFAULT_CB_TIMEOUT = 1000;

return SuiteRun;

},
function( mods, SuiteRun )
{

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

SuiteRun.prototype.runArgsVer =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	var resultIsValid = true;
	var argsVer = this.suiteHolder.argsVer;
	
	if( argsVer !== undefined )
	{
		resultIsValid =
			argsVer.argsAreValid( this.steps.topic.result )
		;
	}
	
	
	this.markStepDone( "argsVer", resultIsValid );
	
	if( resultIsValid === false )
	{
		this.steps.argsVer.error =
			new SuiteRuntimeError(
				"The args that topic/topicCb were to give to vows/next "+
				"werent approved by the FuncVer of the Suite prop "+
				"'argsVer'"
			)
		;
		
		this.suiteRunCb( undefined, this );
		
		return;
	}
	
	this.runVows();
};

SuiteRun.prototype.handleCbErrs =
function( step, err )
{
	if( arguments.length < 1 || arguments.length > 2 )
	{
		throw new TestRuntimeError(
			"Between one and two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( step !== "topicCb" )
	{
		throw new TestRuntimeError(
			"Arg step must be 'topicCb'", { step: step }
		);
	}
	
	if( err !== undefined && err instanceof Error === false )
	{
		throw new TestRuntimeError(
			"Arg err must be undef or an err", { err: err }
		);
	}
	
	if( err === undefined )
	{
		this.cbSteps[ step ].callDone = true;
		
		var storedErr = this.cbSteps[ step ].storedErr;
		
		if( storedErr !== undefined )
		{
			throw new SuiteRuntimeError(
				"An error was thrown during the call of the cb of '"+
				step+"' of the Suite '"+this.suiteHolder.name+"': "+
				storedErr.message,
				{ thrownErr: storedErr },
				"ErrorInCbCallOfTopicCb"
			);
		}
	}
	else if( this.cbSteps[ step ].callDone === false )
	{
		if( this.cbSteps[ step ].storedErr === undefined )
		{
			this.cbSteps[ step ].storedErr = err;
		}
	}
	else
	{
		throw err;
	}
};

SuiteRun.prototype.markStepDone =
function( step, succeeded )
{
	if( arguments.length < 1 || arguments.length > 2 )
	{
		throw new TestRuntimeError(
			"Between one and two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( step !== "topic" && step !== "vows" && step !== "argsVer" )
	{
		throw new TestRuntimeError(
			"Arg step must be set to 'topic', 'vows' or 'argsVer'",
			{ step: step }
		);
	}
	
	if(
		succeeded !== undefined && typeof( succeeded ) !== "boolean"
	)
	{
		throw new TestRuntimeError(
			"Arg succeeded must be undef or a bool",
			{ succeeded: succeeded }
		);
	}
	
	if( succeeded === undefined )
	{
		succeeded = true;
	}
	
	if( succeeded === false )
	{
		this.runOk = false;
	}
	else if( step === "vows" )
	{
		this.runOk = true;
	}
	
	var stepStatus = succeeded === true ? "done" : "failed";
	var nextSteps = succeeded === true ? undefined : "cancelled";
	
	if( step === "topic" )
	{
		this.steps.topic.status = stepStatus;
		this.steps.argsVer.status = nextSteps;
		this.steps.vows.status = nextSteps;
		
		if( this.cbSteps.topicCb.timerId !== undefined )
		{
			clearTimeout( this.cbSteps.topicCb.timerId );
			
			this.cbSteps.topicCb.timerId = undefined;
		}
	}
	else if( step === "argsVer" )
	{
		this.steps.argsVer.status = stepStatus;
		this.steps.vows.status = nextSteps;
	}
	else if( step === "vows" )
	{
		this.steps.vows.status = stepStatus;
	}
};

SuiteRun.prototype.runVows =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	var suiteHolder = this.suiteHolder;
	
	var vowArgs = this.steps.topic.result;
	
	var vowObj = {};
	
	var vows = suiteHolder.vows;
	var failedVows = {};
	var vowFailed = false;
	
	if( vows !== undefined )
	{
		
// The vows are to be executed in the order that they were given
		for( var item = 0; item < vows.length; item++ )
		{
			var vowName = vows[ item ].key;
			var vow = vows[ item ].value;
			
			try
			{
				vow.apply( vowObj, vowArgs );
			}
			catch( e )
			{
				failedVows[ vowName ] = {};
				failedVows[ vowName ].error = e;
				vowFailed = true;
			}
		}
	}
	
	this.markStepDone( "vows", vowFailed === false );
	
	if( vowFailed === true )
	{
		this.steps.vows.vows = failedVows;
	}
	
	this.suiteRunCb( undefined, this );
};

SuiteRun.prototype.runTopic =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	var suiteRun = this;
	var suiteHolder = suiteRun.suiteHolder;
	
	var topicArgs = [];
	
	var topic = suiteHolder.topic;
	
	if( suiteHolder.topicCb !== undefined )
	{
		topic = suiteHolder.topicCb;
		
		this.cbSteps.topicCb.timerId =
		setTimeout(
			function()
			{
// It must be cleared otherwise an attempt is made to
// clearTimeout()
				suiteRun.cbSteps.topicCb.timerId = undefined;
				
				if( suiteRun.steps.topic.status === undefined )
				{
// This call was initiated by setTimeout() and so if 
// finishTopic() throws an err then it wont bubble up to the call
// of topicCb. Hence handleCbErrs() doesnt need to be used
					suiteRun.finishTopic(
						new SuiteRuntimeError(
							"The cb of topicCb hasnt been called within the "+
							"allowed time limit"
						),
						false,
						true,
						false
					);
				}
			},
			SuiteRun.DEFAULT_CB_TIMEOUT
		);
	}
	
	var topicObj =
	{
		getCb:
		function()
		{
			return suiteRun.getCb.apply( suiteRun, arguments );
		}
	};
	
	var err = undefined;
	
	try
	{
		topicReturn = topic.apply( topicObj, topicArgs );
	}
	catch( e )
	{
		err = e;
	}
	
	if( suiteHolder.topicCb !== undefined )
	{
		this.handleCbErrs( "topicCb" );
	}
	
	if( err !== undefined )
	{
		this.finishTopic( err, false, true, true );
		
		return;
	}
	
	if( suiteHolder.topic !== undefined )
	{
		this.finishTopic( topicReturn, false, false );
		
		return;
	}
	else if( topicReturn !== undefined )
	{
		this.finishTopic(
			new SuiteRuntimeError(
				"The func of Suite prop 'topicCb' may not return "+
				"a variable and must use the cb obtained by "+
				"this.getCb() to relay its final args to the vows "+
				"and/or the next Suites"
			),
			false,
			true,
			false
		);
		
		return;
	}
};

SuiteRun.prototype.finishTopic =
function( result, byCb, errOccurred, errFromTopic )
{
	if( arguments.length < 3 || arguments.length > 4 )
	{
		throw new TestRuntimeError(
			"Between three and four args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( typeof( errOccurred ) !== "boolean" )
	{
		throw new TestRuntimeError(
			"Arg errOccurred must be a bool",
			{ errOccurred: errOccurred }
		);
	}
	
	if( typeof( byCb ) !== "boolean" )
	{
		throw new TestRuntimeError(
			"Arg byCb must be a bool", { byCb: byCb }
		);
	}
	
	if(
		errFromTopic !== undefined &&
		typeof( errFromTopic ) !== "boolean"
	)
	{
		throw new TestRuntimeError(
			"Arg errFromTopic must be undef or a bool",
			{ errFromTopic: errFromTopic }
		);
	}
	
	if( byCb === true && this.suiteHolder.topicCb === undefined )
	{
		throw new TestRuntimeError(
			"If arg byCb is true then the Suite must have prop "+
			"topicCb set"
		);
	}
	
	if( byCb === true && result instanceof Array === false )
	{
		throw new TestRuntimeError(
			"If arg byCb is true then result must be an arr "+
			"consisting of the args given to the Suite by topicCb",
			{ result: result }
		);
	}
	
	if(
		errOccurred === true &&
		!(
			byCb === true && result[ 0 ] instanceof Error === true
		) &&
		!( byCb === false && result instanceof Error === true )
	)
	{
		throw new TestRuntimeError(
			"If arg errOccurred is true then the err that occurred "+
			"must be provided, either by arg result being the err "+
			"or result being an arr with the err as its first item",
			{ result: result }
		);
	}
	
	if( errOccurred === true && errFromTopic === undefined )
	{
		throw new TestRuntimeError(
			"Arg errFromTopic may not be undefined if an error has "+
			"occurred",
			{ errFromTopic: errFromTopic }
		);
	}
	
	if( this.steps.topic.status !== undefined )
	{
		if( this.steps.topic.status === "done" )
		{
			this.suiteRunCb(
				new SuiteRuntimeError(
					"If topicCb of a Suite is done (either by calling "+
					"its cb or throwing an err when this is allowed for "+
					"the topicCb) then it may not again call its cb nor "+
					"throw an error, but this has occurred for the Suite "+
					"named '"+this.suiteHolder.name+"'"
				)
			);
		}
		
		return;
	}
	
// allowTopicErrs is a reminder for future changes
	var allowTopicErrs = false;
	
	var suiteHolder = this.suiteHolder;
	
	if( byCb === false )
	{
		result = [ result ];
	}
	
	if(
		byCb === true &&
		result[ 0 ] !== undefined &&
		result[ 0 ] instanceof Error === false
	)
	{
		var err =
			new SuiteRuntimeError(
				"The first arg that topicCb passes on (via cb) must be "+
				"undef or an err",
				{ providedArgs: result }
			)
		;
		
		result = err;
		
		errOccurred = true;
		errFromTopic = false;
		byCb = false;
	}
	
	this.markStepDone(
		"topic",
		errOccurred === false ||
		( allowTopicErrs === true && errFromTopic === true )
	);
	
	if( errOccurred === false || errFromTopic === true )
	{
		this.steps.topic.result = result;
	}
	
	if( errOccurred === true )
	{
		this.steps.topic.error = result[ 0 ];
		
		if( errFromTopic === true )
		{
			this.steps.topic.errByCb = byCb;
		}
		
		this.suiteRunCb( undefined, this );
		
		return;
	}
	
	this.runArgsVer();
};

SuiteRun.prototype.getCb =
function()
{
	if( this.suiteHolder.topicCb === undefined )
	{
		throw new SuiteRuntimeError(
			"getCb() may only be used by suite prop 'topicCb' and "+
			"not by 'topic'"
		);
	}
	
	if( arguments.length !== 0 )
	{
		throw new SuiteRuntimeError( "No args may be provided" );
	}
	
	var suiteRun = this;
	
	return(
		function( err )
		{
			var errOccurred = err instanceof Error === true;
			var errFromTopic = errOccurred === true;
			
			try
			{
				suiteRun.finishTopic(
					Array.prototype.slice.call( arguments ),
					true,
					errOccurred,
					errFromTopic
				);
			}
			catch( e )
			{
				suiteRun.handleCbErrs( "topicCb", e );
			}
			
			return;
		}
	);
};

SuiteRun.prototype.run =
function( parentRun, cb )
{
	if( arguments.length !== 2 )
	{
		throw new TestRuntimeError(
			"Exactly two args must be provided"
		);
	}
	
	if(
		parentRun !== undefined &&
		parentRun instanceof SuiteRun === false
	)
	{
		throw new TestRuntimeError(
			"Arg parentRun must be undef or a SuiteRun",
			{ parentRun: parentRun }
		);
	}
	
	if( cb instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg cb must be a func", { cb: cb }
		);
	}
	
	
	this.suiteRunCb = cb;
	
	this.runTopic();
};

});
