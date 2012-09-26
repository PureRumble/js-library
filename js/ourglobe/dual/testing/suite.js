ourglobe.define(
[
	"./suiteruntimeerror",
	"./suiteholder",
	"./suiterun"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var assert = ourglobe.assert;

var RuntimeError = ourglobe.RuntimeError;

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

return Suite;

},
function( mods, Suite )
{

var Schema = ourglobe.Schema;
var getF = ourglobe.getF;
var getV = ourglobe.getV;
var sys = ourglobe.sys;
var assert = ourglobe.assert;
var RuntimeError = ourglobe.RuntimeError;

var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var SuiteHolder = mods.get( "suiteholder" );
var SuiteRun = mods.get( "suiterun" );

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
	assert.argType( "childSuite", childSuite, "obj" );
	
	if( Suite.suiteNameIsValid( childSuiteName ) === false )
	{
		throw new RuntimeError(
			"Arg childSuiteName must be a proper str",
			{ childSuiteName: childSuiteName }
		);
	}
	
	var suiteHolder =
		new SuiteHolder( childSuiteName, this, childSuite )
	;
	
	this.suiteObj.next.push( childSuiteName );
	this.suiteObj.next.push( suiteHolder );
});

Suite.prototype.setRootConf =
getF(
getV().setE( "any" ),
function( conf )
{
	assert.nrArgs( arguments, 1 );
	var res = Suite.confIsValid( conf );
	
	if( res !== undefined )
	{
		throw new RuntimeError(
			"There is an error with arg conf:\n"+
			res.msg,
			{ conf: conf }
		);
	}
	
	this.suiteObj.conf = SuiteHolder.copySet( conf );
});

Suite.prototype.setRootBefore =
getF(
getV().setE( "any" ),
function( before )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "before", before, "func" );
	
	this.suiteObj.before = before;
});

Suite.prototype.setRootAfter =
getF(
getV().setE( "any" ),
function( after )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "after", after, "func" );
	
	this.suiteObj.after = after;
});

Suite.prototype.setRootBeforeCb =
getF(
getV().setE( "any" ),
function( beforeCb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "beforeCb", beforeCb, "func" );
	
	this.suiteObj.beforeCb = beforeCb;
});

Suite.prototype.setRootAfterCb =
getF(
getV().setE( "any" ),
function( afterCb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "afterCb", afterCb, "func" );
	
	this.suiteObj.afterCb = afterCb;
});

Suite.prototype.setRootAfterCb =
getF(
getV().setE( "any" ),
function( afterCb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "afterCb", afterCb, "func" );
	
	this.suiteObj.afterCb = afterCb;
});

Suite.prototype.setRootLocal =
getF(
getV().setE( "any" ),
function( local )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "local", local, "obj" );
	
	this.suiteObj.local = SuiteHolder.copySet( local );
});

Suite.prototype.run =
getF(
getV().setE( "any" ),
function( cb )
{
	assert.nrArgs( arguments, 1 );
	assert.argType( "cb", cb, "func" );
	
	var suiteHolder =
		new SuiteHolder( this.suiteName, this, this.suiteObj, true )
	;
	
	new SuiteRun( suiteHolder ).run( cb );
});

});
