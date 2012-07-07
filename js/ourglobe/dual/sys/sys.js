og.core.define(
[ "require", "exports" ],
function( require, exports )
{

var sys = {};

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

sys.hasType = function( variable )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 2, undefined );
	}
	
	var varType = sys.typeOf( variable );
	
	for( var pos = 1; pos < arguments.length; pos++ )
	{
		var reqType = arguments[ pos ];
		
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
				"One of the provided args isnt a valid type",
				{ providedArg: reqType, argPos: pos }
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
						"with is a func but it didnt return a FuncVer",
						{ returnedVar: funcVer }
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

var OurGlobeError = require( "./ourglobeerror" ).OurGlobeError;
var RuntimeError = require( "./runtimeerror" ).RuntimeError;

var conf = require( "og/d/conf/conf" ).conf;
var assert = require( "og/d/verification/assert" ).assert;
var FuncVer = require( "og/d/verification/funcver" ).FuncVer;

});
