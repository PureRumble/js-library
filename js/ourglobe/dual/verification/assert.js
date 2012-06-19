/*
This func may only depend on the following funcs in
ourglobe:
 /ourglobe/conf/conf
 /ourglobe/sys/RuntimeError
*/
function assert( boolVal, msg, caller )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 2 && arguments.length <= 3 ) )
		{
			throw new RuntimeError(
				"Between two and three args must be provided "+
				"but the following args were provided: "+
				MoreObject.getPrettyStr( arguments )
			);
		}
		
		if( typeof( boolVal ) !== "boolean" )
		{
			throw new RuntimeError(
				"Arg boolVal must be a bool but is: "+
				MoreObject.getPrettyStr( boolVal )
			);
		}
		
		if( caller !== undefined && typeof( caller ) !== "function" )
		{
			throw new RuntimeError(
				"Arg caller must be undef or a func but is: "+
				MoreObject.getPrettyStr( caller )
			);
		}
		
		if(
			boolVal === false &&
			typeof( msg ) !== "string" &&
			msg instanceof Error !== true
		)
		{
			throw new RuntimeError(
				"The assertion failed and in such case arg msg "+
				"must be a string or error but is: "+
				MoreObject.getPrettyStr( msg )
			);
		}
	}
	
	if( caller === undefined ) { caller = assert; }
	
	if( boolVal === false )
	{
		var err = undefined;
		
		if( msg instanceof Error === true )
		{
			err = msg;
		}
		else
		{
			err = new RuntimeError( msg, caller );
		}
		
		throw err;
	}
}

assert.argType = function( argName, arg )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 3, undefined );
	}
	
	var hasTypeArgs =
		Array.prototype.slice.call( arguments, 1 )
	;
	var types = hasTypeArgs.slice( 1 );
	
	var caller = assert.argType;
	
	if( sys.hasType.apply( sys.hasType, hasTypeArgs ) === false )
	{
		throw new RuntimeError(
			"Arg "+argName+" must be one of the following "+
			"types: " + MoreObject.getPrettyStr( types )+
			"\nBut the arg is: " + MoreObject.getPrettyStr( arg ),
			caller
		);
	}
}

assert.nrArgs = function( args, minNrArgs, maxNrArgs )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 1 && arguments.length <= 3 ) )
		{
			throw new RuntimeError(
				"assert.nrArgs() expects between one and three args "+
				"but instead the following args were provided: "+
				MoreObject.getPrettyStr( arguments )
			);
		}
		
		if( typeof( minNrArgs ) !== "number" )
		{
			throw new RuntimeError(
				"assert.nrArgs() expects arg minNrArgs to be an "+
				"integer but is: "+
				MoreObject.getPrettyStr( minNrArgs )
			);
		}
		
		if(
			!(
				typeof( maxNrArgs ) === "undefined" ||
				(
					typeof( minNrArgs ) === "number" &&
					typeof( maxNrArgs ) === "number"
				)
			)
		)
		{
			throw new RuntimeError(
				"assert.nrArgs() expects arg maxNrArgs to be "+
				"undefined or it and minNrArgs must be integers but "+
				"they are: "+
				MoreObject.getPrettyStr(
					{ minNrArgs: minNrArgs, maxNrArgs: maxNrArgs }
				)
			);
		}
	}
	
	var caller = assert.nrArgs;
	
	if( arguments.length === 2 )
	{
		if( args.length !== minNrArgs )
		{
			throw new RuntimeError(
				"Exactly "+minNrArgs+" arg(s) must be provided but "+
				"the following args were provided: "+
				MoreObject.getPrettyStr( args ),
				caller
			);
		}
	}
	else if( maxNrArgs !== undefined )
	{
		if( args.length < minNrArgs || args.length > maxNrArgs )
		{
			throw new RuntimeError(
				"Between "+minNrArgs+" and "+maxNrArgs+" args must "+
				"be provided but the following args were provided: "+
				MoreObject.getPrettyStr( args ),
				caller
			);
		}
	}
	else
	{
		if( args.length < minNrArgs )
		{
			throw new RuntimeError(
				"Atleast "+minNrArgs+" arg(s) must be provided but "+
				"the following args were provided: "+
				MoreObject.getPrettyStr( args ),
				caller
			);
		}
	}
}

assert.arg = function( argName, arg, schema )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 3 );
		
		assert.argType( "argName", argName, "str" );
		
		assert.argType( "schema", schema, "obj", "arr", "str" );
		
		if( Schema.isSchema( schema ) === false )
		{
			throw new RuntimeError(
				"Arg schema must be a valid schema but is: "+
				MoreObject.getPrettyStr( schema )
			);
		}
	}
	
	caller = assert.arg;
	
	if( Schema.test( schema, arg ) === false )
	{
		throw new RuntimeError(
			"Arg "+argName+" isnt valid. The arg and the schema used "+
			"to validate it are: "+
			MoreObject.getPrettyStr( { arg: arg, schema: schema } ),
			caller
		);
	}
}

exports.assert = assert;

var RuntimeError = require("ourglobe/sys/errors").RuntimeError;

var conf = require("ourglobe/conf/conf").conf;
var sys = require("ourglobe/sys/sys").sys;
var MoreObject = require("ourglobe/utils/moreobject").MoreObject;
var Schema = require("ourglobe/verification/schema").Schema;
