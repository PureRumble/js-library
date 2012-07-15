og.core.define(
[],
function()
{

function FuncVer( argSchemas, returnSchema, extraArgsSchema )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 0, 3 );
		
		og.assert.argType( "argSchemas", argSchemas, "arr", "undef" );
		
		og.assert.argType(
			"returnSchema",
			returnSchema,
			"obj",
			"arr",
			"str",
			"func",
			"undef"
		);
		
		og.assert.argType(
			"extraArgsSchema",
			extraArgsSchema,
			"obj",
			"arr",
			"str",
			"func",
			"undef"
		);
	}
	
	this.argsSchemas =
		argSchemas !== undefined ? [ argSchemas ] : []
	;
	this.extraArgsSchema = extraArgsSchema;
	this.returnSchema = returnSchema;
}

FuncVer.prototype.addArgs = function( argSchemas )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
		
		og.assert.argType( "argSchemas", argSchemas, "arr" );
	}
	
	this.argsSchemas.push( argSchemas );
	
	return this;
}

FuncVer.prototype.setExtraArgs = function( extraArgsSchema )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
		
		og.assert.argType(
			"extraArgsSchema", extraArgsSchema, "obj", "arr", "str"
		);
	}
	
	this.extraArgsSchema = extraArgsSchema;
	
	return this;
}

FuncVer.prototype.setReturn = function( returnSchema )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
		
		og.assert.argType(
			"returnSchema", returnSchema, "obj", "arr", "str"
		);
	}
	
	this.returnSchema = returnSchema;
	
	return this;
}

FuncVer.prototype.verArgs = function( args )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
		
		og.assert.argType( "args", args, "obj" );
	}
	
	try
	{
		args = Array.prototype.slice.call( args );
	}
	catch( err )
	{
		throw new og.RuntimeError(
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
		
		if( og.Schema.test( schema, finalArgs ) === true )
		{
			return this;
		}
	}
	
	throw new og.FuncVerError(
		"This FuncVer doesnt approve the provided args",
		{ argSchemas: this.argSchemas, providedArgs: args  },
		undefined,
		FuncVer.prototype.verArgs
	);
}

FuncVer.prototype.verReturn = function( returnVar )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
	}
	
	this.returnSchema =
		this.returnSchema !== undefined ?
		this.returnSchema :
		"undef"
	;
	
	if( og.Schema.test( this.returnSchema, returnVar ) === true )
	{
		return this;
	}
	
	throw new og.FuncVerError(
		"This FuncVer doesnt approve the provided return variable",
		{
			returnSchema: this.returnSchema,
			providedReturnVar: returnVar
		},
		undefined,
		FuncVer.prototype.verReturn
	);
}

return FuncVer;

});
