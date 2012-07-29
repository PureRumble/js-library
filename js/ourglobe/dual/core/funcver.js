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

FuncVer.getFuncVer =
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
		
		ourglobe.assert.argType( "args", args, "obj" );
	}
	
	try
	{
		args = Array.prototype.slice.call( args );
	}
	catch( err )
	{
		throw new ourglobe.RuntimeError(
			"Arg args must be an arguments object",
			{ providedArg: args }
		);
	}
	
	if( this.argsSchemas.length === 0 )
	{
		this.argsSchemas.push( [] );
	}
	
	for( var pos in this.argsSchemas )
	{
		var argSchemas = this.argsSchemas[pos];
		
		var finalArgs = args;
		
		if( finalArgs.length < argSchemas.length )
		{
			finalArgs = finalArgs.slice();
			
			while( finalArgs.length < argSchemas.length )
			{
				finalArgs.push( undefined );
			}
		}
		
		var schema = {
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
			return;
		}
	}
	
	throw new ourglobe.FuncVerError(
		"This FuncVer doesnt approve the provided args",
		{ argSchemas: this.argsSchemas, providedArgs: args },
		undefined,
		FuncVer.prototype.verArgs
	);
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
	
	throw new ourglobe.FuncVerError(
		"This FuncVer doesnt approve the provided return variable",
		{
			returnSchema: this.returnSchema,
			providedReturnVar: returnVar
		},
		undefined,
		FuncVer.prototype.verReturn
	);
};

return FuncVer;

});
