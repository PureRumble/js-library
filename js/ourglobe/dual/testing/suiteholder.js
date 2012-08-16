ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./test",
],
function( mods )
{

var FuncVer = ourglobe.FuncVer;
var TestRuntimeError = undefined;

mods.delay(
	function()
	{
		TestRuntimeError = mods.get( "testruntimeerror" );
	}
);

var SuiteHolder =
function( name, suiteObj, parentSuite )
{
	if( arguments.length < 2 || arguments.length > 3 )
	{
		throw new TestRuntimeError(
			"Between two and three args must be provided"
		);
	}
	
	if( typeof( name ) !== "string" || name.length === 0 )
	{
		throw new TestRuntimeError(
			"Arg name must be a non-empty str"
		);
	}
	
	if( suiteObj instanceof Object === false )
	{
		throw new TestRuntimeError(
			"Arg suiteObj must be an obj"
		);
	}
	
	if(
		parentSuite !== undefined &&
		parentSuite instanceof SuiteHolder === false
	)
	{
		throw new TestRuntimeError(
			"Arg parentSuite must be undef or a SuiteHolder"
		);
	}
	
	SuiteHolder.verSuiteObj( name, suiteObj );
	
	this.name = name;
	this.parent = parentSuite;
	this.topic = suiteObj.topic;
	this.topicCb = suiteObj.topicCb;
	this.vows = SuiteHolder.orderArr( suiteObj.vows );
	this.argsVer = suiteObj.argsVer;
	
	if( suiteObj.argsVer instanceof Array === true )
	{
		this.argsVer = new FuncVer( this.argsVer );
	}
	
	this.conf = SuiteHolder.copySet( suiteObj.conf );
	
	if( this.conf === undefined )
	{
		this.conf = {};
	}
	
	if( this.conf.verArgs === undefined )
	{
		this.conf.verArgs = true;
	}
	
	if( this.conf.allowThrownErr === undefined )
	{
		this.conf.allowThrownErr = false;
	}
	
	if( this.conf.allowCbErr === undefined )
	{
		this.conf.allowCbErr = false;
	}
};

return SuiteHolder;

},
function( mods, SuiteHolder )
{

var FuncVer = ourglobe.FuncVer;

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

SuiteHolder.verSuiteObj =
function( name, suiteObj )
{
	if( arguments.length !== 2 )
	{
		throw new TestRuntimeError(
			"Exactly two args must be provided"
		);
	}
	
	if( typeof( name ) !== "string" || name.length === 0 )
	{
		throw new TestRuntimeError(
			"Arg name must be a non-empty str"
		);
	}
	
	if( suiteObj instanceof Object === false )
	{
		throw new TestRuntimeError( "Arg suiteObj must be an obj" );
	}
	
	var msgPrefix =
		"The suite obj named '"+name+"' isnt valid:\n"
	;
	var empty = true;
	
	for( var prop in suiteObj )
	{
		empty = false;
		
		if(
			prop !== "conf" &&
			prop !== "topic" &&
			prop !== "topicCb" &&
			prop !== "argsVer" &&
			prop !== "vows"
		)
		{
			throw new SuiteRuntimeError(
				msgPrefix+"Prop '"+prop+"' isnt a valid Suite prop"
			);
		}
	}
	
	if( empty === true )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"A suite obj may not be empty"
		);
	}
	
	var conf = suiteObj[ "conf" ];
	var topic = suiteObj[ "topic" ];
	var topicCb = suiteObj[ "topicCb" ];
	var argsVer = suiteObj[ "argsVer" ];
	var vows = suiteObj[ "vows" ];
	
	if(
		topic !== undefined && topic instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+
			"Prop 'topic' of a Suite must be undef or a func",
			{ topic: topic }
		);
	}
	
	if(
		topicCb !== undefined &&
		topicCb instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'topicCb' of a Suite must be undef or "+
			"a func",
			{ topicCb: topicCb }
		);
	}
	
	if( topic !== undefined && topicCb !== undefined )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"A suite obj cant have both props 'topic' and "+
			"'topicCb' set",
			{ topic: topic, topicCb: topicCb }
		);
	}
	
	if(
		argsVer !== undefined &&
		argsVer instanceof Array === false &&
		argsVer instanceof FuncVer === false
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'argsVer' of a Suite must be undef, "+
			"an arr or a FuncVer",
			{ argsVer: argsVer }
		);
	}
	
	if( argsVer instanceof Array === true )
	{
		try
		{
			new FuncVer( argsVer );
		}
		catch( e )
		{
			throw new SuiteRuntimeError(
				msgPrefix+"If prop 'argsVer' of a Suite is an arr then "+
				"it must be valid as the first arg of FuncVer's "+
				"constructor but an error was thrown when trying to "+
				"construct a FuncVer",
				{ thrownErr: e }
			);
		}
	}
	
	if(
		vows !== undefined &&
		( vows instanceof Array === false || vows.length === 0 )
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'vows' of a suite obj must be "+
			"an non-empty arr of vows"
		);
	}
	
	if(
		( topic !== undefined || topicCb !== undefined ) &&
		vows === undefined
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"A Suite must have vows if it has a topic or "+
			"topicCb"
		);
	}
	
	if( vows !== undefined )
	{
		if( topic === undefined && topicCb === undefined )
		{
			throw new SuiteRuntimeError(
				msgPrefix+"A suite with vows must also have a topic"
			);
		}
		
		var vowDic = {};
		
		for( var key = 0; key < vows.length; key+=2 )
		{
			var vowName = vows[ key ];
			var vow = vows[ key+1 ];
			
			if(
				typeof( vowName ) !== "string" ||
				vowName.length === 0
			)
			{
				throw new SuiteRuntimeError(
					msgPrefix+"A vow's name must be a non-empty str"
				);
			}
			
			if( vowDic[ vowName ] === true )
			{
				throw new SuiteRuntimeError(
					msgPrefix+
					"Vow names must be unique but the name '"+vowName+
					"' is used many times"
				);
			}
			
			vowDic[ vowName ] = true;
			
			if( vow instanceof Function === false )
			{
				throw new SuiteRuntimeError(
					msgPrefix+
					"A vow must be a func but this isnt so for the vow"+
					"named '"+vowName+"'"
				);
			}
		}
	}
	
	if( conf !== undefined && conf instanceof Object === false )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'conf' of a Suite must be undef or an obj",
			{ conf: conf }
		);
	}
	
	if( conf === undefined )
	{
		conf = {};
	}
	
	for( var prop in conf )
	{
		if(
			prop !== "verArgs" &&
			prop !== "allowThrownErr" &&
			prop !== "allowCbErr"
		)
		{
			throw new SuiteRuntimeError(
				msgPrefix+"Prop '"+prop+"' isnt a valid prop for "+
				"Suite prop 'conf'"
			);
		}
	}
	
	var verArgs = conf[ "verArgs" ];
	var allowThrownErr = conf[ "allowThrownErr" ];
	var allowCbErr = conf[ "allowCbErr" ];
	
	if( verArgs !== undefined && typeof( verArgs ) !== "boolean" )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'verArgs' of Suite prop 'conf' must "+
			"be undef or a bool"
		);
	}
	
	if( verArgs === undefined )
	{
		verArgs = true;
	}
	
	if( verArgs === true && argsVer === undefined )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'argsVer' of a Suite must be set if "+
			"'conf' prop 'verArgs' is undef or true"
		);
	}
	
	if( verArgs === false && argsVer !== undefined )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'argsVer' of a Suite may not be set if "+
			"prop 'verArgs' of 'conf' indicates args verification "+
			"should not be done"
		);
	}
	
	if(
		allowThrownErr !== undefined &&
		typeof( allowThrownErr ) !== "boolean"
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'allowThrownErr' of Suite prop 'conf' "+
			"must be undef or a bool"
		);
	}
	
	if(
		allowCbErr !== undefined &&
		typeof( allowCbErr ) !== "boolean"
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Prop 'allowCbErr' of Suite prop 'conf' "+
			"must be undef or a bool"
		);
	}
};

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
