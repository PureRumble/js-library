ourGlobe.define(
[
	"./suiteruntimeerror",
	"./suiteholder",
	"./suiterun",
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

var getF = ourGlobe.getF;
var getV = ourGlobe.getV;
var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var assert = ourGlobe.assert;
var Schema = ourGlobe.Schema;

var RuntimeError = ourGlobe.RuntimeError;

var SuiteRun;

mods.delay(
function()
{
	SuiteRun = mods.get( "suiterun" );
	
	Suite.RUN_CB_FV = SuiteRun.RUN_CB_FV;
});

var Suite =
getF(
getV().setE( "any" ),
function( suiteName, globalConf, maxNrConcCbs )
{
	assert.nrArgs( arguments, 1, 3 );
	
	if( Suite.suiteNameIsValid( suiteName ) === false )
	{
		throw new RuntimeError(
			"Arg suiteName must be a proper str",
			{ suiteName: suiteName }
		);
	}
	
	if(
		hasT( globalConf, "int" ) === true &&
		maxNrConcCbs === undefined
	)
	{
		maxNrConcCbs = globalConf;
		globalConf = undefined;
	}
	
// It's better to complain here about globalConf not being of
// correct type than letting confIsValid presenting a confusing
// err msg where it says "conf" instead of "globalConf"
	assert.argType( "globalConf", globalConf, "obj", "undef" );
	
	var res = Suite.confIsValid( globalConf );
	
	if( res !== undefined )
	{
		throw new RuntimeError(
			"There is an error with arg globalConf:\n"+
			res.msg,
			{ globalConf: globalConf }
		);
	}
	
	if(
		maxNrConcCbs !== undefined &&
		(
			sys.hasType( maxNrConcCbs, "int" ) === false ||
			maxNrConcCbs < 1
		)
	)
	{
		throw new RuntimeError(
			"Arg maxNrConcCbs must be undef or a pos int",
			{ maxNrConcCbs: maxNrConcCbs }
		);
	}
	
	if( globalConf === undefined )
	{
		globalConf = {};
	}
	
	this.suiteName = suiteName;
	this.maxNrConcCbs = maxNrConcCbs;
	this.suiteObj = {};
	this.suiteObj.next = [];
	this.globalConf = {};
	
	this.globalConf.cbTimeout = globalConf.cbTimeout;
	this.globalConf.allowCbErr = globalConf.allowCbErr;
	this.globalConf.allowThrownErr = globalConf.allowThrownErr;
	this.globalConf.verifyArgs = globalConf.verifyArgs;
	this.globalConf.sequential = globalConf.sequential;
	
	if( this.globalConf.cbTimeout === undefined )
	{
		this.globalConf.cbTimeout = Suite.DEFAULT_CB_TIMEOUT;
	}
	
	if( this.globalConf.allowCbErr === undefined )
	{
		this.globalConf.allowCbErr = false;
	}
	
	if( this.globalConf.allowThrownErr === undefined )
	{
		this.globalConf.allowThrownErr = false;
	}
	
	if( this.globalConf.verifyArgs === undefined )
	{
		this.globalConf.verifyArgs = true;
	}
	
	if( this.globalConf.sequential === undefined )
	{
		this.globalConf.sequential = false;
	}
	
	if( this.maxNrConcCbs === undefined )
	{
		this.maxNrConcCbs = Suite.DEFAULT_MAX_NR_CONC_CBS;
	}
});

Suite.DEFAULT_MAX_NR_CONC_CBS = 10;

Suite.DEFAULT_CB_TIMEOUT = 5000;

Suite.SUITE_NAMES_S =
	{ extraItems: Schema.PROPER_STR, minItems: 1 }
;

return Suite;

},
function( mods, Suite )
{

var Schema = ourglobe.Schema;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var hasT = ourGlobe.hasT;
var assert = ourglobe.assert;
var RuntimeError = ourglobe.RuntimeError;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteHolder = mods.get( "suiteholder" );
var SuiteRun = mods.get( "suiterun" );
var SuiteStep = mods.get( "suitestep" );
var Before = mods.get( "before" );
var BeforeCb = mods.get( "beforecb" );
var Topic = mods.get( "topic" );
var TopicCb = mods.get( "topiccb" );
var ArgsVer = mods.get( "argsver" );
var Vow = mods.get( "vow" );
var After = mods.get( "after" );
var AfterCb = mods.get( "aftercb" );

Suite.getErrMsg =
getF(
getV()
	.addA( Error )
	.setR( "str" ),
function( err )
{
	return err.stack;
});

Suite.suiteNameIsValid =
getF(
getV()
	.addA( "any" )
	.setR( "bool" ),
function( suiteName )
{
	return(
		sys.hasType( suiteName, "str" ) === true &&
		suiteName.length > 0
	);
});

Suite.getSuiteName =
getF(
getV()
	.addA( Suite.SUITE_NAMES_S )
	.setR( { minStrLen: 1 } ),
function( suiteNames )
{
	var suiteName = "";
	
	for( var item = 0; item < suiteNames.length; item++ )
	{
		suiteName += "\u2022 "+suiteNames[ item ]+"\n";
	}
	
	return suiteName;
});

Suite.confIsValid =
getF(
getV()
	.addA( "any" )
	.setR(
		{
			types: "obj/undef",
			props:
			{
				msg: RuntimeError.MSG_S, errorVar: RuntimeError.VAR_S
			}
		}
	),
function( conf )
{
	if( sys.hasType( conf, "obj", "undef" ) === false )
	{
		return(
			{
				msg: "conf must be undef or an obj",
				errorVar: { conf: conf }
			}
		);
	}
	
	if( conf === undefined )
	{
		conf = {};
	}
	
	for( var prop in conf )
	{
		if(
			prop !== "verifyArgs" &&
			prop !== "allowThrownErr" &&
			prop !== "allowCbErr" &&
			prop !== "sequential" &&
			prop !== "cbTimeout"
		)
		{
			return(
				{
					msg: "Prop "+prop+" isnt allowed in conf",
					errorVar:{ invalidProp: prop, propValue: conf[ prop ] }
				}
			);
		}
	}
	
	var verifyArgs = conf[ "verifyArgs" ];
	var allowThrownErr = conf[ "allowThrownErr" ];
	var allowCbErr = conf[ "allowCbErr" ];
	var sequential = conf[ "sequential" ];
	var cbTimeout = conf[ "cbTimeout" ];
	
	if(
		verifyArgs !== undefined &&
		typeof( verifyArgs ) !== "boolean"
	)
	{
		return(
			{
				msg: "Prop verifyArgs must be undef or a bool",
				errorVar:{ verifyArgs: verifyArgs }
			}
		);
	}
	
	if(
		allowThrownErr !== undefined &&
		typeof( allowThrownErr ) !== "boolean"
	)
	{
		return(
			{
				msg: "Prop allowThrownErr must be undef or a bool",
				errorVar:{ allowThrownErr: allowThrownErr }
			}
		);
	}
	
	if(
		allowCbErr !== undefined &&
		typeof( allowCbErr ) !== "boolean"
	)
	{
		return(
			{
				msg: "Prop allowCbErr must be undef or a bool",
				errorVar:{ allowCbErr: allowCbErr }
			}
		);
	}
	
	if(
		sequential !== undefined &&
		typeof( sequential ) !== "boolean"
	)
	{
		return(
			{
				msg: "Prop sequential must be undef or a bool",
				errorVar:{ sequential: sequential }
			}
		);
	}
	
	if(
		cbTimeout !== undefined &&
		(
			sys.hasType( cbTimeout, "int" ) === false ||
			cbTimeout < 1
		)
	)
	{
		return(
			{
				msg: "Prop cbTimeout must be a pos int or undef",
				errorVar:{ cbTimeout: cbTimeout }
			}
		);
	}
	
	return undefined;
});

Suite.prototype.add =
getF(
getV().setE( "any" ),
function( childSuiteName, childSuite )
{
	assert.nrArgs( arguments, 2 );
	assert.argType( "childSuite", childSuite, "obj", "arr" );
	
	if( Suite.suiteNameIsValid( childSuiteName ) === false )
	{
		throw new RuntimeError(
			"Arg childSuiteName must be a proper str",
			{ childSuiteName: childSuiteName }
		);
	}
	
	if( hasT( childSuite, "arr" ) === true )
	{
		childSuite = { next: childSuite };
	}
	
	var suiteHolder =
		new SuiteHolder( childSuiteName, this, childSuite )
	;
	
	this.suiteObj.next.push( childSuiteName );
	this.suiteObj.next.push( suiteHolder );
});

Suite.prototype.setConf =
getF(
getV().setE( "any" ),
function( conf )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "conf", conf, "obj" );
	
	this.suiteObj.conf = SuiteHolder.copySet( conf );
});

Suite.prototype.setBefore =
getF(
getV().setE( "any" ),
function( before )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "before", before, "func" );
	
	this.suiteObj.before = before;
});

Suite.prototype.setAfter =
getF(
getV().setE( "any" ),
function( after )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "after", after, "func" );
	
	this.suiteObj.after = after;
});

Suite.prototype.setBeforeCb =
getF(
getV().setE( "any" ),
function( beforeCb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "beforeCb", beforeCb, "func" );
	
	this.suiteObj.beforeCb = beforeCb;
});

Suite.prototype.setAfterCb =
getF(
getV().setE( "any" ),
function( afterCb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "afterCb", afterCb, "func" );
	
	this.suiteObj.afterCb = afterCb;
});

Suite.prototype.setAfterCb =
getF(
getV().setE( "any" ),
function( afterCb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "afterCb", afterCb, "func" );
	
	this.suiteObj.afterCb = afterCb;
});

Suite.prototype.setVars =
getF(
getV().setE( "any" ),
function( vars )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "vars", vars, "obj" );
	
	this.suiteObj.vars = SuiteHolder.copySet( vars );
});

Suite.declareFailedSuiteStep =
getF(
getV()
	.addA( SuiteStep ),
function( suiteStep )
{
	var failedSuiteStepHeading =
		"\n\u001b[1m************ "+
		"Failed Suite Step "+
		"************\u001b[0m\n"
	;
	
	var stepName = suiteStep.getStepName();
	
	console.log( failedSuiteStepHeading );
	
	console.log(
		"\u001b[1mThe suite's step \u001b[31;1m"+stepName+
		"\u001b[0;1m has failed by the following err:"+
		"\u001b[0m\n\n"+
		Suite.getErrMsg( suiteStep.err )+
		"\n"
	);
});

Suite.prototype.declareSuiteRes =
getF(
SuiteRun.RUN_CB_FV,
function( err, suiteRun )
{
	if( err !== undefined )
	{
		throw err;
	}
	
	var failedSuiteHeading =
		"\n\u001b[1m============ "+
		"Failed Suite "+
		"============\u001b[0m\n"
	;
	var failedSuiteStepHeading =
		"\n\u001b[1m************ "+
		"Failed Suite Step "+
		"************\u001b[0m\n"
	;
	var failedVowHeading =
		"\n\u001b[1m------------ "+
		"Failed Vow "+
		"------------\u001b[0m\n"
	;
	var resultHeading =
		"\n\u001b[1m============ "+
		"Result "+
		"============\u001b[0m\n"
	;
	
	console.log();
	
	var failedSuiteRuns = [];
	
	if( suiteRun.runOk === false )
	{
		failedSuiteRuns.unshift( suiteRun );
	}
	
	while( failedSuiteRuns.length > 0 )
	{
		var suiteRun = failedSuiteRuns.shift();
		var failedSteps = suiteRun.failedSteps;
		var suiteStep = undefined;
		
		if(
			failedSteps.before !== undefined ||
			failedSteps.topic !== undefined ||
			failedSteps.argsVer !== undefined ||
			failedSteps.vows !== undefined ||
			failedSteps.after !== undefined
		)
		{
			console.log( failedSuiteHeading );
			
			console.log(
				"\u001b[1mThe following \u001b[31;1msuite\u001b[0;1m "+
				"has failed:\n\n"+
				suiteRun.suiteHolder.toString()+
				"\u001b[0m"
			);
			
			if( failedSteps.before !== undefined )
			{
				Suite.declareFailedSuiteStep( failedSteps.before );
			}
			
			if( failedSteps.topic !== undefined )
			{
				Suite.declareFailedSuiteStep( failedSteps.topic );
			}
			
			if( failedSteps.argsVer !== undefined )
			{
				Suite.declareFailedSuiteStep( failedSteps.argsVer );
			}
			
			if( failedSteps.vows !== undefined )
			{
				console.log( failedSuiteStepHeading );
				
				console.log(
					"\u001b[1mThe suite's following \u001b[31;1mvows"+
					"\u001b[0;1m have failed by the errs "+
					"stated with them:\u001b[0m\n"
				);
				
				for(
					var item = 0; item < failedSteps.vows.length; item++
				)
				{
					var failedVow = failedSteps.vows[ item ];
					
					console.log( failedVowHeading );
					
					console.log(
						"\u001b[1m\u00bb "+failedVow.getVowName()+":"+
						"\u001b[0m\n\n"+
						Suite.getErrMsg( failedVow.err ) +
						"\n"
					);
				}
			}
			
			if( failedSteps.after !== undefined )
			{
				Suite.declareFailedSuiteStep( failedSteps.after );
			}
		}
		
		if( failedSteps.next !== undefined )
		{
			failedSuiteRuns =
				failedSteps.next.concat( failedSuiteRuns )
			;
		}
	}
	
	console.log( resultHeading );
	
	if( suiteRun.runOk === true )
	{
		console.log(
			"\u001b[1mThe suite run \u001b[32;1msucceeded\u001b[0m\n"
		);
	}
	else
	{
		console.log(
			"\u001b[1mThe suite run \u001b[31;1mfailed\u001b[0m\n"
		);
	}
});

Suite.prototype.declareStepRes =
getF(
SuiteRun.STEP_ENDS_CB_FV,
function( suiteRun, suiteStep )
{
	if( suiteStep !== undefined )
	{
		var stepName = suiteStep.getStepName();
		
		if( suiteStep.stepOk === true )
		{
			console.log( "\u001b[32;1m"+stepName+" ok\u001b[0m" );
		}
		else
		{
			console.log( "\u001b[31;1m"+stepName+" failed\u001b[0m" );
		}
	}
});

Suite.prototype.run =
getF(
getV().setE( "any" ),
function( cb )
{
	assert.nrArgs( arguments, 0, 1 );
	assert.argType( "cb", cb, "func", "undef" );
	
	if( this.suiteObj.next.length === 0 )
	{
		throw new SuiteRuntimeError(
			"No suites have been added to run",
			undefined,
			"NoSuitesToRun"
		);
	}
	
	var suite = this;
	
	var suiteHolder =
		new SuiteHolder( this.suiteName, this, this.suiteObj, true )
	;
	
	var suiteRun = undefined;
	
	if( cb === undefined )
	{
		suiteRun =
			new SuiteRun(
				suiteHolder,
				undefined,
				getF(
					SuiteRun.STEP_ENDS_CB_FV,
					function()
					{
						suite.declareStepRes.apply( suite, arguments );
					}
				)
			)
		;
		
		cb =
			getF(
				SuiteRun.RUN_CB_FV,
				function()
				{
					suite.declareSuiteRes.apply( suite, arguments );
				}
			);
	}
	else
	{
		suiteRun = new SuiteRun( suiteHolder );
	}
	
	suiteRun.run( cb );
});

});
