og.define(
[ "exports" ],
function( exports )
{

function assert( boolVal, msg, errorVar, errorCode, errorPlace )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 2 || arguments.length <= 5 ) )
		{
			throw new RuntimeError(
				"Between two and five args must be provided",
				{ providedArgs: arguments }
			);
		}
		
		if( typeof( boolVal ) !== "boolean" )
		{
			throw new RuntimeError(
				"Arg boolVal must be a bool", { providedArg: boolVal }
			);
		}
		
		if(
			typeof( msg ) !== "string" &&
			msg instanceof OurGlobeError === false
		)
		{
			throw new RuntimeError(
				"Arg msg must be a str or an instance of OurGlobeError",
				{ providedArg: msg }
			);
		}
		
		if(
			msg instanceof OurGlobeError === true &&
			(
				errorVar !== undefined ||
				errorCode !== undefined ||
				errorPlace !== undefined
			)
		)
		{
			throw new RuntimeError(
				"If arg msg is an instance of OurGlobeError then the "+
				"args errorVar, errorCode and errorPlace must be "+
				"undefined",
				{
					msg: msg,
					errorVar: errorVar,
					errorCode: errorCode,
					errorPlace: errorPlace
				}
			);
		}
		else if( msg instanceof OurGlobeError === false )
		{
			OurGlobeError.verArgs(
				msg, errorVar, errorCode, errorPlace
			);
		}
	}
	
	if( errorPlace === undefined ) { errorPlace = assert; }
	
	if( boolVal === false )
	{
		var err = undefined;
		
		if( msg instanceof OurGlobeError === true )
		{
			err = msg;
		}
		else
		{
			err =
				new RuntimeError(
					msg,
					errorVar,
					errorCode,
					errorPlace
				)
			;
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
	
	if( sys.hasType.apply( sys.hasType, hasTypeArgs ) === false )
	{
		var types = hasTypeArgs.slice( 1 );
		
		var errorPlace = assert.argType;
		
		throw new RuntimeError(
			"Arg "+argName+" is not of required type",
			{ providedArg: arg, requiredTypes: types },
			undefined,
			errorPlace
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
				"Between one and three args must be provided",
				{ providedArgs: arguments }
			);
		}
		
		if( typeof( minNrArgs ) !== "number" )
		{
			throw new RuntimeError(
				"Arg minNrArgs must be an int",
				{ providedArg: minNrArgs }
			);
		}
		
		if(
			!(
				typeof( maxNrArgs ) === "undefined" ||
				(
					typeof( maxNrArgs ) === "number" &&
					minNrArgs <= maxNrArgs
				)
			)
		)
		{
			throw new RuntimeError(
				"Arg maxNrArgs must be undef or an int no smaller than "+
				"minNrArgs",
				{ minNrArgs: minNrArgs, maxNrArgs: maxNrArgs }
			);
		}
	}
	
	var errorPlace = assert.nrArgs;
	
	if( arguments.length === 2 )
	{
		if( args.length !== minNrArgs )
		{
			throw new RuntimeError(
				"Exactly "+minNrArgs+" arg(s) must be provided",
				{ providedArgs: args },
				undefined,
				errorPlace
			);
		}
	}
	else if( maxNrArgs !== undefined )
	{
		if( args.length < minNrArgs || args.length > maxNrArgs )
		{
			throw new RuntimeError(
				"Between "+minNrArgs+" and "+maxNrArgs+" args must "+
				"be provided",
				{ providedArgs: args },
				undefined,
				errorPlace
			);
		}
	}
// Args minNrArgs and maxNrArgs were provided but maxNrArgs is
// undef (arguments.length == 3). In this case it is required
// that nr args is no smaller than minNrArgs
	else
	{
		if( args.length < minNrArgs )
		{
			throw new RuntimeError(
				"Atleast "+minNrArgs+" arg(s) must be provided",
				{ providedArgs: args },
				undefined,
				errorPlace
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
	}
	
	if( Schema.test( schema, arg ) === false )
	{
		errorPlace = assert.arg;
		
		throw new RuntimeError(
			"Arg "+argName+" doesnt comply to required schema",
			{ providedArg: arg, schema: schema },
			undefined,
			errorPlace
		);
	}
}

exports.assert = assert;

var mods = og.loadMods();

var RuntimeError = mods.RuntimeError;

var conf = mods.conf;
var sys = mods.sys;
var Schema = mods.Schema;

});
