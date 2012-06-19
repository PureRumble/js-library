var FuncVer = require("ourglobe").FuncVer;

var sys = require("ourglobe").sys;
var MoreObject = require("ourglobe/utils").MoreObject;

var Testing = {};

Testing.getTests = function()
{
	var tests = Array.prototype.slice.call( arguments );
	var testObj = {};
	
	for( var pos = 0; pos < tests.length; pos += 2 )
	{
		var testName = tests[ pos ];
		var test = tests[ pos+1 ];
		
		if( typeof( testName ) !== "string" )
		{
			throw new Error(
				"Argument nr "+pos+" must be a test name but is: "+
				JSON.stringify( testName, undefined, " " )
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
				"Argument nr "+pos+" must be a func or obj but is: "+
				JSON.stringify( test, undefined, " " )
			);
		}
		
		testObj[ testName ] = test;
	}
	
	return testObj;
}

Testing.getPrettyStr = function( variable )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	return MoreObject.getPrettyStr( variable );
}

Testing.errorCheck = function( variable )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	if( variable instanceof Error === true )
	{
		throw variable;
	}
}

Testing.errorCheckArgs = function( args )
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
}

Testing.getVar = function( func )
{
	var fv = new FuncVer(
		[ "func" ], { badTypes:"undef" }
	)
		.verArgs( arguments )
	;
	
	var returnVar = func();
	
	fv.verReturn( returnVar );
	
	return returnVar;
}

Testing.areEqual = function( objOne, objTwo )
{
	if( arguments.length !== 2 )
	{
		throw new Error( "Exactly two args must be provided" );
	}
	
	return Testing.compare( objOne, objTwo ) === undefined;
}

Testing.compare = function( objOne, objTwo )
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
		if(
			objOne.constructor !== objTwo.constructor ||
			objOne.__proto__ !== objTwo.__proto__
		)
		{
			return "< different constructors or proto chains >";
		}
		
		if( objOne.constructor === Buffer )
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
		else if( objOne.constructor === Date )
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
				
				Testing.compare(
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
}

Testing.clone = function( source )
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
			( source.constructor === Buffer && key === "parent" ) ?
				sourceVar :
				Testing.clone( sourceVar )
		;
	}
	
	return clone;
}

exports.Testing = Testing;
