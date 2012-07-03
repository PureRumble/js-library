og.define(
[ "exports" ],
function( exports )
{

function OurGlobeError( msg, errorVar, errorCode, errorPlace )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 1 || arguments.length <= 4 ) )
		{
			throw new RuntimeError(
				"Between one and four args must be provided",
				{ providedArgs: arguments }
			);
		}
		
		OurGlobeError.verArgs(
			msg, errorVar, errorCode, errorPlace
		);
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = OurGlobeError;
	}
	
	OurGlobeError.ourGlobeSuper.call( this, msg );
	
	this.message = msg;
	this.name = "OurGlobeError";
	this.ourGlobeVar = errorVar;
	this.ourGlobeCode = errorCode;
	this.ourGlobePlace = errorPlace;
	
	Error.captureStackTrace( this, errorPlace );
}

OurGlobeError.verArgs =
function verArgs( msg, errorVar, errorCode, errorPlace )
{
	if( typeof( msg ) !== "string" )
	{
		throw new RuntimeError(
			"Arg msg must be a string",
			{ providedArg: msg },
			undefined,
			verArgs
		);
	}
	
	if(
		errorVar !== undefined &&
		(
			typeof( errorVar ) !== "object" ||
			Object.keys.length( errorVar ) === 0
		)
	)
	{
		throw new RuntimeError(
			"Arg errorVar must be undef or a non-empty obj",
			{ providedArg: errorVar },
			undefined,
			verArgs
		);
	}
	
	if(
		errorCode !== undefined &&
		(
			typeof( errorCode ) !== "string" ||
			errorCode.length === 0
		)
	)
	{
		throw new RuntimeError(
			"Arg errorCode must be undef or a non-empty str",
			{ providedArg: errorCode },
			undefined,
			verArgs
		);
	}
	
	if(
		errorPlace !== undefined &&
		typeof( errorPlace ) !== "function"
	)
	{
		throw new RuntimeError(
			"Arg errorPlace must be undef or a func",
			{ providedArg: errorPlace },
			undefined,
			verArgs
		);
	}
}

exports.OurGlobeError = OurGlobeError;

var mods = og.loadMods();

var RuntimeError = mods.RuntimeError;

var conf = mods.conf;
var sys = mods.sys;
var FuncVer = mods.FuncVer;

sys.extend( OurGlobeError, Error );

// Do not use these vars in core modules, instead use
// OurGlobeError.verArgs() where applicable
OurGlobeError.MSG_S = { minStrLen: 1 };
OurGlobeError.VAR_S = { types:"obj/undef", minKeys: 1 };
OurGlobeError.CODE_S =
{
	types:"str/undef",
	minStrLen: 1,
	chars:"letters/digits/underscore"
};
OurGlobeError.PLACE_S = "func/undef";
OurGlobeError.ARGS_FV =
new FuncVer(
	[
		OurGlobeError.MSG_S,
		OurGlobeError.VAR_S,
		OurGlobeError.CODE_S,
		OurGlobeError.PLACE_S
	]
);

});
