og.define(
[ "exports" ],
function( exports )
{

function SchemaError( msg, errorVar, errorCode, errorPlace )
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
		errorPlace = SchemaError;
	}
	
	SchemaError.ourglobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
}

exports.SchemaError = SchemaError;

var mods = og.loadMods();

var conf = mods.conf;
var RuntimeError = mods.RuntimeError;
var sys = mods.sys;

sys.extend( SchemaError, RuntimeError );

});
