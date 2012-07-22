ourglobe.core.define(
[],
function()
{

var sys = {};

sys.funcsWithDelayedFvs = [];

sys.prepareDelayedFuncVers =
function()
{
	if( ourglobe.conf.doVer() === true )
	{
		new ourglobe.FuncVer().verArgs( arguments );
	}
	
	for(
		var item = 0;
		item < sys.funcsWithDelayedFvs.length;
		item++
	)
	{
		var currFunc = sys.funcsWithDelayedFvs[ item ];
		
		var cb = currFunc.ourglobe.funcVer;
		var funcVer = cb();
		
		if( funcVer instanceof ourglobe.FuncVer === false )
		{
			throw new RuntimeError(
				"The cb given to getF() or sys.getFunc() didnt return "+
				"a FuncVer",
				{ returnedVar: funcVer }
			);
		}
		
		currFunc.ourglobe.funcVer = funcVer;
	}
	
	sys.funcsWithDelayedFvs = [];
};

sys.extend = function( subClass, superClass )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 2 );
		
		ourglobe.assert.argType( "subClass", subClass, "func" );
		ourglobe.assert.argType( "superClass", superClass, "func" );
	}
	
	subClass.prototype.__proto__ = superClass.prototype;
	
	Object.defineProperty(
		subClass,
		"ourGlobeSuper",
		{ value: superClass, enumerable:false }
	);
}

sys.getClass =
function( obj )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
	}
	
	if( obj instanceof Object === false )
	{
		return undefined;
	}
	
	return obj.constructor;
}

sys.isOurType = function( str )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
	}
	
	return(
		str === "any" ||
		str === "object" || str === "obj" ||
		str === "instance" || str === "inst" ||
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

sys.getType = function( variable )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
	}
	
	return (
		variable === null ? "null" :
		typeof( variable ) !== "object" ? typeof( variable ) :
		variable.__proto__ === Array.prototype ? "array" :
		variable.__proto__ === Object.prototype ? "object" :
		"instance"
	);
}

sys.hasType = function( variable )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 2, undefined );
	}
	
	var varType = sys.getType( variable );
	
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
					
			reqType === "null" ?
					
					varType === "null" :
					
			( reqType === "array" || reqType === "arr" ) ?
					
					varType === "array" :
					
			( reqType === "function" || reqType === "func" ) ?
					
					varType === "function" :
					
			( reqType === "object" || reqType === "obj" ) ?
					
					varType === "object" :
					
			( reqType === "instance" || reqType === "inst" ) ?
					
					(
						varType === "object" ||
						varType === "array" ||
						varType === "function" ||
						varType === "instance"
					) :
					
			undefined
		;
		
		if( hasType === true )
		{
			return true;
		}
		else if( hasType === undefined )
		{
			throw new ourglobe.RuntimeError(
				"One of the provided args isnt a valid type",
				{ providedArg: reqType, argPos: pos }
			);
		}
	}
	
	return false;
}

sys.errorCheck = function( err, cb )
{
	if( ourglobe.conf.doVer() === true )
	{
		new ourglobe.FuncVer( [ "any", "func" ] )
			.verArgs( arguments )
		;
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
	if( ourglobe.conf.doVer() === true )
	{
		new ourglobe.FuncVer(
			[ [ ourglobe.FuncVer, "func" ], "func" ]
		)
			.verArgs( arguments )
		;
		
		var newFunc =
		function()
		{
			if( ourglobe.conf.doVer() === false )
			{
				return func.apply( this, arguments );
			}
			else
			{
				var funcVer = newFunc.ourglobe.funcVer;
				
				funcVer.verArgs( arguments );
				
				var returnVar = func.apply( this, arguments );
				
				funcVer.verReturn( returnVar );
				
				return returnVar;
			}
		};
		
		newFunc.ourglobe = {};
		newFunc.ourglobe.funcVer = funcVer;
		
		if( sys.hasType( funcVer, "func" ) === true )
		{
			sys.funcsWithDelayedFvs.push( newFunc );
		}
		
		return newFunc;
	}
	else
	{
		return func;
	}
}

return sys;

});
