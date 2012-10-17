ourglobe.core.define(
[
	"util"
],
function( util )
{

function OurGlobeError( msg, errorVar, errorCode, errorPlace )
{
	if( ourglobe.conf.doVer() === true )
	{
		if( !( arguments.length >= 1 && arguments.length <= 4 ) )
		{
			throw new ourglobe.RuntimeError(
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
		errorPlace = this.constructor;
	}
	
	OurGlobeError.ourGlobeSuper.call( this, msg );
	
	this.className = this.className;
	this.message = msg;
	this.ourGlobeVar = errorVar;
	this.ourGlobeCode = errorCode;
	
	Error.captureStackTrace( this, errorPlace );
};

OurGlobeError.verArgs =
function( msg, errorVar, errorCode, errorPlace )
{
	if( arguments.length < 1 || arguments.length > 4 )
	{
		throw new ourglobe.RuntimeError(
			"Between one and four args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	var res =
		OurGlobeError.verArgsWithoutErr(
			msg, errorVar, errorCode, errorPlace
		)
	;
	
	if( res !== undefined )
	{
		throw new ourglobe.RuntimeError(
			res.message,
			res.ourGlobeVar,
			res.ourGlobeCode,
			res.ourGlobePlace
		);
	}
};

OurGlobeError.verArgsWithoutErr =
function( msg, errorVar, errorCode, errorPlace )
{
	if( arguments.length < 1 || arguments.length > 4 )
	{
		var err =
			new Error( "Between one and four args must be provided" )
		;
		
		err.ourGlobeVar = { providedArgs: arguments };
		
		throw err;
	}
	
	if( typeof( msg ) !== "string" )
	{
		return(
			{
				message: "Arg msg must be a string",
				ourGlobeVar:{ providedArg: msg },
				ourGlobeCode: undefined,
				ourGlobePlace: OurGlobeError.verArgsWithoutErr
			}
		);
	}
	
	if(
		errorVar !== undefined &&
		(
			typeof( errorVar ) !== "object" ||
			Object.keys( errorVar ).length === 0
		)
	)
	{
		return(
			{
				message: "Arg errorVar must be undef or a non-empty obj",
				ourGlobeVar:{ providedArg: errorVar },
				ourGlobeCode: undefined,
				ourGlobePlace: OurGlobeError.verArgsWithoutErr
			}
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
		return(
			{
				message:
					"Arg errorCode must be undef or a non-empty str",
				ourGlobeVar:{ providedArg: errorCode },
				ourGlobeCode: undefined,
				ourGlobePlace: OurGlobeError.verArgsWithoutErr
			}
		);
	}
	
	if(
		errorPlace !== undefined &&
		typeof( errorPlace ) !== "function"
	)
	{
		return(
			{
				message: "Arg errorPlace must be undef or a func",
				ourGlobeVar:{ providedArg: errorPlace },
				ourGlobeCode: undefined,
				ourGlobePlace: OurGlobeError.verArgsWithoutErr
			}
		);
	}
};

OurGlobeError.toString =
function( err )
{
	if( ourglobe.conf.doVer() === true )
	{
		if( arguments.length !== 1 )
		{
			throw new ourglobe.RuntimeError(
				"Exactly one arg must be provided",
				{ providedArgs: arguments }
			);
		}
		
		if( err instanceof Error === false )
		{
			throw new ourglobe.RuntimeError(
				"Arg err must be an err", { err: err }
			);
		}
	}
	
	return util.inspect(
		{
			className: err.className,
			message: err.message,
			ourGlobeVar: err.ourGlobeVar,
			ourGlobeCode: err.ourGlobeCode
		},
		false,
		null
	);
};

OurGlobeError.prototype.toString =
function()
{
	return OurGlobeError.toString( this );
};

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

return OurGlobeError;

});
