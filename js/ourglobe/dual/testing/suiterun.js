ourglobe.define(
[
	"./suiteholder",
	"./cbstepqueue",
	"./suiteresult",
	"./suitestep",
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
		Before = mods.get( "before" );
		BeforeCb = mods.get( "beforecb" );
		Topic = mods.get( "topic" );
		TopicCb = mods.get( "topiccb" );
		ArgsVer = mods.get( "argsver" );
		Vow = mods.get( "vow" );
		After = mods.get( "after" );
		AfterCb = mods.get( "aftercb" );
	}
);

var SuiteRun =
getF(
function()
{
	return(
		getV()
			.addA( SuiteHolder, [ SuiteRun, "undef" ] )
	);
},
function( suiteHolder, parentRun )
{
	this.parentRun = parentRun;
	this.suiteHolder = suiteHolder;
	
	this.nrChildSuitesDone = 0;
	this.suiteErrOccurred = false;
	
	this.suiteRunCb = undefined;
	this.runOk = undefined;
	this.failedSuiteStep = undefined;
	this.failedSuiteRun = undefined;
	
	if( parentRun === undefined )
	{
		this.cbStepQueue =
			new CbStepQueue( this.suiteHolder.suite.maxNrConcCbs )
		;
	}
	else
	{
		this.cbStepQueue = parentRun.cbStepQueue;
	}
	
	this.local = SuiteHolder.copySet( suiteHolder.local );
	
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

var SuiteResult = mods.get( "suiteresult" );
var SuiteStep = mods.get( "suitestep" );
var After = mods.get( "after" );

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
	
	var argsVerErr = undefined;
	var argsVerOk = undefined;
	
	this.argsVer.takeStep(
		getF(
		SuiteStep.TAKE_STEP_CB_FV,
		function( err, stepOk )
		{
			argsVerErr = err;
			argsVerOk = stepOk;
		})
	);
	
	if( argsVerErr !== undefined )
	{
		this.suiteRunCb( argsVerErr );
		
		return;
	}
	
	if( argsVerOk === false )
	{
		this.markRunFailed( this.argsVer );
		this.runAfter();
		
		return;
	}
	
	this.runVows();
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
getV()
	.addA( [ SuiteStep, SuiteRun, "undef" ] ),
function( failedStep )
{
	this.runOk = false;
	
	if(
		failedStep instanceof SuiteStep === true &&
		this.failedSuiteStep === undefined
	)
	{
		this.failedSuiteStep = failedStep;
	}
	else if(
		failedStep instanceof SuiteRun === true &&
		this.failedSuiteRun === undefined
	)
	{
		this.failedSuiteRun = failedStep;
	}
});

SuiteRun.prototype.run =
getF(
getV()
	.addA( "func" ),
function( cb )
{
	this.suiteRunCb = cb;
	
	this.runBefore();
	
// If this SuiteRun has no parent then it must make sure the
// CbStepQueue is initiated for the first time so the CbSteps
// can begin running
	if( this.parentRun === undefined )
	{
		this.cbStepQueue.fillSlots();
	}
});

});
