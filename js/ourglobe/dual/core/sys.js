ourglobe.core.define(
[],
function()
{

var sys = {};

sys.extend =
function( subClass, superClass )
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
};

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
};

sys.isOurType =
function( str )
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
};

sys.getType =
function( variable )
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
};

sys.hasType =
function( variable )
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
};

sys.errorCheck =
function( err, cb )
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
};

sys.getFunc =
function()
{
	var args = arguments;
	
	if(
		args.length === 0 ||
		sys.hasType( args[ args.length-1 ], "func" ) === false
	)
	{
		throw new ourGlobe.core.FuncCreationRuntimeError(
			"The last arg provided for function creation must be a "+
			"func",
			{ providedArgs: args },
			"InvalidArgsForFuncCreation"
		);
	}
	
	var func = args[ args.length-1 ];
	
	if(
		func.ourGlobe !== undefined &&
		func.ourGlobe.func !== undefined
	)
	{
		throw new ourGlobe.core.FuncCreationRuntimeError(
			"The func provided for function creation must be a "+
			"newly declared function. It may not be a func "+
			"previously created for some other purpose "+
			"(for instance the constr of a class or a func of a "+
			"class)",
			undefined,
			"InvalidArgsForFuncCreation"
		);
	}
	
	if( ourglobe.conf.doVer() === true )
	{
		var newFunc = undefined;
		var currArg = 0;
		var funcVer = undefined;
		var funcVerFunc = undefined;
		var verArgs = undefined;
		var argsAreValid = false;
		
		if(
			args.length > 1 &&
			sys.hasType( args[ currArg ], "func" ) === true
		)
		{
			funcVerFunc = args[ currArg ];
			currArg++;
		}
		else if(
			args[ currArg ] instanceof ourglobe.FuncVer === true
		)
		{
			funcVer = args[ currArg ];
			currArg++;
		}
		else
		{
			verArgs = [];
			
			var FuncParamVer = ourglobe.core.FuncParamVer;
			
			for(
				;
				currArg < args.length &&
				args[ currArg ] instanceof FuncParamVer === true
				;
				currArg++
			)
			{
				verArgs.push( args[ currArg ] );
			}
		}
		
		if(
			currArg === args.length-1 &&
			sys.hasType( args[ currArg ], "func" ) === true
		)
		{
			argsAreValid = true;
		}
		
		if( argsAreValid === false )
		{
			throw new ourGlobe.core.FuncCreationRuntimeError(
				"All args provided for function creation are not "+
				"valid. The args must be as in the following order:\n"+
				"(1) One of the following options:\n"+
				"  + A FuncVer\n"+
				"  + Any number of FuncParamVers (constr by getA(), "+
				"getE() or getR())"+
				"  + A func that returns a FuncVer or FuncParamVers\n"+
				"(2) The function body itself as a func",
				{ providedArgs: args },
				"InvalidArgsForFuncCreation"
			);
		}
		
		newFunc =
		function()
		{
			if( ourglobe.conf.doVer() === false )
			{
				return func.apply( this, arguments );
			}
			else
			{
				var funcVer = newFunc.ourGlobe.func.funcVer;
				var bodyFunc = newFunc.ourGlobe.func.bodyFunc;
				
				funcVer.verArgs( arguments );
				
				var returnVar = bodyFunc.apply( this, arguments );
				
				funcVer.verReturn( returnVar );
				
				return returnVar;
			}
		};
		
		newFunc.ourGlobe = {};
		newFunc.ourGlobe.func = {};
		newFunc.ourGlobe.func.bodyFunc = func;
		
		if( funcVer !== undefined )
		{
			newFunc.ourGlobe.func.funcVer = funcVer;
		}
		else if( verArgs !== undefined )
		{
			try
			{
				newFunc.ourGlobe.func.funcVer =
					ourGlobe.FuncVer.getFuncVer( verArgs )
				;
			}
			catch( e )
			{
				if(
					e instanceof ourglobe.core.FuncVerError === true &&
					e.ourGlobeCode === "InvalidArgsForFuncVerCreation"
				)
				{
					throw new ourGlobe.core.FuncCreationRuntimeError(
						"The FuncParamVers (constructed by getA(), getE() "+
						"and getR()) must be given in the following "+
						"order:\n"+
						"(1) Any number of ArgsVers (constr by getA())\n"+
						"(2) No more than one ExtraArgsVer (constr by "+
						"getE())\n"+
						"(3) No more than one ReturnVarVer (constr by "+
						"getR())\n",
						{ providedFuncParamVers: verArgs },
						"InvalidArgsForFuncCreation"
					);
				}
				else
				{
					throw e;
				}
			}
		}
		else
		{
			newFunc.ourGlobe.func.funcVerFunc = funcVerFunc;
			
			ourglobe.core.ModuleUtils.delayFvConstr(
			function()
			{
				var funcVer = newFunc.ourGlobe.func.funcVerFunc();
				newFunc.ourGlobe.func.funcVerFunc = undefined;
				
				if( funcVer instanceof ourGlobe.FuncVer === true )
				{
					newFunc.ourGlobe.func.funcVer = funcVer;
				}
				else if( sys.hasType( funcVer, "arr" ) === true )
				{
					try
					{
						newFunc.ourGlobe.func.funcVer =
							ourGlobe.FuncVer.getFuncVer( funcVer )
						;
					}
					catch( e )
					{
						if(
							e instanceof ourGlobe.core.FuncVerError === true &&
							e.ourGlobeCode === "InvalidArgsForFuncVerCreation"
						)
						{
							throw new ourGlobe.core.FuncCreationRuntimeError(
								"The FuncParamVers (constructed by getA(), "+
								"getE() and getR()) must be given in the "+
								"following order:\n"+
								"(1) Any number of ArgsVers (constr by "+
								"getA())\n"+
								"(2) No more than one ExtraArgsVer (constr by "+
								"getE())\n"+
								"(3) No more than one ReturnVarVer (constr by "+
								"getR())\n",
								{ providedFuncParamVers: verArgs },
								"InvalidArgsForFuncCreation"
							);
						}
						else
						{
							throw e;
						}
					}
				}
				else
				{
					throw new ourglobe.FuncCreationRuntimeError(
						"The cb given to return the FuncVer or an arr of "+
						"FuncParamVers didnt yield the expected result",
						{ returnedVar: funcVer },
						"InvalidArgsForFuncCreation"
					);
				}
			});
		}
		
		return newFunc;
	}
	else
	{
		func.ourGlobe = {};
		func.ourGlobe.func = {};
		
		return func;
	}
};

return sys;

});
