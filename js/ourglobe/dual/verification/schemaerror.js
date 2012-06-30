og.define(
[ "exports" ],
function( exports )
{

function SchemaError( msg, errorVar, errorCode, caller )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 4 );
	}
	
	if( caller === undefined )
	{
		caller = SchemaError;
	}
	
	SchemaError.ourglobeSuper.call(
		this, msg, errorVar, errorCode, caller
	);
}

exports.SchemaError = SchemaError;

var mods = og.loadMods();

var conf = mods.conf;
var RuntimeError = mods.RuntimeError;
var sys = mods.sys;

sys.extend( SchemaError, RuntimeError );

});
