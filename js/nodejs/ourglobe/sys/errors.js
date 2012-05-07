/*
OurGlobeError may only depend on the following funcs in
ourglobe:
 /conf/conf
*/
function OurGlobeError( msg, caller )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 1 || arguments.length <= 2 ) )
		{
			throw new Error(
				"Between one and two args must be provided but "+
				"the following args were provided:\n" + arguments
			);
		}
		
		if( typeof( msg ) !== "string" )
		{
			throw new Error(
				"Arg msg must be a string but is:\n" + msg
			);
		}
		
		if( caller !== undefined && typeof( caller ) !== "function" )
		{
			throw new Error(
				"Arg caller must be undef or a func but is:\n" + caller
			);
		}
	}
	
	if( caller === undefined )
	{
		caller = OurGlobeError;
	}
	
	OurGlobeError.super_.call( this, msg );
	
	this.message = msg;
	this.name = this.constructor.name;
	
	Error.captureStackTrace( this, caller );
}

/*
RuntimeError may only depend on the following funcs in
ourglobe:
 /conf/conf
*/
function RuntimeError( msg, caller )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 1 || arguments.length <= 2 ) )
		{
			throw new Error(
				"Between one and two args must be provided but "+
				"the following args were provided:\n" + arguments
			);
		}
		
		if( typeof( msg ) !== "string" )
		{
			throw new Error(
				"Arg msg must be a string but is:\n" + msg
			);
		}
		
		if( caller !== undefined && typeof( caller ) !== "function" )
		{
			throw new Error(
				"Arg caller must be undef or a func but is:\n" + caller
			);
		}
	}
	
	if( caller === undefined )
	{
		caller = RuntimeError;
	}
	
	RuntimeError.super_.call( this, msg, caller );
}

exports.OurGlobeError = OurGlobeError;
exports.RuntimeError = RuntimeError;

var conf = require("ourglobe/conf/conf").conf;
