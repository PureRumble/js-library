ourglobe.define(
[
	"./testruntimeerror",
	"./suiteruntimeerror",
	"./test",
],
function( mods )
{

var TestRuntimeError = undefined;

mods.delay(
	function()
	{
		TestRuntimeError = mods.get( "testruntimeerror" );
	}
);

var Suite =
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
		parentSuite instanceof Suite === false
	)
	{
		throw new TestRuntimeError(
			"Arg parentSuite must be undef or a Suite"
		);
	}
	
	Suite.verSuiteObj( name, suiteObj );
	
	this.name = name;
	this.parent = parentSuite;
	this.topic = suiteObj.topic;
	this.vows = Suite.orderArr( suiteObj.vows );
};

return Suite;

},
function( mods, Suite )
{

var TestRuntimeError = mods.get( "testruntimeerror" );
var SuiteRuntimeError = mods.get( "suiteruntimeerror" );

Suite.verSuiteObj =
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
	
	for( var key in suiteObj )
	{
		empty = false;
		
		if( key !== "topic" && key !== "vows" )
		{
			throw new SuiteRuntimeError(
				msgPrefix+"Key '"+key+"' isnt a valid suite obj key"
			);
		}
	}
	
	if( empty === true )
	{
		throw new SuiteRuntimeError(
			msgPrefix+"A suite obj may not be empty"
		);
	}
	
	var topic = suiteObj[ "topic" ];
	var vows = suiteObj[ "vows" ];
	
	if(
		topic !== undefined && topic instanceof Function === false
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Key 'topic' of a suite obj must be a func"
		);
	}
	
	if(
		vows !== undefined &&
		( vows instanceof Array === false || vows.length === 0 )
	)
	{
		throw new SuiteRuntimeError(
			msgPrefix+"Key 'vows' of a suite obj must be "+
			"an non-empty arr of vows"
		)
	}
	
	if( vows !== undefined )
	{
		if( topic === undefined )
		{
			throw new SuiteRuntimeError(
				msgPrefix+"A suite with vows must also have a topic"
			);
		}
		
		for( var key = 0; key < vows.length; key+=2 )
		{
			var vowName = vows[ key ];
			var vow = vows[ key+1 ];
			
			if(
				typeof( vowName ) !== "string"  ||
				vowName.length === 0
			)
			{
				throw new SuiteRuntimeError(
					msgPrefix+"A vow's name must be a non-empty str"
				);
			}
			
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
};

Suite.orderArr =
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

Suite.copySet =
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
		set instanceof Object === false &&
		set instanceof Array === false
	)
	{
		throw new TestRuntimeError(
			"Arg set must be an obj or an arr"
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

Suite.prototype.run =
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
		parentRun instanceof Object === false
	)
	{
		throw new TestRuntimeError(
			"Arg parentRun must be an obj", { providedArg: parentRun }
		);
	}
	
	if( cb instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg cb must be a func", { providedArg: cb }
		);
	}
	
	var topicArgs = [];
	
	var topic = this.topic;
	var obj = {};
	
	var returnVar = topic.apply( obj, topicArgs );
	
	var run = {};
	
	run.topicRes = {};
	run.topicRes.res = returnVar;
	
	cb( run );
};

});
