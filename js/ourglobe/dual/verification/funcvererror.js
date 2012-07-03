og.define(
[ "exports" ],
function( exports )
{

function FuncVerError( msg, errorVar, errorCode, errorPlace )
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
		errorPlace = FuncVerError;
	}
	
	FuncVerError.ourglobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
}

exports.FuncVerError = FuncVerError;

var mods = og.loadMods();

var conf = mods.conf;
var RuntimeError = mods.RuntimeError;
var OurGlobeError = mods.OurGlobeError;
var sys = mods.sys;

sys.extend( FuncVerError, RuntimeError );

});
