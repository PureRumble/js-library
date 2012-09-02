ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror"
],
function( mods )
{

var getF = ourglobe.getF;
var getV = ourglobe.getV;

var sys = ourglobe.sys;
var FuncVer = ourglobe.FuncVer;

var SuiteHolder =
getF(
function()
{
	return(
		getV()
			.addA(
				FuncVer.PROPER_STR, "obj", [ SuiteHolder, "undef" ]
			)
	);
},
function( name, suiteObj, parentSuite )
{
	if( parentSuite === undefined )
	{
		SuiteHolder.verSuiteObj( name, suiteObj );
	}
	
	this.name = name;
	this.parent = parentSuite;
	this.topic = suiteObj.topic;
	this.topicCb = suiteObj.topicCb;
	this.vows = SuiteHolder.orderArr( suiteObj.vows );
	this.next = SuiteHolder.orderArr( suiteObj.next );
	this.argsVer = suiteObj.argsVer;
	
	if( sys.hasType( suiteObj.argsVer, "arr" ) === true )
	{
		this.argsVer = new FuncVer( this.argsVer );
	}
	
	this.conf = SuiteHolder.copySet( suiteObj.conf );
	
	if( this.conf === undefined )
	{
		this.conf = {};
	}
	
	this.local = SuiteHolder.copySet( suiteObj.local );
	
	if( this.local === undefined )
	{
		this.local = {};
	}
	
	if( this.conf.verifyArgs === undefined )
	{
		this.conf.verifyArgs =
			this.topic !== undefined || this.topicCb !== undefined
		;
	}
	
	if( this.conf.allowThrownErr === undefined )
	{
		this.conf.allowThrownErr = false;
	}
	
	if( this.conf.allowCbErr === undefined )
	{
		this.conf.allowCbErr = false;
	}
	
	if( this.next !== undefined )
	{
		for( var item = 0; item < this.next.length; item++ )
		{
			var suite = this.next[ item ];
			
			suite.value =
				new SuiteHolder( suite.key, suite.value, this )
			;
		}
	}
});

return SuiteHolder;

},
function( mods, SuiteHolder )
{

var FuncVer = ourglobe.FuncVer;
var sys = ourglobe.sys;
var getF = ourglobe.getF;
var getV = ourglobe.getV;

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

SuiteHolder.verSuiteObj =
getF(
getV()
	.addA( FuncVer.PROPER_STR, "obj", "bool/undef" )
	.setR( "bool" ),
function( name, suiteObj, topicFound )
{
	if( topicFound === undefined )
	{
		topicFound = false;
	}
	
	for( var prop in suiteObj )
	{
		if(
			prop !== "conf" &&
			prop !== "local" &&
			prop !== "topic" &&
			prop !== "topicCb" &&
			prop !== "argsVer" &&
			prop !== "vows" &&
			prop !== "next"
		)
		{
			throw new SuiteRuntimeError(
				"Prop "+prop+" isnt a valid suite prop",
				{ suiteName: name },
				"UnknownSuitePropFound"
			);
		}
	}
	
	var conf = suiteObj[ "conf" ];
	var local = suiteObj[ "local" ];
	var topic = suiteObj[ "topic" ];
	var topicCb = suiteObj[ "topicCb" ];
	var argsVer = suiteObj[ "argsVer" ];
	var vows = suiteObj[ "vows" ];
	var next = suiteObj[ "next" ];
	
	if( topicFound === false )
	{
		topicFound = topic !== undefined || topicCb !== undefined;
	}
	
	if(
		topic !== undefined && topic instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			"Prop topic of a suite must be undef or a func",
			{ suiteName: name, topic: topic },
			"TopicIsNotValid"
		);
	}
	
	if(
		topicCb !== undefined &&
		topicCb instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			"Prop topicCb of a suite must be undef or "+
			"a func",
			{ suiteName: name, topicCb: topicCb },
			"TopicIsNotValid"
		);
	}
	
	if( topic !== undefined && topicCb !== undefined )
	{
		throw new SuiteRuntimeError(
			"A suite cant have both props topic and "+
			"topicCb set",
			{ suiteName: name, topic: topic, topicCb: topicCb },
			"TopicIsNotValid"
		);
	}
	
	if(
		sys.hasType( argsVer, "undef", "arr" ) === false &&
		argsVer instanceof FuncVer === false
	)
	{
		throw new SuiteRuntimeError(
			"Prop argsVer of a suite must be undef, "+
			"an arr or a FuncVer",
			{ suiteName: name, argsVer: argsVer },
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
				"If prop argsVer of a suite is an arr then "+
				"it must be valid as the first arg of FuncVer's "+
				"constructor but an error was thrown when trying to "+
				"construct a FuncVer",
				{ suiteName: name, thrownErr: e },
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
			"Prop vows of a suite must be "+
			"an non-empty arr of vows",
			{ suiteName: name },
			"VowsAreNotValid"
		);
	}
	
	if(
		next !== undefined &&
		( sys.hasType( next, "arr" ) === false || next.length === 0 )
	)
	{
		throw new SuiteRuntimeError(
			"Prop next of a suite must be "+
			"an non-empty arr of suites",
			{ suiteName: name },
			"NextSuitesAreNotValid"
		);
	}
	
	if( sys.hasType( conf, "obj", "undef" ) === false )
	{
		throw new SuiteRuntimeError(
			"Prop conf of a suite must be undef or an obj",
			{ suiteName: name, conf: conf },
			"ConfIsNotValid"
		);
	}
	
	if( sys.hasType( local, "obj", "undef" ) === false )
	{
		throw new SuiteRuntimeError(
			"Prop local of a suite must be undef or an obj",
			{ suiteName: name, local: local },
			"LocalIsNotValid"
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
			prop !== "allowCbErr"
		)
		{
			throw new SuiteRuntimeError(
				"Prop "+prop+" isnt valid for "+
				"suite prop conf",
				{ suiteName: name },
				"ConfIsNotValid"
			);
		}
	}
	
	var verifyArgs = conf[ "verifyArgs" ];
	var allowThrownErr = conf[ "allowThrownErr" ];
	var allowCbErr = conf[ "allowCbErr" ];
	
	if(
		verifyArgs !== undefined &&
		typeof( verifyArgs ) !== "boolean"
	)
	{
		throw new SuiteRuntimeError(
			"Prop verifyArgs of suite prop conf must "+
			"be undef or a bool",
			{ suiteName: name },
			"ConfIsNotValid"
		);
	}
	
	if(
		allowThrownErr !== undefined &&
		typeof( allowThrownErr ) !== "boolean"
	)
	{
		throw new SuiteRuntimeError(
			"Prop allowThrownErr of suite prop conf "+
			"must be undef or a bool",
			{ suiteName: name },
			"ConfIsNotValid"
		);
	}
	
	if(
		allowCbErr !== undefined &&
		typeof( allowCbErr ) !== "boolean"
	)
	{
		throw new SuiteRuntimeError(
			"Prop allowCbErr of suite prop conf "+
			"must be undef or a bool",
			{ suiteName: name },
			"ConfIsNotValid"
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
			"A suite must have one of the props vows, argsVer or "+
			"next set",
			{ suiteName: name, suite: suiteObj },
			"SuiteHasNoRequiredProp"
		);
	}
	
	if( vows !== undefined )
	{
		if( topicFound === false )
		{
			throw new SuiteRuntimeError(
				"If a suite has vows then it or one of its parent "+
				"suites must have a topic (or topicCb)",
				{ suiteName: name },
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
					"A vow's name must be a non-empty str",
					{ suiteName: name },
					"VowsAreNotValid"
				);
			}
			
			if( vowDic[ vowName ] === true )
			{
				throw new SuiteRuntimeError(
					"Vow names must be unique but the name '"+vowName+
					"' is used many times",
					{ suiteName: name },
					"VowsAreNotValid"
				);
			}
			
			vowDic[ vowName ] = true;
			
			if( vow instanceof Function === false )
			{
				throw new SuiteRuntimeError(
					"A vow must be a func but this isnt so for the vow"+
					"named '"+vowName+"'",
					{ suiteName: name },
					"VowsAreNotValid"
				);
			}
		}
	}
	
	var shouldVerArgs =
		topic !== undefined || topicCb !== undefined
	;
	
	if( verifyArgs === true && argsVer === undefined )
	{
		throw new SuiteRuntimeError(
			"Prop argsVer of a suite must be set if "+
			"conf prop verifyArgs is true",
			{ suiteName: name },
			"ArgsVerIsNotValid"
		);
	}
	
	if( verifyArgs === false && argsVer !== undefined )
	{
		throw new SuiteRuntimeError(
			"Prop argsVer of a suite may not be set if "+
			"prop verifyArgs of conf is false",
			{ suiteName: name },
			"ArgsVerIsNotValid"
		);
	}
	
	if( topicFound === false && argsVer !== undefined )
	{
		throw new SuiteRuntimeError(
			"If a suite has prop argsVer set then it or a parent "+
			"suite must have a topic/topicCb",
			{ suiteName: name },
			"ArgsVerWithoutTopic"
		);
	}
	
	if(
		shouldVerArgs &&
		verifyArgs !== false &&
		argsVer === undefined
	)
	{
		throw new SuiteRuntimeError(
			"A suite with a topic/topicCb must have prop argsVer "+
			"set or prop verifyArgs under conf must be false",
			{ suiteName: name },
			"TopicWithoutArgsVer"
		);
	}
	
	var suiteHasVows = vows !== undefined;
	
	if( next !== undefined )
	{
		var suiteDic = {};
		
		for( var item = 0; item < next.length; item+=2 )
		{
			var suiteName = next[ item ];
			var suite = next[ item+1 ];
			
			if(
				sys.hasType( suiteName, "str" ) === false ||
				suiteName.length === 0
			)
			{
				throw new SuiteRuntimeError(
					"A suite's name must be a non-empty str",
					{ suiteName: name },
					"NextSuitesAreNotValid"
				);
			}
			
			if( suiteDic[ suiteName ] === true )
			{
				throw new SuiteRuntimeError(
					"In the suite prop next suite names must be unique "+
					"but the name '"+suiteName+"' is used more than once",
					{ suiteName: name },
					"NextSuitesAreNotValid"
				);
			}
			
			suiteDic[ suiteName ] = true;
			
			if( sys.hasType( suite, "obj" ) === false )
			{
				throw new SuiteRuntimeError(
					"In the suite prop next suites must be non-empty "+
					"objs but this isnt so for the suite named '"+
					suiteName+"'",
					{ suiteName: name },
					"NextSuitesAreNotValid"
				);
			}
			
			var nextSuiteHasVows =
				SuiteHolder.verSuiteObj( suiteName, suite, topicFound )
			;
			
			if( nextSuiteHasVows === true )
			{
				suiteHasVows = true;
			}
		}
	}
	
	if(
		( topic !== undefined || topicCb !== undefined ) &&
		suiteHasVows === false
	)
	{
		throw new SuiteRuntimeError(
			"This suite has a topic/topicCb but no vows and neither "+
			"does any of its child suites",
			{ suiteName: name },
			"TopicWithoutVows"
		);
	}
	
	return suiteHasVows;
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

});
