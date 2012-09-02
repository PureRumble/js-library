ourglobe.define(
[
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

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteHolder = mods.get( "suiteholder" );
var Topic = undefined;
var TopicCb = undefined;
var ArgsVer = undefined;
var Vow = undefined;

mods.delay(
	function()
	{
		Topic = mods.get( "topic" );
		TopicCb = mods.get( "topiccb" );
		ArgsVer = mods.get( "argsver" );
		Vow = mods.get( "vow" );
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
	
	this.suiteRunCb = undefined;
	this.runOk = undefined;
	
	this.local = SuiteHolder.copySet( suiteHolder.local );
	
	if( suiteHolder.topic !== undefined )
	{
		this.topic = new Topic( this );
	}
	else if(
		suiteHolder.topicCb !== undefined || parentRun === undefined
	)
	{
		this.topic = new TopicCb( this );
	}
	else if( parentRun.topic instanceof Topic === true )
	{
		this.topic = new Topic( this, parentRun.topic );
	}
	else
	{
		this.topic = new TopicCb( this, parentRun.topic );
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
	
	this.next = [];
});

SuiteRun.RUN_CB_FV =
	getV()
		.addA( Error )
		.addA( "undef", "bool" )
;

return SuiteRun;

},
function( mods, SuiteRun )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteStep = mods.get( "suitestep" );

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
		var nrSuitesDone = 0;
		var suiteErrOccurred = false;
		
		for( var item = 0; item < suiteHolder.next.length; item++ )
		{
			this.next[ item ].run(
				getF(
				SuiteRun.RUN_CB_FV,
				function( err, runOk )
				{
					if( suiteErrOccurred === true )
					{
						return;
					}
					
					if( err !== undefined )
					{
						suiteErrOccurred = true;
						
						suiteRun.suiteRunCb( err );
						
						return;
					}
					
					if( runOk === false )
					{
						suiteRun.runOk = false;
					}
					
					nrSuitesDone++;
					
					if( nrSuitesDone === suiteRun.next.length )
					{
						if( suiteRun.runOk === undefined )
						{
							suiteRun.runOk = true;
						}
						
						suiteRun.suiteRunCb( undefined, suiteRun.runOk );
					}
				})
			);
		}
	}
	else
	{
		this.runOk = true;
		
		this.suiteRunCb( undefined, true );
	}
});

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
getF(
getV(),
function()
{
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
	
	this.runNext();
});

SuiteRun.prototype.runTopic =
getF(
getV(),
function()
{
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
});

SuiteRun.prototype.run =
getF(
getV()
	.addA( "func" ),
function( cb )
{
	this.suiteRunCb = cb;
	
	this.runTopic();
});

});
