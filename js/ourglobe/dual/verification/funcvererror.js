og.define(
[ "exports" ],
function( exports )
{

function FuncVerError( msg, errorVar, errorCode, caller )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 4 );
	}
	
	if( caller === undefined )
	{
		caller = FuncVerError;
	}
	
	FuncVerError.ourglobeSuper.call(
		this, msg, errorVar, errorCode, caller
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
