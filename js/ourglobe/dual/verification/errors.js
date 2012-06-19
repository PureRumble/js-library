function SchemaError( msg, caller )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 2 );
		
		assert.argType( "msg", msg, "str" );
		
		assert.argType( "caller", caller, "undef", "func" );
	}
	
	if( caller === undefined )
	{
		caller = SchemaError;
	}
	
	SchemaError.super_.call( this, msg, caller );
}

function FuncVerError( msg, caller )
{
if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 2 );
		
		assert.argType( "msg", msg, "str" );
		
		assert.argType( "caller", caller, "undef", "func" );
	}
	
	if( caller === undefined )
	{
		caller = FuncVerError;
	}
	
	FuncVerError.super_.call( this, msg, caller );
}

function VarVerError( msg, varver, variable, caller )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 3, 4 );
		
		assert.argType( "msg", msg, "str" );
		
		if( varver instanceof VarVer === false )
		{
			throw new RuntimeError(
				"Arg varver must be a VarVer but is: "+
				MoreObject.getPrettyStr( varver )
			);
		}
		
		assert.argType( "caller", caller, "undef", "func" );
	}
	
	if( caller === undefined )
	{
		caller = VarVerError;
	}
	
	VarVerError.super_.call( this, msg, caller );
}

exports.SchemaError = SchemaError;
exports.FuncVerError = FuncVerError;
exports.VarVerError = VarVerError;

var RuntimeError = require("ourglobe/sys/errors").RuntimeError;

var conf = require("ourglobe/conf/conf").conf;
var assert = require("ourglobe/verification/assert").assert;
var MoreObject = require("ourglobe/utils/moreobject").MoreObject;
var VarVer = require("./varver").VarVer;
