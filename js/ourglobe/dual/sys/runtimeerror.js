og.define(
[ "exports" ],
function( exports )
{

function RuntimeError( msg, errorVar, errorCode, errorPlace )
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
		
// Args dont need to be further verified as this is already done
// by OurGlobeError
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = RuntimeError;
	}
	
	RuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
}

exports.RuntimeError = RuntimeError;

var mods = og.loadMods();

var OurGlobeError = mods.OurGlobeError;

var conf = mods.conf;
var sys = mods.sys;

sys.extend( RuntimeError, OurGlobeError );

// Do not use these vars in core modules, instead use
// OurGlobeError.verArgs() where applicable
RuntimeError.MSG_S = OurGlobeError.MSG_S;
RuntimeError.VAR_S = OurGlobeError.VAR_S;
RuntimeError.CODE_S = OurGlobeError.CODE_S;
RuntimeError.PLACE_S = OurGlobeError.PLACE_S;
RuntimeError.ARGS_FV = OurGlobeError.ARGS_FV;

});
