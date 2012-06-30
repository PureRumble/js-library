og.define(
[ "exports" ],
function( exports )
{

function FuncVerError( msg, opts )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 2 );
		
		assert.arg( "msg", msg, OurGlobeError.MSG_S );
		
		assert.arg( "opts", opts, OurGlobeError.OPTS_S );
	}
	
	if( opts === undefined )
	{
		opts = {};
	}
	
	if( opts.caller === undefined )
	{
		opts.caller = FuncVerError;
	}
	
	FuncVerError.ourglobeSuper.call( this, msg, caller );
}

exports.FuncVerError = FuncVerError;

var mods = og.loadMods();

var conf = mods.conf;
var RuntimeError = mods.RuntimeError;
var OurGlobeError = mods.OurGlobeError;
var sys = mods.sys;

sys.extend( FuncVerError, RuntimeError );

});
