og.define(
[ "exports" ],
function( exports )
{

function RuntimeError( msg, opts )
{
	if( conf.doVer() === true )
	{
		if( !( arguments.length >= 1 || arguments.length <= 2 ) )
		{
			throw new Error(
				"Between one and two args must be provided but "+
				"the following args were provided:\n" + arguments
			);
		}
		
		if( typeof( msg ) !== "string" )
		{
			throw new Error(
				"Arg msg must be a string but is:\n" + msg
			);
		}
		
		if( opts !== undefined && typeof( opts ) !== "object" )
		{
			throw new Error(
				"Arg opts must be an obj or undef but is:\n"+
				opts
			);
		}
	}
	
	if( opts === undefined )
	{
		opts = {};
	}
	
	if( opts.caller === undefined )
	{
		opts.caller = RuntimeError;
	}
	
	RuntimeError.ourGlobeSuper.call( this, msg, opts );
}

exports.RuntimeError = RuntimeError;

var mods = og.loadMods();

var conf = mods.conf;
var OurGlobeError = mods.OurGlobeError;
var sys = mods.sys;

sys.extend( RuntimeError, OurGlobeError );

});
