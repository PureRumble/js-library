ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./suite"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;
var FuncVer = ourGlobe.FuncVer;

var Suite;

mods.delay(
function()
{
	Suite = mods.get( "suite" );
});

var SuiteHolder =
getF(
function()
{
	return(
		getV()
			.addA(
				FuncVer.PROPER_STR,
				Suite,
				"any",
				 [ SuiteHolder, "bool/undef" ]
			)
			.addA( SuiteHolder, "any" )
	);
},
function( name, suite, suiteObj, parentSuite )
{
	var baseSuiteHolder = undefined;
	
	if( name instanceof SuiteHolder === true )
	{
		suiteObj = suite;
		
		var baseSuiteHolder = name;
		name = baseSuiteHolder.name;
		suite = baseSuiteHolder.suite;
		parentSuite = baseSuiteHolder.parent;
	}
	
	var forSuite = false;
	
	if( parentSuite === true )
	{
		forSuite = true;
	}
	
	if( parentSuite instanceof SuiteHolder === false )
	{
		parentSuite = undefined;
	}
	
	if(
		baseSuiteHolder !== undefined || parentSuite === undefined
	)
	{
		SuiteHolder.verSuiteObj(
			name, suite, suiteObj, undefined, forSuite
		);
	}
	
	this.name = name;
	this.suite = suite;
	this.parent = parentSuite;
	this.getSuite = suiteObj.getSuite;
	this.before = suiteObj.before;
	this.beforeCb = suiteObj.beforeCb;
	this.topic = suiteObj.topic;
	this.topicCb = suiteObj.topicCb;
	this.argsVer = suiteObj.argsVer;
	this.vows = SuiteHolder.orderArr( suiteObj.vows );
	this.next = SuiteHolder.orderArr( suiteObj.next );
	this.after = suiteObj.after;
	this.afterCb = suiteObj.afterCb;
	
	if( sys.hasType( suiteObj.argsVer, "arr" ) === true )
	{
		this.argsVer = new FuncVer( this.argsVer );
	}
	
	this.vars = SuiteHolder.copySet( suiteObj.vars );
	
	if( this.vars === undefined )
	{
		this.vars = {};
	}
	
	this.conf = SuiteHolder.copySet( suiteObj.conf );
	
	if( this.conf === undefined )
	{
		this.conf = {};
	}
	
	if( this.conf.verifyArgs === undefined )
	{
		this.conf.verifyArgs = this.suite.globalConf.verifyArgs;
		;
	}
	
	if( this.conf.cbTimeout === undefined )
	{
		this.conf.cbTimeout = this.suite.globalConf.cbTimeout;
	}
	
	if( this.conf.allowThrownErr === undefined )
	{
		this.conf.allowThrownErr =
			this.suite.globalConf.allowThrownErr
		;
	}
	
	if( this.conf.allowCbErr === undefined )
	{
		this.conf.allowCbErr =
			this.suite.globalConf.allowCbErr
		;
	}
	
	if( this.conf.sequential === undefined )
	{
		this.conf.sequential =
			this.suite.globalConf.sequential
		;
	}
	
	if( this.next !== undefined )
	{
		if( forSuite === false )
		{
			for( var item = 0; item < this.next.length; item++ )
			{
				var suite = this.next[ item ];
				
				suite.value =
					new SuiteHolder(
						suite.key, this.suite, suite.value, this
					)
				;
			}
		}
		else
		{
			for( var item = 0; item < this.next.length; item++ )
			{
				var suite = this.next[ item ];
				
				suite.value.parent = this;
			}
		}
	}
});

return SuiteHolder;

},
function( mods, SuiteHolder )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;
var FuncVer = ourGlobe.FuncVer;

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );
var Suite = mods.get( "suite" );

SuiteHolder.verSuiteObj =
getF(
getV()
	.addA(
		[ SuiteHolder, FuncVer.PROPER_STR, Suite.SUITE_NAMES_S ],
		Suite,
		"any",
		"bool/undef",
		"bool/undef"
	),
function( suiteNames, suite, suiteObj, topicFound, forSuite )
{
	if( suiteNames instanceof SuiteHolder === true )
	{
		var newSuiteNames = [];
		
		for(
			var suiteHolder = suiteNames;
			suiteHolder !== undefined;
			suiteHolder = suiteHolder.parent
		)
		{
			newSuiteNames.unshift( suiteHolder.name );
		}
		
		suiteNames = newSuiteNames;
	}
	else if( sys.hasType( suiteNames, "str" ) === true )
	{
		suiteNames = [ suiteNames ];
	}
	else
	{
		suiteNames = suiteNames.slice();
	}
	
	if( topicFound === undefined )
	{
		topicFound = false;
	}
	
	if( forSuite === undefined )
	{
		forSuite = false;
	}
	
	if( sys.hasType( suiteObj, "obj" ) === false )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"A suite must be an obj",
			{ invalidSuite: suiteObj },
			"SuiteRepresentationNotValid"
		);
	}
	
	var nrProps = 0;
	
	for( var prop in suiteObj )
	{
		if( suiteObj[ prop ] !== undefined )
		{
			nrProps++;
			
			if(
				prop !== "conf" &&
				prop !== "vars" &&
				prop !== "before" &&
				prop !== "beforeCb" &&
				prop !== "topic" &&
				prop !== "topicCb" &&
				prop !== "argsVer" &&
				prop !== "vows" &&
				prop !== "next" &&
				prop !== "after" &&
				prop !== "afterCb" &&
				prop !== "getSuite"
			)
			{
				throw new SuiteRuntimeError(
					suiteNames,
					"Prop "+prop+" isnt a valid suite prop",
					{ invalidProp: prop },
					"UnknownSuitePropFound"
				);
			}
		}
	}
	
	var getSuite = suiteObj[ "getSuite" ];
	var conf = suiteObj[ "conf" ];
	var vars = suiteObj[ "vars" ];
	var before = suiteObj[ "before" ];
	var beforeCb = suiteObj[ "beforeCb" ];
	var topic = suiteObj[ "topic" ];
	var topicCb = suiteObj[ "topicCb" ];
	var argsVer = suiteObj[ "argsVer" ];
	var vows = suiteObj[ "vows" ];
	var next = suiteObj[ "next" ];
	var after = suiteObj[ "after" ];
	var afterCb = suiteObj[ "afterCb" ];
	
	if( getSuite !== undefined )
	{
		if( hasT( getSuite, "func" ) === false )
		{
			throw new SuiteRuntimeError(
				suiteNames,
				"Suite prop getSuite must be undef or a func",
				{ before: before },
				"GetSuiteIsNotValid"
			);
		}
		
		if( nrProps > 1 )
		{
			throw new SuiteRuntimeError(
				suiteNames,
				"Suite prop getSuite may not be accompanied by any "+
				"other Suite props",
				undefined,
				"SuitePropGetSuiteNotAlone"
			);
		}
		
// When the func assigned to Suite prop getSuite is ran will
// return the actual Suite to run.
		return;
	}
	
	if( topicFound === false )
	{
		topicFound = topic !== undefined || topicCb !== undefined;
	}
	
	var res = Suite.confIsValid( conf );
	
	if( res !== undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"There is an error with suite prop conf:\n"+
			res.msg,
			res.errorVar,
			"ConfIsNotValid"
		);
	}
	
	if(
		before !== undefined &&
		sys.hasType( before, "func" ) === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop before of a suite must be undef or a func",
			{ before: before },
			"BeforeIsNotValid"
		);
	}
	
	if(
		beforeCb !== undefined &&
		sys.hasType( beforeCb, "func" ) === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop beforeCb of a suite must be undef or a func",
			{ beforeCb: beforeCb },
			"BeforeIsNotValid"
		);
	}
	
	if( before !== undefined && beforeCb !== undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"A suite cant have both props before and "+
			"beforeCb set",
			{ before: before, beforeCb: beforeCb },
			"BeforeIsNotValid"
		);
	}
	
	if(
		topic !== undefined && topic instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop topic of a suite must be undef or a func",
			{ topic: topic },
			"TopicIsNotValid"
		);
	}
	
	if(
		topicCb !== undefined &&
		topicCb instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop topicCb of a suite must be undef or "+
			"a func",
			{ topicCb: topicCb },
			"TopicIsNotValid"
		);
	}
	
	if( topic !== undefined && topicCb !== undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"A suite cant have both props topic and "+
			"topicCb set",
			{ topic: topic, topicCb: topicCb },
			"TopicIsNotValid"
		);
	}
	
	if(
		sys.hasType( argsVer, "undef", "arr" ) === false &&
		argsVer instanceof FuncVer === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop argsVer of a suite must be undef, "+
			"an arr or a FuncVer",
			{ argsVer: argsVer },
			"ArgsVerIsNotValid"
		);
	}
	
	if( sys.hasType( argsVer, "arr" ) === true )
	{
		try
		{
			new FuncVer( argsVer );
		}
		catch( e )
		{
			throw new SuiteRuntimeError(
				suiteNames,
				"If prop argsVer of a suite is an arr then "+
				"it must be valid as the first arg of FuncVer's "+
				"constructor but an error was thrown when trying to "+
				"construct a FuncVer",
				{ thrownErr: e },
				"ArgsVerIsNotValid"
			);
		}
	}
	
	if(
		vows !== undefined &&
		( sys.hasType( vows, "arr" ) === false || vows.length === 0 )
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop vows of a suite must be "+
			"an non-empty arr of vows",
			{ vows: vows },
			"VowsAreNotValid"
		);
	}
	
	if(
		next !== undefined &&
		( sys.hasType( next, "arr" ) === false || next.length === 0 )
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop next of a suite must be "+
			"an non-empty arr of suites",
			{ next: next },
			"NextSuitesAreNotValid"
		);
	}
	
	if( sys.hasType( vars, "obj", "undef" ) === false )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop vars of a suite must be undef or an obj",
			{ vars: vars },
			"VarsIsNotValid"
		);
	}
	
	if(
		after !== undefined &&
		sys.hasType( after, "func" ) === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop after of a suite must be undef or a func",
			{ after: after },
			"AfterIsNotValid"
		);
	}
	
	if(
		afterCb !== undefined &&
		sys.hasType( afterCb, "func" ) === false
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop afterCb of a suite must be undef or a func",
			{ afterCb: afterCb },
			"AfterIsNotValid"
		);
	}
	
	if( after !== undefined && afterCb !== undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"A suite cant have both props after and "+
			"afterCb set",
			{ after: after, afterCb: afterCb },
			"AfterIsNotValid"
		);
	}
	
	if( conf === undefined )
	{
		conf = {};
	}
	
// It is required that the suite has a topic/topicCb depending on
// which of the conf props allowCbErr or allowThrownErr are set,
// and this is therefore verified. The values are therefore not
// overriden here by the global conf props for the purpose of
// verification
	var allowThrownErr = conf[ "allowThrownErr" ];
	var allowCbErr = conf[ "allowCbErr" ];
	var sequential = conf[ "sequential" ];
	var verifyArgs = conf[ "verifyArgs" ];
	var localVerifyArgs = verifyArgs;
	
// Depending on if the suite's conf prop verifyArgs requies the
// topic result to be verified, it must be verfied that suite
// prop argsVer is set. But if verifyArgs isnt set then it is
// overriden by the suite's global conf prop and therefore it
// must be consulted
	if( verifyArgs === undefined )
	{
		verifyArgs = suite.globalConf.verifyArgs;
	}
	
	if(
		allowThrownErr !== undefined &&
		topicCb === undefined &&
		topic === undefined
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop allowThrownErr of suite prop conf may be set only "+
			"if the suite has a topic or topicCb",
			{ allowThrownErr: allowThrownErr },
			"AllowThrownErrWithoutTopic"
		);
	}
	
	if( allowCbErr !== undefined && topicCb === undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop allowCbErr of suite prop conf may only be set "+
			"if the suite has a topicCb",
			{ allowCbErr: allowCbErr },
			"AllowCbErrWithoutTopicCb"
		);
	}
	
// It doesnt matter if verifyArgs is false, nor if there is a
// topic; a suite without vows, next and argsVer is pointless
	if(
		vows === undefined &&
		next === undefined &&
		argsVer === undefined
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"A suite must have one of the props vows, argsVer or "+
			"next set",
			{ suite: suiteObj },
			"SuiteHasNoRequiredProp"
		);
	}
	
	if( vows !== undefined )
	{
		if( topicFound === false )
		{
			throw new SuiteRuntimeError(
				suiteNames,
				"If a suite has vows then it or one of its parent "+
				"suites must have a topic (or topicCb)",
				undefined,
				"VowsWithoutTopic"
			);
		}
		
		var vowDic = {};
		
		for( var key = 0; key < vows.length; key+=2 )
		{
			var vowName = vows[ key ];
			var vow = vows[ key+1 ];
			
			if(
				sys.hasType( vowName, "str" ) === false ||
				vowName.length === 0
			)
			{
				throw new SuiteRuntimeError(
					suiteNames,
					"A vow's name must be a non-empty str",
					{ vowName: vowName },
					"VowsAreNotValid"
				);
			}
			
			if( vowDic[ vowName ] === true )
			{
				throw new SuiteRuntimeError(
					suiteNames,
					"Vow names must be unique but the name '"+vowName+
					"' is used many times",
					undefined,
					"VowsAreNotValid"
				);
			}
			
			vowDic[ vowName ] = true;
			
			if( vow instanceof Function === false )
			{
				throw new SuiteRuntimeError(
					suiteNames,
					"A vow must be a func but this isnt so for the vow"+
					"named '"+vowName+"'",
					{ vowName: vowName, vow: vow },
					"VowsAreNotValid"
				);
			}
		}
	}
	
	if(
// If the suite's prop conf has verifyArgs set to true then
// the suite's prop argsVer must be set accordingly
		( localVerifyArgs === true && argsVer === undefined ) ||
// If the suite's prop conf hasnt set verifyArgs then it's
// overriden by the global conf, but you shouldnt be forced to
// have suite prop argsVer set if there is no topic/topicCb
		(
			localVerifyArgs === undefined &&
			( topic !== undefined || topicCb !== undefined ) &&
			verifyArgs === true &&
			argsVer === undefined
		)
	)
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop argsVer of a suite must be set if the suite's conf "+
			"prop verifyArgs is true (or if it's undef but the "+
			"global conf prop verifyArgs is true)",
			undefined,
			"ArgsVerIsNotValid"
		);
	}
	
	if( verifyArgs === false && argsVer !== undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"Prop argsVer of a suite may not be set if the suite's "+
			"conf prop verifyArgs is false (or if it's undef but the "+
			"global conf prop verifyArgs is false)",
			undefined,
			"ArgsVerIsNotValid"
		);
	}
	
	if( topicFound === false && argsVer !== undefined )
	{
		throw new SuiteRuntimeError(
			suiteNames,
			"If a suite has prop argsVer set then it or a parent "+
			"suite must have a topic/topicCb",
			undefined,
			"ArgsVerWithoutTopic"
		);
	}
	
// forSuite indicates if this is the root SuiteHolder created
// for a Suite. In such case the child Suites kept by next have
//already been verified and this doesnt have to be done again
	if( next !== undefined && forSuite === false )
	{
		var suiteDic = {};
		
		for( var item = 0; item < next.length; item+=2 )
		{
			var suiteName = next[ item ];
			var suiteObj = next[ item+1 ];
			
			if( Suite.suiteNameIsValid( suiteName ) === false )
			{
				throw new SuiteRuntimeError(
					suiteNames,
					"In the suite prop next a suite's name must be a "+
					"non-empty str",
					{ invalidSuiteName: suiteName },
					"NextSuitesAreNotValid"
				);
			}
			
			if( suiteDic[ suiteName ] === true )
			{
				throw new SuiteRuntimeError(
					suiteNames,
					"In the suite prop next suite names must be unique "+
					"but the name '"+suiteName+"' is used more than once",
					undefined,
					"NextSuitesAreNotValid"
				);
			}
			
			suiteDic[ suiteName ] = true;
			
			var SuiteNamesWithChild = suiteNames.slice();
			
			SuiteNamesWithChild.push( suiteName );
			
			SuiteHolder.verSuiteObj(
				SuiteNamesWithChild, suite, suiteObj, topicFound
			);
		}
	}
});

SuiteHolder.orderArr =
function( arr )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		arr !== undefined &&
		arr instanceof Array === false
	)
	{
		throw new TestRuntimeError(
			"Arg arr must be undef or an arr", { providedArg: arr }
		);
	}
	
	if( arr === undefined )
	{
		return undefined;
	}
	
	var returnVar = [];
	
	for( var item = 0; item < arr.length; item+=2 )
	{
		returnVar.push( { key: arr[ item ], value: arr[ item+1 ] } );
	}
	
	return returnVar;
};

SuiteHolder.copySet =
function( set )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided"
		);
	}
	
	if(
		set !== undefined &&
		set.__proto__ !== Object.prototype &&
		set instanceof Array === false
	)
	{
		throw new TestRuntimeError(
			"Arg set must be undef, an obj or an arr", { set: set }
		);
	}
	
	if( set === undefined )
	{
		return undefined;
	}
	
	var returnVar = undefined;
	
	if( set instanceof Array === true )
	{
		returnVar = [];
	}
	else
	{
		returnVar = {};
	}
	
	for( var key in set )
	{
		returnVar[ key ] = set[ key ];
	}
	
	return returnVar;
};

SuiteHolder.prototype.toString =
getF(
getV()
	.setR( "str" ),
function()
{
	var suiteNames = [];
	
	var suiteHolder = this;
	
	while( suiteHolder !== undefined )
	{
		suiteNames.unshift( suiteHolder.name );
		
		suiteHolder = suiteHolder.parent;
	}
	
	return Suite.getSuiteName( suiteNames );
});

});
