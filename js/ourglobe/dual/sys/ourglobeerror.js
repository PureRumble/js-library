og.define(
[ "exports" ],
function( exports )
{

function OurGlobeError( msg, errorVar, errorCode, caller )
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
		
		if( typeof( msg ) !== "string" )
		{
			throw new RuntimeError(
				"Arg msg must be a string", { providedArg: msg }
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
				{ providedArg: errorVar }
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
				{ providedArg: errorCode }
			);
		}
		
		if(
			caller !== undefined && typeof( caller ) !== "function"
		)
		{
			throw new RuntimeError(
				"Arg caller must be undef or a func",
				{ providedArg: caller }
			);
		}
	}
	
	if( caller === undefined )
	{
		caller = OurGlobeError;
	}
	
	OurGlobeError.ourGlobeSuper.call( this, msg );
	
	this.message = msg;
	this.name = "OurGlobeError";
	this.ourGlobeVar = errorVar;
	this.ourGlobeCode = errorCode;
	this.ourGlobeCaller = caller;
	
	Error.captureStackTrace( this, caller );
}

OurGlobeError.MSG_S = { minStrLen: 1 };
OurGlobeError.CALLER_S = "func/undef";
OurGlobeError.CODE_S = { types:"str/undef", minStrLen: 1 };
OurGlobeError.VAR_S = { types:"obj/undef", minKeys: 1 };

exports.OurGlobeError = OurGlobeError;

var mods = og.loadMods();

var RuntimeError = mods.RuntimeError;

var conf = mods.conf;
var sys = mods.sys;

sys.extend( OurGlobeError, Error );

});
