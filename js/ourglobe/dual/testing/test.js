ourglobe.define(
[
	"ourglobe/lib/server/vows"
],
function( mods )
{

var vows = mods.get( "vows" );

var Test =
function( testName )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	if( typeof( testName ) !== "string" || testName.length === 0 )
	{
		throw new Error( "Arg testName must be a non-empty str" );
	}
	
	this.suite = vows.describe( testName );
	this.suite.options.error = false;
};

return Test;

},
function( mods, Test )
{

var FuncVerError = ourglobe.FuncVerError;
var FuncVer = ourglobe.FuncVer;
var getV = ourglobe.getV;

Test.assert =
function( boolVar, errMsg, vowsObjSet )
{
	if( arguments.length < 2 || arguments.length > 3 )
	{
		throw new Error(
			"Between two and three args must be provided"
		);
	}
	
	if( typeof( boolVar ) !== "boolean" )
	{
		throw new Error( "Arg boolVar must be a bool" );
	}
	
	if( typeof( errMsg ) !== "string" || errMsg.length === 0 )
	{
		throw new Error( "Arg errMsg must be a non-empty str" );
	}
	
	if(
		vowsObjSet !== undefined &&
		(
			vowsObjSet instanceof Object === false ||
			vowsObjSet.name === undefined
		)
	)
	{
		throw new Error(
			"Arg vowsObjSet must be an obj with key 'name' set"
		);
	}
	
	if( boolVar === false )
	{
		if( vowsObjSet !== undefined )
		{
			errMsg =
				"An err occurred while parsing the vows obj "+
				"named '"+vowsObjSet.name+"':\n"+
				errMsg
			;
		}
		
		throw new Error( errMsg );
	}
};

Test.isFunc =
function( func )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	return typeof( func ) === "function";
}

Test.isObj =
function( obj )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
// The requirement is relaxed a bit to allows for local objs that
// have the next step in the proto chain set to another local obj
	
	return(
		obj instanceof Object === true &&
		obj.constructor === Object
	);
};

Test.isArr =
function( arr )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	return(
		arr instanceof Array === true &&
		arr.__proto__ === Array.prototype
	);
}

Test.getTopicFunc =
function( topic, local, conf, ver )
{
	Test.assert(
		arguments.length === 4, "Exactly four args must be provided"
	);
	
	Test.assert(
		Test.isFunc( topic ) === true, "Arg topic must be a func"
	);
	
	Test.assert(
		Test.isObj( local ) === true, "Arg local must be an obj"
	);
	
	Test.assert(
		Test.isObj( conf ) === true, "Arg conf must be an obj"
	);
	
	Test.assert(
		ver instanceof FuncVer === true, "Arg ver must be a FuncVer"
	);
	
	return(
		function()
		{
			if( conf.errOccurred === true )
			{
				throw new Error(
					"An error occurred in a topic that belongs to an "+
					"outer vows obj"
				);
			}
			
			var outerThis = this;
			
			var obj =
			{
				local: local,
				callback:
				function( err )
				{
					if(
						err instanceof Error === true &&
						conf.allowErrs === false
					)
					{
						conf.errOccurred = true;
						
						return outerThis.callback.call( outerThis, err );
					}
					
					try
					{
						ver.verArgs( arguments );
					}
					catch( e )
					{
						conf.errOccurred = true;
						
						var err = undefined;
						
						if( e instanceof FuncVerError === true )
						{
							err =
							new Error(
								"The args passed on to the vows by "+
								"the topic werent approved by the FuncVer "+
								"provided by the key 'ver' of the vows obj "+
								"(if conf.allowErrs is true and an err was "+
								"passed to the vows then the FuncVer of 'ver' "+
								"must allow for the err)"
							);
						}
						else
						{
							err =
							new Error(
								"The key 'ver' in the vows obj hasnt been set "+
								"to a valid FuncVer"
							);
						}
						
						return outerThis.callback.call( outerThis, err );
					}
					
					return(
						outerThis.callback.apply( outerThis, arguments )
					);
				}
			};
			
			var errorCaught = false;
			var returnVar = undefined;
			
			try
			{
				returnVar = topic.call( obj );
			}
			catch( e )
			{
				errorCaught = true;
				
				if( conf.allowErrs === false )
				{
					conf.errOccurred = true;
					 
					throw e;
				}
				
				returnVar = e;
			}
			
			if( returnVar !== undefined )
			{
				try
				{
					ver.verArgs( [ returnVar ] );
				}
				catch( e )
				{
					conf.errOccurred = true;
					
					if( e instanceof FuncVerError === true )
					{
						throw new Error(
							"The args passed on to the vows by "+
							"the topic werent approved by the FuncVer "+
							"provided by the key 'ver' of the vows obj "+
							"(if conf.allowErrs is true and an err was "+
							"passed to the vows then the FuncVer of 'ver' "+
							"must allow for the err)"
						);
					}
					else
					{
						throw new Error(
							"The key 'ver' of the vows obj hasnt been set to "+
							"a valid FuncVer"
						);
					}
				}
			}
			
			if( errorCaught === true )
			{
				throw returnVar;
			}
			
			return returnVar;
		}
	);
};

Test.getVowFunc =
function( vow, local, conf )
{
	Test.assert(
		arguments.length === 3, "Exactly three args must be provided"
	);
	
	Test.assert(
		Test.isFunc( vow ) === true, "Arg vow must be a func"
	);
	
	Test.assert(
		Test.isObj( local ) === true, "Arg local must be an obj"
	);
	
	Test.assert(
		Test.isObj( conf ) === true, "Arg conf must be an obj"
	);
	
	return(
		function( err )
		{
			if( conf.errOccurred === true )
			{
				throw err;
			}
			
			var outerThis = this;
			
			var obj = { local: local };
			
			return vow.apply( obj, arguments );
		}
	);
};

Test.prototype.add =
function( local, next )
{
	Test.assert(
		arguments.length >= 1 && arguments.length <= 2,
		"Between one and two args must be provided"
	);
	
	if(
		Test.isArr( local ) === true &&
		next === undefined
	)
	{
		next = local;
		local = undefined;
	}
	
	Test.assert(
		local === undefined ||  Test.isObj( local ) === true,
		"Arg local must be undef or an obj"
	);
	
	Test.assert(
		Test.isArr( next ) === true && next.length > 0,
		"Arg next must be a non-empty arr"
	);
	
	if( local === undefined )
	{
		local = {};
	}
	
	var rootVowsObj = { next: next };
	
	var stack =
	[
		{
			name: "the root vows obj",
			outerLocal: {},
			outerConf: { allowErrs: false, errOccurred: false },
			vowsObj: rootVowsObj
		}
	];
	
	while( stack.length > 0 )
	{
		var set = stack.pop();
		var vowsObj = set.vowsObj;
		var outerLocal = set.outerLocal;
		var outerConf = set.outerConf;
		var local = vowsObj.local;
		var conf = vowsObj.conf;
		var topic = vowsObj.topic;
		var ver = vowsObj.ver;
		var vows = vowsObj.vows;
		var next = vowsObj.next;
		
		for( var prop in vowsObj )
		{
			Test.assert(
				prop === "topic" ||
				prop === "ver" ||
				prop === "local" ||
				prop === "conf" ||
				prop === "vows" ||
				prop === "next",
				"'"+prop+"' isnt a valid vows obj key",
				set
			);
		}
		
		if( "topic" in vowsObj === true )
		{
			delete vowsObj.topic;
		}
		
		if( "ver" in vowsObj === true )
		{
			delete vowsObj.ver;
		}
		
		if( "conf" in vowsObj === true )
		{
			delete vowsObj.conf;
		}
		
		if( "local" in vowsObj === true )
		{
			delete vowsObj.local;
		}
		
		if( "vows" in vowsObj === true )
		{
			delete vowsObj.vows;
		}
		
		if( "next" in vowsObj === true )
		{
			delete vowsObj.next;
		}
		
		Test.assert(
			topic !== undefined || next !== undefined,
			"A vows obj must have atleast one of the keys 'topic' "+
			"or 'next' set",
			set
		);
		
		if( conf === undefined )
		{
			conf = {};
		}
		
		for( var prop in conf )
		{
			Test.assert(
				prop === "allowErrs",
				"'"+prop+"' isnt a valid key for a conf obj",
				set
			);
		}
		
		conf.__proto__ = outerConf;
		
		var allowErrs = conf.allowErrs;
		
// local must be prepared first as it is used by topic and vows
		
		if( local === undefined )
		{
			local = {};
		}
		
		Test.assert(
			Test.isObj( local ) === true,
			"Key 'local' of a vows obj must be an obj",
			set
		);
		
		local.__proto__ = outerLocal;
		
		if( ver !== undefined )
		{
			Test.assert(
				Test.isArr( ver ) === true ||
				ver instanceof FuncVer === true,
				"Key 'ver' of a vows obj must be an arr or a FuncVer"
			);
			
			Test.assert(
				topic !== undefined,
				"Key 'ver' of a vows obj may not be without a topic"
			);
			
			if( ver instanceof FuncVer === false )
			{
				ver = getV( ver );
			}
		}
		
		if( topic !== undefined )
		{
			Test.assert(
				typeof( topic ) === "function",
				"Key 'topic' of a vows obj must be a func",
				set
			);
			
			Test.assert(
				ver !== undefined,
				"Key 'ver' of a vows obj must be set to a FuncVer if "+
				"there is a topic",
				set
			);
			
			Test.assert(
				vows !== undefined || next !== undefined,
				"A topic may not be without both vows and other "+
				"vows objs that are to be executed next",
				set
			);
			
			vowsObj.topic =
				Test.getTopicFunc( topic, local, conf, ver )
			;
			
			if( vows === undefined )
			{
				vows =
				[
					"topic causes no errors (automatically inserted vow)",
					function() { }
				];
			}
		}
		
		if( vows !== undefined )
		{
			Test.assert(
				Test.isArr( vows ) === true && vows.length > 0,
				"Key 'vows' of a vows obj must be a non-empty arr "+
				"containing vows",
				set
			);
			
			Test.assert(
				topic !== undefined,
				"A vows obj cant have vows without a topic",
				set
			);
			
			for( var item = 0; item < vows.length; item += 2 )
			{
				var vowName = vows[ item ];
				var vow = vows[ item+1 ];
				
				Test.assert(
					typeof( vowName ) === "string" || vowName.length > 0,
					"A vow's name must be a non-empty str",
					set
				);
				
				Test.assert(
					vowName !== "topic",
					"A vow may not be named 'topic'",
					set
				);
				
				Test.assert(
					typeof( vow ) === "function",
					"A vow must be a func",
					set
				);
				
				Test.assert(
					vowName in vowsObj === false,
					"There is already a vow named '"+vowName+"'",
					set
				);
				
				vowsObj[ vowName ] = Test.getVowFunc( vow, local, conf );
			}
		}
		
		if( next !== undefined )
		{
			Test.assert(
				Test.isArr( next ) === true && next.length > 0,
				"Key 'next' of a vows obj must be a non-empty arr "+
				"containing vows objs",
				set
			);
			
			for( var item = 0; item < next.length; item += 2 )
			{
				var nextVowsObjName = next[ item ];
				var nextVowsObj = next[ item+1 ];
				
				Test.assert(
					typeof( nextVowsObjName ) === "string" &&
					nextVowsObjName.length > 0,
					"A vows obj's name must be a non-empty str "+
					"but this isnt true for one of the vows objs in "+
					"the arr 'next'",
					set
				);
				
				Test.assert(
					nextVowsObjName !== "topic",
					"A vows obj may not be named 'topic' "+
					"but this isnt true for one of the vows objs in "+
					"the arr 'next'",
					set
				);
				
				Test.assert(
					Test.isObj( nextVowsObj ),
					"A vows obj must be an obj but this isnt "+
					"true for the vows obj in the arr 'next' named "+
					"'"+nextVowsObjName+"'",
					set
				);
				
				Test.assert(
					nextVowsObjName in vowsObj === false,
					"A vows obj in the arr 'next' is named "+
					"'"+nextVowsObjName+"' but there is already a "+
					"vow/vows obj in the containing vows obj with the "+
					"same name",
					set
				);
				
				vowsObj[ nextVowsObjName ] = nextVowsObj;
				
				stack.push(
					{
						name: nextVowsObjName,
						outerLocal: local,
						outerConf: conf,
						vowsObj: nextVowsObj
					}
				);
			}
		}
	}
	
	this.suite.addVows( rootVowsObj );
};

Test.prototype.run =
function()
{
	if( arguments.length !== 0 )
	{
		throw new Error( "No args may be provided" );
	}
	
	return this.suite.run();
};

Test.getTests =
function()
{
	var tests = Array.prototype.slice.call( arguments );
	var testObj = {};
	
	var topicFound = false;
	var testFound = false;
	var nestedTestObjFound = false;
	
	for( var pos = 0; pos < tests.length; pos += 2 )
	{
		var testName = tests[ pos ];
		var test = tests[ pos+1 ];
		
		if( typeof( testName ) !== "string" )
		{
			throw new Error(
				"Argument nr "+pos+" must be a test name"
			);
		}
		
		if( testName in testObj === true )
		{
			throw new Error(
				"A test  named '"+testName+"' has already been added "+
				"to the tests"
			);
		}
		
		if(
			typeof( test ) !== "object" &&
			typeof( test ) !== "function"
		)
		{
			throw new Error(
				"Argument nr "+pos+" must be a func or obj"
			);
		}
		
		if( testName === "topic" )
		{
			if( pos !== 0 )
			{
				throw new Error(
					"The topic must be placed before the tests and "+
					"nested test objs"
				);
			}
			
			if( typeof( test ) !== "function" )
			{
				throw new Error( "The topic must be a function" );
			}
			
			topicFound = true;
		}
		else if( typeof( test ) === "object" )
		{
			nestedTestObjFound = true;
		}
		else if( typeof( test ) === "function" )
		{
			if( topicFound === false )
			{
				throw new Error(
					"Tests must have a topic and be placed after their "+
					"topic"
				);
			}
			
			if( nestedTestObjFound === true )
			{
				throw new Error(
					"Tests must be placed before nested test objs"
				);
			}
			
			testFound = true;
		}
		
		testObj[ testName ] = test;
	}
	
// The conditions in the loop above already make sure that there
// cant be tests without an accompanying topic
	
	if(
		topicFound === true &&
		testFound === false &&
		nestedTestObjFound === false
	)
	{
		throw new Error(
			"A topic must be accompanied by tests or nested test objs"
		);
	}
	
	return testObj;
};

Test.errorCheck =
function( variable )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	if( variable instanceof Error === true )
	{
		throw variable;
	}
};

Test.errorCheckArgs =
function( args )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	try
	{
		args = Array.prototype.slice.call( args );
	}
	catch( e )
	{
		throw new Error( "Arg args must be an arguments obj" );
	}
	
	for( var pos in args )
	{
		if( args[ pos ] instanceof Error === true )
		{
			throw args[ pos ];
		}
	}
};

Test.getVar =
function( func )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	if( typeof( func ) !== "function" )
	{
		throw new Error( "Arg func must be a func" );
	}
	
	var returnVar = func();
	
	if( returnVar === undefined )
	{
		throw new Error(
			"Arg func may not be without a return statement, nor may "+
			"it return undef"
		);
	}
	
	return returnVar;
};

Test.areEqual =
function( objOne, objTwo )
{
	if( arguments.length !== 2 )
	{
		throw new Error( "Exactly two args must be provided" );
	}
	
	return Test.compare( objOne, objTwo ) === undefined;
};

Test.compare =
function( objOne, objTwo )
{
	if( arguments.length !== 2 )
	{
		throw new Error( "Exactly two args must be provided" );
	}
	
	if( objOne === objTwo )
	{
		return undefined;
	}
	else if(
		typeof( objOne ) === "object" &&
		typeof( objTwo ) === "object"
	)
	{
		if( objOne.__proto__ !== objTwo.__proto__ )
		{
			return "< different constructors or proto chains >";
		}
		
		if( objOne.__proto__ === Buffer.prototype )
		{
			if( objOne.length !== objTwo.length )
			{
				var returnVar =
					"< different buffer lengths "+
					objOne.length+
					" and "+
					objTwo.length+
					" >"
				;
				
				return returnVar;
			}
			
			for( var pos = 0; pos < objOne.length; pos++ )
			{
				if( objOne[ pos ] !== objTwo[ pos ] )
				{
					var returnVar =
						"< different buffer values on pos "+pos+" >"
					;
					
					return returnVar;
				}
			}
			
			return undefined;
		}
		else if( objOne.__proto__ === Date.prototype )
		{
			if( objOne.getTime() !== objTwo.getTime() )
			{
				var timeOne = objOne.getTime();
				var timeTwo = objTwo.getTime();
				
				var returnVar =
					"< different date times "+timeOne+" and "+timeTwo+" >"
				;
				
				return returnVar;
			}
			
			return undefined;
		}
		
		var onesKeys = Object.keys( objOne );
		var twosKeys = Object.keys( objTwo );
		
		if( onesKeys.length !== twosKeys.length )
		{
			var returnVar =
				"< different nr of items/props "+
				onesKeys.length+" and "+twosKeys.length+" >"
			;
			
			return returnVar;
		}
		
		for( var pos in onesKeys )
		{
			var key = onesKeys[ pos ];
			
			var result =
				key in objTwo === false ?
					false :
				
				objOne.hasOwnProperty( key ) !==
					objTwo.hasOwnProperty( key )
				?
					false :
				
				typeof( objOne[ key ] ) !== "object" ?
					objOne[ key ] === objTwo[ key ] :
				
				Test.compare(
					objOne[ key ], objTwo[ key ]
				)
			;
			
			result =
				result === true ?
					undefined :
					(
						result === false ?
							"< different variables for item/prop >" :
							result
					)
			;
			
			if( result !== undefined )
			{
				return key+"."+result;
			}
		}
		
		return undefined;
	}
	
	return "< variables not equal >";
};

Test.clone =
function( source )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	if( typeof( source ) !== "object" || sourceVar === null )
	{
		return source;
	}
	
	if( source instanceof Buffer === true )
	{
		var buf = new Buffer( source.length );
		
		source.copy( buf );
		
		return buf;
	}
	else if( source instanceof Date === true )
	{
		return new Date( source );
	}
	
	var clone = undefined;
	
	if( source instanceof Array === true )
	{
		clone = [];
	}
	else
	{
		clone = {};
		
		clone.__proto__ = source.__proto__;
	}
	
	for( var key in source )
	{
		if( source.hasOwnProperty( key ) === false ) { continue; }
		
		var sourceVar = source[ key ];
		
		clone[ key ] =
			typeof( sourceVar ) !== "object" ||
			sourceVar === null ||
			(
				source.__proto__ === Buffer.prototype &&
				key === "parent"
			) ?
				sourceVar :
				Test.clone( sourceVar )
		;
	}
	
	return clone;
};

});
