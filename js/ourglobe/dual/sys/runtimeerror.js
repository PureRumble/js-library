og.define(
[ "exports" ],
function( exports )
{

function RuntimeError( msg, errorVar, errorCode, caller )
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
	}
	
	if( caller === undefined )
	{
		caller = RuntimeError;
	}
	
	RuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, caller
	);
}

exports.RuntimeError = RuntimeError;

var mods = og.loadMods();

var OurGlobeError = mods.OurGlobeError;

var conf = mods.conf;
var sys = mods.sys;

sys.extend( RuntimeError, OurGlobeError );

});
