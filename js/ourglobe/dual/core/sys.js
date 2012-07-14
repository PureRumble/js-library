og.core.define(
function()
{

var sys = {};

sys.extend = function( subClass, superClass )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 2 );
		
		og.assert.argType( "subClass", subClass, "func" );
		og.assert.argType( "superClass", superClass, "func" );
	}
	
	subClass.prototype.__proto__ = superClass.prototype;
	
	Object.defineProperty(
		subClass,
		"ourGlobeSuper",
		{ value: superClass, enumerable:false }
	);
}

sys.isOurType = function( str )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
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
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
	}
	
	return (
		variable === null ? "null" :
		variable instanceof Array === true ? "array" :
		typeof( variable )
	);
}

sys.hasType = function( variable )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 2, undefined );
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
			throw new og.RuntimeError(
				"One of the provided args isnt a valid type",
				{ providedArg: reqType, argPos: pos }
			);
		}
	}
	
	return false;
}

sys.errorCheck = function( err, cb )
{
	if( og.conf.doVer() === true )
	{
		new og.FuncVer( [ "any", "func" ] ).verArgs( arguments );
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
	if( og.conf.doVer() === true )
	{
		new og.FuncVer( [ [ og.FuncVer, "func" ], "func" ] )
			.verArgs( arguments )
		;
		
		var newFunc =
		function()
		{
			if( og.conf.doVer() === false )
			{
				return func.apply( this, arguments );
			}
			else
			{
				funcVer =
					funcVer instanceof og.FuncVer === true ?
					funcVer :
					funcVer()
				;
				
				if( funcVer instanceof og.FuncVer === false )
				{
					throw new og.RuntimeError(
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

return sys;

});
