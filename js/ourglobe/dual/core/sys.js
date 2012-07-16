og.core.define(
[],
function()
{

var sys = {};

sys.funcsWithDelayedFvs = [];

sys.prepareDelayedFuncVers =
function()
{
	if( og.conf.doVer() === true )
	{
		new og.FuncVer().verArgs( arguments );
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
		
		if( funcVer instanceof og.FuncVer === false )
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

sys.typeOf = function( variable )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
	}
	
	return (
		variable === null ? "null" :
		variable instanceof Object === false ? typeof( variable ) :
		variable.__proto__ === Object.prototype ? "object" :
		variable instanceof Array === true ? "array" :
		variable instanceof Function === true ? "function" :
		"instance"
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
