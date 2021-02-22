ourglobe.define(
[
	"./suiteholder",
	"./cbstepqueue",
	"./suiteresult",
	"./suitestep",
	"./getsuite",
	"./before",
	"./beforecb",
	"./topic",
	"./topiccb",
	"./argsver",
	"./vow",
	"./after",
	"./aftercb"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var CbStepQueue = undefined;
var SuiteHolder = undefined;
var SuiteStep = undefined;
var GetSuite = undefined;
var Before = undefined;
var BeforeCb = undefined;
var Topic = undefined;
var TopicCb = undefined;
var ArgsVer = undefined;
var Vow = undefined;
var After = undefined;
var AfterCb = undefined;

mods.delay(
	function()
	{
		CbStepQueue = mods.get( "cbstepqueue" );
		SuiteHolder = mods.get( "suiteholder" );
		SuiteStep = mods.get( "suitestep" );
		GetSuite = mods.get( "getsuite" );
		Before = mods.get( "before" );
		BeforeCb = mods.get( "beforecb" );
		Topic = mods.get( "topic" );
		TopicCb = mods.get( "topiccb" );
		ArgsVer = mods.get( "argsver" );
		Vow = mods.get( "vow" );
		After = mods.get( "after" );
		AfterCb = mods.get( "aftercb" );
		
		SuiteRun.STEP_STARTS_CB_FV =
			getV()
				.addA( SuiteRun, [ SuiteStep, "undef" ] )
		;

		SuiteRun.STEP_ENDS_CB_FV = SuiteRun.STEP_STARTS_CB_FV;
	}
);

var SuiteRun =
getF(
function()
{
	return(
		getV()
			.addA( SuiteHolder, "func/undef", "func/undef" )
			.addA( SuiteHolder, SuiteRun )
	);
},
function( suiteHolder, stepStartsCb, stepEndsCb )
{
	var parentRun = undefined;
	
	if( stepStartsCb instanceof SuiteRun === true )
	{
		parentRun = stepStartsCb;
		stepStartsCb = undefined;
		stepEndsCb = undefined;
	}
	
	if( parentRun !== undefined )
	{
		stepStartsCb = parentRun.stepStartsCb;
		stepEndsCb = parentRun.stepEndsCb;
	}
	else
	{
		if( stepStartsCb === undefined )
		{
			stepStartsCb =
			function()
			{
				
			};
		}
		
		if( stepEndsCb === undefined )
		{
			stepEndsCb =
			function()
			{
				
			};
		}
	}
	
	this.parentRun = parentRun;
	this.suiteHolder = undefined;
	this.origSuiteHolder = suiteHolder;
	this.stepStartsCb = stepStartsCb;
	this.stepEndsCb = stepEndsCb;
	this.nrChildSuitesDone = 0;
	this.suiteErrOccurred = false;
	this.suiteRunCb = undefined;
	this.runOk = undefined;
	this.local = {};
	
	this.failedSteps =
	{
		getSuite: undefined,
		before: undefined,
		topic: undefined,
		argsVer: undefined,
		vows: undefined,
		next: undefined,
		after: undefined
	};
	
	this.setSuiteHolder( suiteHolder );
	
	if( parentRun === undefined )
	{
		this.cbStepQueue =
			new CbStepQueue( suiteHolder.suite.maxNrConcCbs )
		;
	}
	else
	{
		this.cbStepQueue = parentRun.cbStepQueue;
	}
});

SuiteRun.RUN_CB_FV =
	getV()
		.addA( Error )
		.addA( "undef", SuiteRun )
;

return SuiteRun;

},
function( mods, SuiteRun )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteHolder = mods.get( "suiteholder" );
var SuiteResult = mods.get( "suiteresult" );
var SuiteStep = mods.get( "suitestep" );
var GetSuite = mods.get( "getsuite" );
var Before = mods.get( "before" );
var BeforeCb = mods.get( "beforecb" );
var Topic = mods.get( "topic" );
var TopicCb = mods.get( "topiccb" );
var ArgsVer = mods.get( "argsver" );
var Vow = mods.get( "vow" );
var After = mods.get( "after" );
var AfterCb = mods.get( "aftercb" );

SuiteRun.prototype.setSuiteHolder =
getF(
getV()
	.addA( SuiteHolder ),
function( suiteHolder )
{
	this.suiteHolder = suiteHolder;
	this.vars = SuiteHolder.copySet( suiteHolder.vars );
	
	if( suiteHolder.getSuite !== undefined )
	{
		this.getSuite = new GetSuite( this );
	}
	
	if( suiteHolder.beforeCb !== undefined )
	{
		this.before = new BeforeCb( this );
	}
	else if( suiteHolder.before !== undefined )
	{
		this.before = new Before( this );
	}
	
	if( suiteHolder.topicCb !== undefined )
	{
		this.topic = new TopicCb( this );
	}
	else if( suiteHolder.topic !== undefined )
	{
		this.topic = new Topic( this );
	}
	
	if( suiteHolder.argsVer !== undefined )
	{
		this.argsVer = new ArgsVer( this );
	}
	
	this.vows = [];
	
	if( suiteHolder.vows !== undefined )
	{
		for( var item = 0; item < suiteHolder.vows.length; item++ )
		{
			this.vows[ item ] = new Vow( this, item );
		}
	}
	
	this.next = [];
	
	if( suiteHolder.afterCb !== undefined )
	{
		this.after = new AfterCb( this );
	}
	else if( suiteHolder.after !== undefined )
	{
		this.after = new After( this );
	}
});

SuiteRun.prototype.markChildSuiteDone =
getF(
getV()
	.addA( Error, "undef" )
	.addA( "undef", SuiteRun ),
function( err, childSuiteRun )
{
	if( this.suiteErrOccurred === true )
	{
		return;
	}
	
	if( err !== undefined )
	{
		this.suiteErrOccurred = true;
		
		this.suiteRunCb( err );
		
		return;
	}
	
	if( childSuiteRun.runOk === false )
	{
		this.markRunFailed( childSuiteRun );
	}
	
	this.nrChildSuitesDone++;
	
	if(
		this.suiteHolder.conf.sequential === true &&
		this.nrChildSuitesDone < this.next.length
	)
	{
		this.runChildSuite( this.nrChildSuitesDone );
	}
	else if( this.nrChildSuitesDone === this.next.length )
	{
		this.runAfter();
	}
});

SuiteRun.prototype.runChildSuite =
getF(
getV()
	.addA( { gte: 0 } ),
function( item )
{
	var suiteRun = this;
	
	this.next[ item ].run(
		getF(
		SuiteRun.RUN_CB_FV,
		function( err, childSuiteRun )
		{
			suiteRun.markChildSuiteDone( err, childSuiteRun );
		})
	);
});

SuiteRun.prototype.finishAfter =
getF(
getV()
	.addA( [ Error, "undef" ] ),
function( err )
{
	if( err !== undefined )
	{
		this.suiteRunCb( err );
		
		return;
	}
	
	if( this.after === undefined || this.after.stepOk === true )
	{
		if( this.runOk === undefined )
		{
			this.runOk = true;
		}
	}
	else
	{
		this.markRunFailed( this.after );
	}
	
	this.stepEndsCb( this );
	
	this.suiteRunCb( undefined, this );
	
});

SuiteRun.prototype.runAfter =
getF(
getV(),
function()
{
	if( this.after === undefined )
	{
		this.finishAfter();
	}
	else
	{
		var suiteRun = this;
		
		this.after.takeStep(
			getF(
			SuiteStep.TAKE_STEP_CB_FV,
			function( err )
			{
				suiteRun.finishAfter( err );
			})
		);
	}
});

SuiteRun.prototype.finishBefore =
getF(
getV()
	.addA( [ Error, "undef" ] ),
function( err )
{
	if( err !== undefined )
	{
		this.suiteRunCb( err );
		
		return;
	}
	
	if( this.before === undefined || this.before.stepOk === true )
	{
		this.runTopic();
	}
	else
	{
		this.markRunFailed( this.before );
		this.runAfter();
	}
});

SuiteRun.prototype.runGetSuite =
getF(
getV(),
function()
{
	if( this.getSuite === undefined )
	{
		this.runBefore();
		
		return;
	}
	else
	{
		var suiteRun = this;
		
		this.getSuite.takeStep(
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
					suiteRun.markRunFailed( suiteRun.getSuite );
					
// It is true that if a Suite has SuiteStep getSuite then it cant
// have after nor afterCb, but runAfter() calls finishAfter()
// that in turn makes some final touches to the SuiteRun
					suiteRun.runAfter();
					
					return;
				}
				
				suiteRun.setSuiteHolder( suiteRun.getSuite.suiteHolder );
				
				suiteRun.runBefore();
			})
		);
	}
});

SuiteRun.prototype.runBefore =
getF(
getV(),
function()
{
	if( this.before === undefined )
	{
		this.finishBefore();
	}
	else
	{
		var suiteRun = this;
		
		this.before.takeStep(
			getF(
			SuiteStep.TAKE_STEP_CB_FV,
			function( err )
			{
				suiteRun.finishBefore( err );
			})
		);
	}
});

SuiteRun.prototype.runNext =
getF(
getV(),
function()
{
	var suiteHolder = this.suiteHolder;
	
	if( suiteHolder.next !== undefined )
	{
		for( var item = 0; item < suiteHolder.next.length; item++ )
		{
			var currSuiteHolder = suiteHolder.next[ item ].value;
			
			var currSuiteRun = new SuiteRun( currSuiteHolder, this );
			
			this.next[ item ] = currSuiteRun;
		}
		
		var suiteRun = this;
		
		if( suiteHolder.conf.sequential === false )
		{
			for( var item = 0; item < suiteHolder.next.length; item++ )
			{
				this.runChildSuite( item );
			}
		}
		else
		{
			this.runChildSuite( 0 );
		}
	}
	else
	{
		this.runAfter();
	}
});

SuiteRun.prototype.runArgsVer =
getF(
getV(),
function()
{
	if( this.argsVer === undefined )
	{
		this.runVows();
		
		return;
	}
	
	var suiteRun = this;
	
	this.argsVer.takeStep(
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
				suiteRun.markRunFailed( suiteRun.argsVer );
				suiteRun.runAfter();
				
				return;
			}
			
			suiteRun.runVows();
		})
	);
});

SuiteRun.prototype.runVows =
getF(
getV(),
function()
{
	var suiteRun = this;
	
	for( var item = 0; item < this.vows.length; item++ )
	{
		var vow = this.vows[ item ];
		
		var vowErr = undefined;
		
		vow.takeStep(
			getF(
			SuiteStep.TAKE_STEP_CB_FV,
			function( err, stepOk )
			{
				vowErr = err;
				
				if( stepOk === false )
				{
					suiteRun.markRunFailed( vow );
				}
			})
		);
		
		if( vowErr !== undefined )
		{
			this.suiteRunCb( vowErr );
			
			return;
		}
	}
	
	if( suiteRun.runOk === false )
	{
		this.runAfter();
	}
	else
	{
		this.runNext();
	}
});

SuiteRun.prototype.finishTopic =
getF(
getV()
	.addA( [Error, "undef" ] ),
function( err )
{
	if( err !== undefined )
	{
		this.suiteRunCb( err );
		
		return;
	}
	
	this.suiteRes = new SuiteResult( this );
	
	if( this.topic === undefined || this.topic.stepOk === true )
	{
		this.runArgsVer();
	}
	else
	{
		this.markRunFailed( this.topic );
		this.runAfter();
	}
});

SuiteRun.prototype.runTopic =
getF(
getV(),
function()
{
	if( this.topic === undefined )
	{
		this.finishTopic();
	}
	else
	{
		var suiteRun = this;
		
		this.topic.takeStep(
			getF(
			SuiteStep.TAKE_STEP_CB_FV,
			function( err )
			{
				suiteRun.finishTopic( err );
			})
		);
	}
});

SuiteRun.prototype.markRunFailed =
getF(
// The FuncVer lists all individual SuiteSteps instead of using
// the base class SuiteStep in order to avoid that some new
// SuiteStep is added in the future but it is missed to update
// this inst func
getV()
	.addA(
		[
			GetSuite,
			Before,
			BeforeCb,
			Topic,
			TopicCb,
			ArgsVer,
			Vow,
			After,
			AfterCb,
			SuiteRun,
			"undef"
		]
	),
function( failedStep )
{
	this.runOk = false;
	
	if(
		failedStep instanceof GetSuite === true
	)
	{
		this.failedSteps.getSuite = failedStep;
	}
	else if(
		failedStep instanceof Before === true ||
		failedStep instanceof BeforeCb === true
	)
	{
		this.failedSteps.before = failedStep;
	}
	else if(
		failedStep instanceof Topic === true ||
		failedStep instanceof TopicCb === true
	)
	{
		this.failedSteps.topic = failedStep;
	}
	else if( failedStep instanceof ArgsVer === true )
	{
		this.failedSteps.argsVer = failedStep;
	}
	else if( failedStep instanceof Vow === true )
	{
		if( this.failedSteps.vows === undefined )
		{
			this.failedSteps.vows = [];
		}
		
		this.failedSteps.vows.push( failedStep );
	}
	else if(
		failedStep instanceof After === true ||
		failedStep instanceof AfterCb === true
	)
	{
		this.failedSteps.after = failedStep;
	}
	else
	{
		if( this.failedSteps.next === undefined )
		{
			this.failedSteps.next = [];
		}
		
		this.failedSteps.next.push( failedStep );
	}
});

SuiteRun.prototype.run =
getF(
getV()
	.addA( "func/undef" ),
function( cb )
{
	this.suiteRunCb = cb;
	
	if( this.suiteRunCb === undefined )
	{
		this.suiteRunCb =
		getF(
			SuiteRun.RUN_CB_FV,
			function( err )
			{
				if( err !== undefined )
				{
					throw err;
				}
			}
		);
	}
	
	this.stepStartsCb( this );
	
	this.runGetSuite();
	
// If this SuiteRun has no parent then it must make sure the
// CbStepQueue is initiated for the first time so the CbSteps
// can begin running
	if( this.parentRun === undefined )
	{
		this.cbStepQueue.fillSlots();
	}
});

});
