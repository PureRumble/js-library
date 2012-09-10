ourglobe.define(
[
	"./testruntimeerror"
],
function( mods )
{

var Test = {};

return Test;

},
function( mods, Test )
{

var TestRuntimeError = mods.get( "testruntimeerror" );

Test.expectErr =
function(
	testName,
	errClass,
	errCode,
	verError,
	errFunc,
	refFunc
)
{
	if( arguments.length < 4 || arguments.length > 6 )
	{
		throw new TestRuntimeError(
			"Between four and six args must be provided"
		);
	}
	
	if(
		refFunc === undefined &&
		( errFunc === undefined || errFunc instanceof Function ) &&
		verError instanceof Function &&
		errCode instanceof Function
	)
	{
		refFunc = errFunc;
		errFunc = verError;
		verError = errCode;
		errCode = undefined;
	}
	
	if(
		refFunc === undefined &&
		errFunc instanceof Function === true &&
		verError instanceof Function === true
	)
	{
		refFunc = errFunc;
		errFunc = verError;
		verError =
		function( err )
		{
			
		};
	}
	
	if( typeof( testName ) !== "string" )
	{
		throw new TestRuntimeError(
			"Arg testName must be a str", { testName: testName }
		);
	}
	
	if( verError instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg verError must be a func", { verError: verError }
		);
	}
	
	if( errFunc instanceof Function === false )
	{
		throw new TestRuntimeError( "Arg errFunc must be a func" );
	}
	
	if( refFunc instanceof Function === false )
	{
		throw new TestRuntimeError( "Arg refFunc must be a func" );
	}
	
	if( errClass instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg errClass must be a class constr"
		);
	}
	
	if( errCode !== undefined && typeof( errCode ) !== "string" )
	{
		throw new TestRuntimeError(
			"Arg errCode must be a str"
		);
	}
	
	console.log( testName );
	
	var errPrefix =
		"An err occurred when testing '"+testName+"':\n"
	;
	
	var errOk = false;
	
	try
	{
		errFunc();
	}
	catch( e )
	{
		if( e.__proto__ !== errClass.prototype )
		{
			throw new TestRuntimeError(
				errPrefix+
				"The error thrown by the error func isnt of expected "+
				"class",
				{ thrownErr: e }
			);
		}
		
		if( errCode !== undefined && e.ourGlobeCode !== errCode )
		{
			throw new TestRuntimeError(
				errPrefix+
				"The error thrown by the error func doesnt have "+
				"expected error code",
				{ expectedCode: errCode, thrownErr: e }
			);
		}
		
		try
		{
			verError( e );
		}
		catch( e )
		{
			throw new TestRuntimeError(
				errPrefix+
				"The func verError didnt approve of the error that the "+
				"error func threw",
				{ thrownErr: e }
			);
		}
		
		errOk = true;
	}
	
	if( errOk === false )
	{
		throw new TestRuntimeError(
			errPrefix+
			"An error was expected to occur but this didnt happen"
		);
	}
	
	var err = undefined;
	
	try
	{
		refFunc();
	}
	catch( e )
	{
		throw new TestRuntimeError(
			errPrefix+
			"The reference func may not throw an err",
			{ thrownErr: e }
		);
	}
};

Test.expectCbErr =
function( testName, errClass, errCode, cbTime, errFunc, refFunc )
{
	if( arguments.length < 4 || arguments.length > 6 )
	{
		throw new TestRuntimeError(
			"Between four and six args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		refFunc === undefined &&
		( errFunc === undefined || errFunc instanceof Function ) &&
		cbTime instanceof Function === true &&
		(
			typeof( errCode ) === "number" ||
			errCode instanceof Function === true
		)
	)
	{
		refFunc = errFunc;
		errFunc = cbTime;
		cbTime = errCode;
		errCode = undefined;
	}
	
	if(
		cbTime instanceof Function === true &&
		errFunc instanceof Function === true &&
		refFunc === undefined
	)
	{
		refFunc = errFunc;
		errFunc = cbTime;
		cbTime = 200;
	}
	
	if( typeof( testName ) !== "string" )
	{
		throw new TestRuntimeError(
			"Arg testName must be a str", { testName: testName }
		);
	}
	
	if( typeof( cbTime ) !== "number" )
	{
		throw new TestRuntimeError(
			"Arg cbTime must be a number", { cbTime: cbTime }
		);
	}
	
	if( errFunc instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg errFunc must be a func", { errFunc: errFunc }
		);
	}
	
	if( refFunc instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg refFunc must be a func", { refFunc: refFunc }
		);
	}
	
	if( errClass instanceof Function === false )
	{
		throw new TestRuntimeError(
			"Arg errClass must be a class constr",
			{ errClass: errClass }
		);
	}
	
	if( errCode !== undefined && typeof( errCode ) !== "string" )
	{
		throw new TestRuntimeError(
			"Arg errCode must be a str or undef", { errCode: errCode }
		);
	}
	
	console.log( testName );
	
	var errPrefix =
		"An err occurred when testing '"+testName+"':\n"
	;
	
	var errFuncCbArgs = undefined;
	var refFuncCbArgs = undefined;
	
	errFunc(
		function( err )
		{
			if( errFuncCbArgs !== undefined )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to the error func has been called twice",
					{
						previousCbArgs: errFuncCbArgs,
						currentCbArgs: arguments
					}
				);
			}
			
			errFuncCbArgs = arguments;
			
			if( err instanceof Error === false )
			{
				throw new TestRuntimeError(
					errPrefix+
					"An err was expected to be given to the cb of the "+
					"error func but this didnt happen"
				);
			}
			
			if( err.__proto__ !== errClass.prototype )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The error given to the cb of the error func isnt of "+
					"expected class",
					{ cbErr: err }
				);
			}
			
			if( errCode !== undefined && err.ourGlobeCode !== errCode )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The error thrown by the error func doesnt have "+
					"the expected error code",
					{ expectedCode: errCode, cbErr: err }
				);
			}
		}
	);
	
	refFunc(
		function( err )
		{
			if( refFuncCbArgs !== undefined )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to the reference func has been called "+
					"twice",
					{
						previousCbArgs: refFuncCbArgs,
						currentCbArgs: arguments
					}
				);
			}
			
			refFuncCbArgs = arguments;
			
			if( err instanceof Error === true )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The reference func may not cause an error but an "+
					"error was handed to its cb"
				);
			}
		}
	);
	
	setTimeout(
		function()
		{
			if( errFuncCbArgs === undefined )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to the error func hasnt been called"
				);
			}
			
			if( refFuncCbArgs === undefined )
			{
				throw new TestRuntimeError(
					errPrefix+
					"The cb given to the reference func hasnt been called"
				);
			}
		},
		cbTime
	);
};

Test.assert =
function( boolVar, msg )
{
	if( boolVar === false )
	{
		throw new TestRuntimeError( msg );
	}
};

Test.isFunc =
function( func )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	return typeof( func ) === "function";
};

Test.isObj =
function( obj )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
// The requirement is relaxed a bit to allows for local objs that
// have the next step in the proto chain set to another local obj
	
	return(
		obj instanceof Object === true && obj.constructor === Object
	);
};

Test.isArr =
function( arr )
{
	if( arguments.length !== 1 )
	{
		throw new TestRuntimeError(
			"Exactly one arg must be provided",
			{ providedArgs: arguments }
		);
	}
	
	return(
		arr instanceof Array === true &&
		arr.__proto__ === Array.prototype
	);
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
			throw new TestRuntimeError(
				"Argument nr "+pos+" must be a test name"
			);
		}
		
		if( testName in testObj === true )
		{
			throw new TestRuntimeError(
				"A test  named '"+testName+"' has already been added "+
				"to the tests"
			);
		}
		
		if(
			typeof( test ) !== "object" &&
			typeof( test ) !== "function"
		)
		{
			throw new TestRuntimeError(
				"Argument nr "+pos+" must be a func or obj"
			);
		}
		
		if( testName === "topic" )
		{
			if( pos !== 0 )
			{
				throw new TestRuntimeError(
					"The topic must be placed before the tests and "+
					"nested test objs"
				);
			}
			
			if( typeof( test ) !== "function" )
			{
				throw new TestRuntimeError(
					"The topic must be a function"
				);
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
				throw new TestRuntimeError(
					"Tests must have a topic and be placed after their "+
					"topic"
				);
			}
			
			if( nestedTestObjFound === true )
			{
				throw new TestRuntimeError(
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
		throw new TestRuntimeError(
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
		throw new TestRuntimeError(
			"Exactly one arg must be provided"
		);
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
		throw new TestRuntimeError(
			"Exactly one arg must be provided"
		);
	}
	
	try
	{
		args = Array.prototype.slice.call( args );
	}
	catch( e )
	{
		throw new TestRuntimeError(
			"Arg args must be an arguments obj"
		);
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
		throw new TestRuntimeError(
			"Exactly one arg must be provided"
		);
	}
	
	if( typeof( func ) !== "function" )
	{
		throw new TestRuntimeError(
			"Arg func must be a func"
		);
	}
	
	var returnVar = func();
	
	if( returnVar === undefined )
	{
		throw new TestRuntimeError(
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
		throw new TestRuntimeError(
			"Exactly two args must be provided"
		);
	}
	
	return Test.compare( objOne, objTwo ) === undefined;
};

Test.compare =
function( objOne, objTwo )
{
	if( arguments.length !== 2 )
	{
		throw new TestRuntimeError(
			"Exactly two args must be provided"
		);
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
		throw new TestRuntimeError(
			"Exactly one arg must be provided"
		);
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
