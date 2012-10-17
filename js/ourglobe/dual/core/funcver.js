ourglobe.core.define(
[],
function()
{

function FuncVer( argSchemas, returnSchema, extraArgsSchema )
{
	if( ourglobe.conf.doVer() === true )
	{
		FuncVer.verConstrArgs( arguments );
	}
	
	this.argsSchemas =
		argSchemas !== undefined ? [ argSchemas ] : []
	;
	this.extraArgsSchema = extraArgsSchema;
	this.returnSchema = returnSchema;
};

FuncVer.verConstrArgs =
function( args )
{
	ourglobe.assert.nrArgs( args, 0, 3 );
	
	ourglobe.assert.argType(
		"argSchemas", args[ 0 ], "arr", "undef"
	);
	
	ourglobe.assert.argType(
		"returnSchema",
		args[ 1 ],
		"obj",
		"arr",
		"str",
		"func",
		"undef"
	);
	
	ourglobe.assert.argType(
		"extraArgsSchema",
		args[ 2 ],
		"obj",
		"arr",
		"str",
		"func",
		"undef"
	);
};

FuncVer.constrFuncVer =
function( argSchemas, returnSchema, extraArgsSchema )
{
	if( ourglobe.conf.doVer() === true )
	{
		FuncVer.verConstrArgs( arguments );
	}
	
	return(
		new FuncVer( argSchemas, returnSchema, extraArgsSchema )
	);
};

FuncVer.getFuncVer =
function( fvParamVers )
{
	if( ourglobe.conf.doVer() === true )
	{
		if( arguments.length !== 1 )
		{
			throw new ourglobe.RuntimeError(
				"Exactly one arg must be provided",
				{ providedArgs: arguments }
			);
		}
		
		if( ourglobe.sys.hasType( fvParamVers, "arr" ) === false )
		{
			throw new ourglobe.RuntimeError(
				"Arg fvParamVers must be an arr",
				{ fvParamVers: fvParamVers }
			);
		}
	}
	
	var ArgsVer = ourglobe.core.ArgsVer;
	var ExtraArgsVer = ourglobe.core.ExtraArgsVer;
	var ReturnVarVer = ourglobe.core.ReturnVarVer;
	
	var fV = new FuncVer();
	
	var eSet = false;
	var rSet = false;
	var currVer = 0;
	
	for(
		currVer = 0;
		currVer < fvParamVers.length &&
		fvParamVers[ currVer ] instanceof ArgsVer === true;
		currVer++
	)
	{
		fV.addArgs( fvParamVers[ currVer ].schema );
	}
	
	if(
		currVer < fvParamVers.length &&
		fvParamVers[ currVer ] instanceof ExtraArgsVer === true
	)
	{
		fV.setExtraArgs( fvParamVers[ currVer ].schema );
		currVer++;
	}
	
	if(
		currVer < fvParamVers.length &&
		fvParamVers[ currVer ] instanceof ReturnVarVer === true
	)
	{
		fV.setReturn( fvParamVers[ currVer ].schema );
		currVer++;
	}
	
	if( currVer !== fvParamVers.length )
	{
		throw new ourGlobe.core.FuncVerError(
			"The args given to construct a FuncVer arent valid. "+
			"Every arg must be a FuncParamVer (constructed by "+
			"getA(), getE() and getR()) and they must be given in the "+
			"following order:\n"+
			"* Any number of ArgsVers (constr by getA())\n"+
			"* No more than one ExtraArgsVer (constr by getE())\n"+
			"* No more than one ReturnVarVer (constr by getR())\n",
			{
				nrProvidedArgs: fvParamVers.length,
				faultyArgItem: currVer,
				faultyArg: fvParamVers[ currVer ]
			},
			"InvalidArgsForFuncVerCreation"
		);
	}
	
	return fV;
};

FuncVer.prototype.addArgs =
function( argSchemas )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType( "argSchemas", argSchemas, "arr" );
	}
	
	this.argsSchemas.push( argSchemas );
	
	return this;
};

FuncVer.prototype.addA =
function()
{
	var args = Array.prototype.slice.call( arguments );
	
	return FuncVer.prototype.addArgs.call( this, args );
};

FuncVer.prototype.setExtraArgs =
function( extraArgsSchema )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType(
			"extraArgsSchema",
			extraArgsSchema,
			"obj",
			"arr",
			"func",
			"str"
		);
	}
	
	this.extraArgsSchema = extraArgsSchema;
	
	return this;
};

FuncVer.prototype.setE = FuncVer.prototype.setExtraArgs;

FuncVer.prototype.setReturn =
function( returnSchema )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType(
			"returnSchema",
			returnSchema,
			"obj",
			"arr",
			"func",
			"str"
		);
	}
	
	this.returnSchema = returnSchema;
	
	return this;
};

FuncVer.prototype.setR = FuncVer.prototype.setReturn;

FuncVer.prototype.verArgs =
function( args )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType( "args", args, "obj", "arr" );
	}
	
	if( this.argsAreValid( args ) === false )
	{
		throw new ourGlobe.core.FuncVerError(
			"The provided args are invalid",
			{ argSchemas: this.argsSchemas, providedArgs: args },
			"InvalidArgsAtFuncCall",
			FuncVer.prototype.verArgs
		);
	}
};

FuncVer.prototype.argsAreValid =
function( args )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
		
		ourglobe.assert.argType( "args", args, "obj", "arr" );
	}
	
	try
	{
		args = Array.prototype.slice.call( args );
	}
	catch( err )
	{
		throw new ourglobe.RuntimeError(
			"Arg args must be an arr or an arguments object",
			{ providedArg: args }
		);
	}
	
	if( this.argsSchemas.length === 0 )
	{
		this.argsSchemas.push( [] );
	}
	
	for( var pos in this.argsSchemas )
	{
		var argSchemas = this.argsSchemas[ pos ];
		
		var finalArgs = args;
		
		if( finalArgs.length < argSchemas.length )
		{
			finalArgs = finalArgs.slice();
			
			while( finalArgs.length < argSchemas.length )
			{
				finalArgs.push( undefined );
			}
		}
		
		var schema =
		{
			types: "arr",
			items: argSchemas,
			extraItems:
				this.extraArgsSchema === undefined ?
				false :
				this.extraArgsSchema
			,
			denseItems: true
		};
		
		if( ourglobe.Schema.test( schema, finalArgs ) === true )
		{
			return true;
		}
	}
	
	return false;
};

FuncVer.prototype.verReturn =
function( returnVar )
{
	if( ourglobe.conf.doVer() === true )
	{
		ourglobe.assert.nrArgs( arguments, 1 );
	}
	
	this.returnSchema =
		this.returnSchema !== undefined ?
		this.returnSchema :
		"undef"
	;
	
	if(
		ourglobe.Schema.test(
			this.returnSchema, returnVar
		) === true
	)
	{
		return;
	}
	
	throw new ourGlobe.core.FuncVerError(
		"The returned var from the function call is invalid",
		{
			returnSchema: this.returnSchema,
			providedReturnVar: returnVar
		},
		"InvalidReturnedVarFromFuncCall",
		FuncVer.prototype.verReturn
	);
};

return FuncVer;

});
