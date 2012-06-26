var util = require("util");

var sys = {};
/*
This func may only depend on the following funcs:
 sys.hasType()
 /conf/conf.doVer()
 /verification/assert()
*/
sys.extend = function( subClass, superClass )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 2 );
		
		assert.argType( "subClass", subClass, "func" );
		assert.argType( "superClass", superClass, "func" );
	}
	
	subClass.prototype.__proto__ = superClass.prototype;
	
	Object.defineProperty(
		subClass.prototype,
		"ourGlobeSuper",
		{ value: superClass, enumerable:false }
	);
}

/*
This func may only depend on the following funcs:
 /conf/conf.doVer()
 /verification/assert()
*/
sys.isOurType = function( str )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
	}
	
	return(
		str === "any" ||
		str === "object" || str === "obj" ||
		str === "function" || str === "func" ||
		str === "array" || str === "arr" ||
		str === "string" || str === "str" ||
		str === "boolean" || str === "bool" ||
		str === "number" ||
		str === "integer" || str === "int" ||
		str === "undefined" || str === "undef" ||
		str === "null"
	);
}

/*
This func may NOT directly nor indirectly be dependent on
assert.argType()!
*/
sys.typeOf = function( variable )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
	}
	
	return (
		variable === null ? "null" :
		variable instanceof Array === true ? "array" :
		typeof( variable )
	);
}

/*
This func may NOT directly nor indirectly be dependent on
assert.argType()!
*/
sys.hasType = function( variable )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 2, undefined );
	}
	
	var varType = sys.typeOf( variable );
	
	for( var pos = 1; pos < arguments.length; pos++ )
	{
		var reqType = arguments[pos];
		
		var hasType =
			reqType === "any" ? true :
			
			reqType === "number" ? varType === "number" :
			
			( reqType === "integer" || reqType === "int" ) ?
			varType === "number" && variable % 1 === 0 :
			
			( reqType == "boolean" || reqType === "bool" ) ?
			varType === "boolean" :
			
			( reqType === "string" || reqType === "str" ) ?
			varType === "string" :
			
			( reqType === "undefined" || reqType === "undef" ) ?
			varType === "undefined" :
			
			reqType === "null" ? varType === "null" :
			
			( reqType === "array" || reqType === "arr" ) ?
			varType === "array" :
			
			( reqType === "function" || reqType === "func" ) ?
			varType === "function" :
			
			( reqType === "object" || reqType === "obj" ) ?
			varType === "object" :
			
			undefined
		;
		
		if( hasType === true )
		{
			return true;
		}
		else if( hasType === undefined )
		{
			throw new RuntimeError(
				"Arg value '" + reqType + "' isnt a valid type"
			);
		}
	}
	
	return false;
}

sys.errorCheck = function( err, cb )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ "any", "func" ] ).verArgs( arguments );
	}
	
	if( err instanceof Error === true )
	{
		cb( err );
		
		return true;
	}
	
	return false;
}

sys.getFunc = function( funcVer, func )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ [ FuncVer, "func" ], "func" ] )
			.verArgs( arguments )
		;
		
		var newFunc =
		function()
		{
			if( conf.doVer() === false )
			{
				return func.apply( this, arguments );
			}
			else
			{
				funcVer =
					funcVer instanceof FuncVer === true ?
					funcVer :
					funcVer()
				;
				
				if( funcVer instanceof FuncVer === false )
				{
					throw new RuntimeError(
						"The arg funcVer that sys.getFunc() was provided "+
						"with for constructing this func is a func but it "+
						"didnt return a FuncVer"
					);
				}
				
				funcVer.verArgs( arguments );
				
				var returnVar = func.apply( this, arguments );
				
				funcVer.verReturn( returnVar );
				
				return returnVar;
			}
		};
		
		return newFunc;
	}
	else
	{
		return func;
	}
}

exports.sys = sys;

var RuntimeError = require("ourglobe/sys/errors").RuntimeError;

var conf = require("ourglobe/conf/conf").conf;
var assert = require("ourglobe/verification/assert").assert;
var FuncVer = require("ourglobe/verification/funcver").FuncVer;
