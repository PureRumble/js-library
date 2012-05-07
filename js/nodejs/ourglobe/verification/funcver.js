function FuncVer( argSchemas, returnSchema, extraArgsSchema )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 0, 3 );
		
		assert.argType( "argSchemas", argSchemas, "arr", "undef" );
		
		assert.argType(
			"returnSchema",
			returnSchema,
			"obj",
			"arr",
			"str",
			"func",
			"undef"
		);
		
		assert.argType(
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
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
		
		assert.argType( "argSchemas", argSchemas, "arr" );
	}
	
	this.argsSchemas.push( argSchemas );
	
	return this;
}

FuncVer.prototype.setExtraArgs = function( extraArgsSchema )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
		
		assert.argType(
			"extraArgsSchema", extraArgsSchema, "obj", "arr", "str"
		);
	}
	
	this.extraArgsSchema = extraArgsSchema;
	
	return this;
}

FuncVer.prototype.setReturn = function( returnSchema )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
		
		assert.argType(
			"returnSchema", returnSchema, "obj", "arr", "str"
		);
	}
	
	this.returnSchema = returnSchema;
	
	return this;
}

FuncVer.prototype.verArgs = function( args )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
		
		assert.argType( "args", args, "obj" );
	}
	
	try
	{
		args = Array.prototype.slice.call( args );
	}
	catch( err )
	{
		throw new RuntimeError(
			"Arg args must be an arguments object but is:\n"+
			MoreObject.getPrettyStr( args )
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
		
		if( Schema.test( schema, finalArgs ) === true )
		{
			return this;
		}
	}
	
	throw new FuncVerError(
		"This FuncVer doesnt approve the provided args. The "+
		"FuncVer and args are:\n"+
		MoreObject.getPrettyStr(
			{ "FuncVer": this, "args":args  }
		),
		FuncVer.prototype.verArgs
	);
}

FuncVer.prototype.verReturn = function( returnVar )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
	}
	
	this.returnSchema =
		this.returnSchema !== undefined ?
		this.returnSchema :
		"undef"
	;
	
	if( Schema.test( this.returnSchema, returnVar ) === true )
	{
		return this;
	}
	
	throw new FuncVerError(
		"This FuncVer doesnt approve the provided return "+
		"variable. The FuncVer and return variable are:"+
		MoreObject.getPrettyStr( {
			"FuncVer":this, "returnVar":returnVar
		} ),
		FuncVer.prototype.verReturn
	);
}

exports.FuncVer = FuncVer;

var RuntimeError = require("ourglobe/sys/errors").RuntimeError;
var FuncVerError = require("./errors").FuncVerError;

var conf = require("ourglobe/conf/conf").conf;
var assert = require("./assert").assert;
var MoreObject = require("ourglobe/utils/moreobject").MoreObject;
var Schema = require("ourglobe/verification/schema").Schema;

FuncVer.PROPER_STR = Schema.PROPER_STR;
FuncVer.R_PROPER_STR = Schema.R_PROPER_STR;
FuncVer.PROPER_STR_L = Schema.PROPER_STR_L;
FuncVer.R_PROPER_STR_L = Schema.R_PROPER_STR_L;

FuncVer.PROPER_OBJ = Schema.PROPER_OBJ;
FuncVer.R_PROPER_OBJ = Schema.R_PROPER_OBJ;

FuncVer.NON_NEG_INT = Schema.NON_NEG_INT;
FuncVer.R_NON_NEG_INT = Schema.R_NON_NEG_INT;
FuncVer.POS_INT = Schema.POS_INT;
FuncVer.R_POS_INT = Schema.R_POS_INT;