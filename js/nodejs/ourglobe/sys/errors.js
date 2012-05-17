/*
OurGlobeError may only depend on the following funcs in
ourglobe:
 /conf/conf
*/
function OurGlobeError( msg, opts )
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
		
		if(
			opts !== undefined &&
			typeof( opts ) !== "function" &&
			typeof( opts ) !== "object"
		)
		{
			throw new Error(
				"Arg opts must be an obj, func or undef but is:\n"+
				caller
			);
		}
		
		if(
			typeof( opts ) === "object" &&
			opts.code !== undefined &&
			(
				typeof( opts.code ) !== "string" ||
				opts.code.length === 0
			)
		)
		{
			throw new Error(
				"Arg opts.code must be undefined or a non-empty str "+
				"but is:\n"+opts.code
			);
		}
	}
	
	if( opts === undefined )
	{
		opts = { caller:OurGlobeError };
	}
	else if( typeof( opts ) === "function" )
	{
		opts = { caller:opts }
	}
	
	var caller =
		opts.caller !== undefined ?
		opts.caller :
		OurGlobeError
	;
	
	OurGlobeError.super_.call( this, msg );
	
	this.message = msg;
	this.name = "OurGlobeError";
	this.ourGlobeCode = opts.code;
	this.ourGlobeVar = opts.var;
	
	Error.captureStackTrace( this, caller );
}

/*
RuntimeError may only depend on the following funcs in
ourglobe:
 /conf/conf
*/
function RuntimeError( msg, opts )
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
		
		if(
			opts !== undefined &&
			typeof( opts ) !== "function" &&
			typeof( opts ) !== "object"
		)
		{
			throw new Error(
				"Arg opts must be an obj, func or undef but is:\n"+
				caller
			);
		}
	}
	
	if( opts === undefined )
	{
		opts = { caller: RuntimeError };
	}
	else if( typeof( opts ) === "function" )
	{
		opts = { caller: opts };
	}
	else if( opts.caller === undefined )
	{
		opts.caller = RuntimeError;
	}
	
	RuntimeError.super_.call( this, msg, opts );
}

OurGlobeError.ERROR_MSG_S = { minStrLen: 1 };
OurGlobeError.OPTS_S =
{
	types: "obj/func/undef",
	extraProps: false,
	props:
	{
		caller: "func/undef",
		code: { types:"str/undef", minStrLen: 1 },
		var: "any"
	}
}

RuntimeError.ERROR_MSG_S = OurGlobeError.ERROR_MSG_S;
RuntimeError.OPTS_S = OurGlobeError.OPTS_S;

exports.OurGlobeError = OurGlobeError;
exports.RuntimeError = RuntimeError;

var conf = require("ourglobe/conf/conf").conf;
