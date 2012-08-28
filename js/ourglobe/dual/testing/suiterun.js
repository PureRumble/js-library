ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./suiteholder",
	"./suitestep",
	"./topic",
	"./topiccb",
	"./argsver",
	"./vow"
],
function( mods )
{

var TestRuntimeError = undefined;
var SuiteHolder = undefined;
var Topic = undefined;
var TopicCb = undefined;
var ArgsVer = undefined;
var Vow = undefined;

mods.delay(
	function()
	{
		TestRuntimeError = mods.get( "testruntimeerror" );
		SuiteHolder = mods.get( "suiteholder" );
		Topic = mods.get( "topic" );
		TopicCb = mods.get( "topiccb" );
		ArgsVer = mods.get( "argsver" );
		Vow = mods.get( "vow" );
	}
);

var SuiteRun =
function( suiteHolder, parentRun )
{
	if( arguments.length < 1 || arguments.length > 2 )
	{
		throw new TestRuntimeError(
			"Between one and two args must be provided",
			{ providedArgs: arguments }
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
	
	if( suiteHolder instanceof SuiteHolder === false )
	{
		throw new TestRuntimeError(
			"Arg suiteHolder must be a SuiteHolder"
		);
	}
	
	this.parentRun = parentRun;
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
	
	if( suiteHolder.topic !== undefined )
	{
		this.topic = new Topic( this );
	}
	else
	{
		this.topic = new TopicCb( this );
	}
	
	this.argsVer = new ArgsVer( this );
	
	this.vows = [];
	
	if( suiteHolder.vows !== undefined )
	{
		for( var item in suiteHolder.vows )
		{
			this.vows[ item ] = new Vow( this, item );
		}
	}
};

return SuiteRun;

},
function( mods, SuiteRun )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteStep = mods.get( "suitestep" );

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

SuiteRun.prototype.runArgsVer =
getF(
getV(),
function()
{
	var argsVerErr = undefined;
	var argsVerOk = undefined;
	
	this.argsVer.takeStep(
		getF(
		SuiteStep.TAKE_STEP_CB_FV,
		function( err, runOk )
		{
			argsVerErr = err;
			argsVerOk = runOk;
		})
	);
	
	if( argsVerErr !== undefined )
	{
		this.suiteRunCb( argsVerErr );
		
		return;
	}
	
	if( argsVerOk === false )
	{
		this.suiteRunCb( undefined, false );
		
		return;
	}
	
	this.runVows();
});

SuiteRun.prototype.runVows =
function()
{
	if( arguments.length !== 0 )
	{
		throw new TestRuntimeError(
			"No args may be provided", { providedArgs: arguments }
		);
	}
	
	var vowsOk = true;
	
	for( var item = 0; item < this.vows.length; item++ )
	{
		var vow = this.vows[ item ];
		
		var vowErr = undefined;
		var vowRunOk = undefined;
		
		vow.takeStep(
			getF(
			SuiteStep.TAKE_STEP_CB_FV,
			function( err, runOk )
			{
				vowErr = err;
				vowRunOk = runOk;
			})
		);
		
		if( vowErr !== undefined )
		{
			this.suiteRunCb( vowErr );
			
			return;
		}
		
		if( vowRunOk === false )
		{
			vowsOk = false;
		}
	}
	
	if( vowsOk === false )
	{
		this.suiteRunCb( undefined, false );
		
		return;
	}
	
	this.runOk = true;
	
	this.suiteRunCb( undefined, true );
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
	
	this.topic.takeStep(
		getF(
		SuiteStep.TAKE_STEP_CB_FV,
		function( err, stepOk )
		{
			if( err !== undefined )
			{
				suiteRun.suiteRunCb( err );
				
				return;
			}
			
			if( stepOk === false )
			{
				suiteRun.suiteRunCb( undefined, false );
				
				return;
			}
			
			suiteRun.runArgsVer();
		})
	);
};

SuiteRun.prototype.finishTopic =
function( err, result, byCb, errOccurred )
{
	if( arguments.length < 2 || arguments.length > 4 )
	{
		throw new TestRuntimeError(
			"Between two and four args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( err !== undefined && err instanceof Error === false )
	{
		throw new TestRuntimeError(
			"Arg err must be undef or an err", { err: err }
		);
	}
	
	if(
		err !== undefined &&
		result === undefined &&
		byCb === undefined &&
		errOccurred === undefined
	)
	{
		this.suiteRunCb( err );
		
		return;
	}
	
	if( byCb !== undefined && typeof( byCb ) !== "boolean" )
	{
		throw new TestRuntimeError(
			"Arg byCb must be undef or a bool", { byCb: byCb }
		);
	}
	
	if(
		errOccurred !== undefined &&
		typeof( errOccurred ) !== "boolean" )
	{
		throw new TestRuntimeError(
			"Arg errOccurred must be undef or a bool",
			{ errOccurred: errOccurred }
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
		( byCb !== undefined && errOccurred === undefined ) ||
		( byCb === undefined && errOccurred !== undefined )
	)
	{
		throw new TestRuntimeError(
			"Arg errOccurred must indicate if an err occurred if "+
			"and only if arg byCb indicates the result is from the "+
			"topic/topicCb",
			{ byCb: byCb, errOccurred: errOccurred }
		);
	}
	
	if( byCb === undefined && result instanceof Error === false )
	{
		throw new TestRuntimeError(
			"If arg byCb is undef then arg result must be the err "+
			"that topic/topicCb raised",
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
	
	var suiteHolder = this.suiteHolder;
	
	var allowThrownErr = suiteHolder.conf.allowThrownErr;
	var allowCbErr = suiteHolder.conf.allowCbErr;
	
	this.markStepDone(
		"topic",
		byCb !== undefined &&
		(
			errOccurred === false ||
			( byCb === false && allowThrownErr === true ) ||
			( byCb === true && allowCbErr === true )
		)
	);
	
	if( byCb === false || byCb === undefined )
	{
		result = [ result ];
	}
	
	if( byCb !== undefined )
	{
		this.steps.topic.result = result;
		
		if( errOccurred === true )
		{
			this.steps.topic.errByCb = byCb;
		}
	}
	
	if( this.steps.topic.status === "done" )
	{
		this.runArgsVer();
	}
	else
	{
		this.steps.topic.error = result[ 0 ];
		
		this.suiteRunCb( undefined, this );
		
		return;
	}
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
			
			try
			{
				suiteRun.finishTopic(
					undefined,
					Array.prototype.slice.call( arguments ),
					true,
					errOccurred
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
function( cb )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
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
