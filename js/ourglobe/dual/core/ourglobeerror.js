ourglobe.core.define(
[
	"util"
],
function( util )
{

function OurGlobeError( msg, errorVar, errorCode, errorPlace )
{
	if( !( arguments.length >= 1 && arguments.length <= 4 ) )
	{
		throw new ourglobe.RuntimeError(
			"Between one and four args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		typeof( errorCode ) === "function" &&
		errorPlace === undefined
	)
	{
		errorPlace = errorCode;
		errorCode = undefined;
	}
	
	if(
		typeof( errorVar ) === "function" &&
		errorCode === undefined &&
		errorPlace === undefined
	)
	{
		errorPlace = errorVar;
		errorVar = undefined;
	}
	
	if(
		typeof( errorVar ) === "string" && errorCode === undefined
	)
	{
		errorCode = errorVar;
		errorVar = undefined;
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = this.__proto__.constructor;
	}
	
	OurGlobeError.verArgs(
		msg, errorVar, errorCode, errorPlace
	);
	
	OurGlobeError.ourGlobeSuper.call( this, msg );
	
	this.message = msg;
	this.ourGlobeVar = errorVar;
	this.ourGlobeCode = errorCode;
	
	Error.captureStackTrace( this, errorPlace );
};

Object.defineProperty(
OurGlobeError,
"verArgs",
{
value:
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
}
});

Object.defineProperty(
OurGlobeError,
"verArgsWithoutErr",
{
value:
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
	
	if( errorVar !== undefined && typeof( errorVar ) !== "object" )
	{
		return(
			{
				message: "Arg errorVar must be undef or an obj",
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
}
});

Object.defineProperty(
OurGlobeError,
"toString",
{
value:
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
}
});

OurGlobeError.prototype.toString =
function()
{
	return OurGlobeError.toString( this );
};

OurGlobeError.prototype.getErrMsg =
function()
{
	if( arguments.length !== 0 )
	{
		throw new Error( "No args may be provided" );
	}
	
	return this.message;
};

OurGlobeError.prototype.getErrVar =
function()
{
	if( arguments.length !== 0 )
	{
		throw new Error( "No args may be provided" );
	}
	
	return this.ourGlobeVar;
};

OurGlobeError.prototype.hasErrCode =
function( errCode )
{
	if( arguments.length !== 1 )
	{
		throw new Error( "Exactly one arg must be provided" );
	}
	
	if( typeof( errCode ) !== "string" || errCode.length === 0 )
	{
		throw new Error(
			"Arg errCode must be a non-empty str"
		);
	}
	
	return this.ourGlobeCode === errCode;
};

// Do not use these vars in core modules, instead use
// OurGlobeError.verArgs() where applicable
Object.defineProperty(
	OurGlobeError, "MSG_S", { value: { minStrLen: 1 } }
);
Object.defineProperty(
	OurGlobeError,
	"VAR_S",
	{ value: { types:"obj/undef", minKeys: 1 } }
);
Object.defineProperty(
	OurGlobeError,
	"CODE_S",
	{
		value:
		{
			types:"str/undef",
			minStrLen: 1,
			chars:"letters/digits/underscore"
		}
	}
);
Object.defineProperty(
	OurGlobeError, "PLACE_S", { value: "func/undef" }
);

return OurGlobeError;

});
