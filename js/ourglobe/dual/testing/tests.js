function Tests( testsName )
{
	this.testsName = testsName;
	this.tests = {};
}

Tests.prototype.add = function( tests )
{
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
		
		if( testName in this.tests === true )
		{
			throw new Error(
				"Tests object '"+this.testsName+"' already has a test "+
				"named '"+testName+"'"
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
		
		this.tests[testName] = test;
	}
	
	return this.tests;
}

exports.Tests = Tests;
