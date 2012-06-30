og.define(
[ "exports" ],
function( exports )
{

function SchemaError( msg, opts )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1, 2 );
		
		assert.argType( "msg", msg, "str" );
		
		assert.argType( "opts", opts, "undef", "obj" );
		
		var optsVar = opts !== undefined ? opts : {};
		
		assert.argType( "opts.code", optsVar.code, "undef", "str" );
		
		assert.argType(
			"opts.caller", optsVar.caller, "undef", "func"
		);
	}
	
	if( opts === undefined )
	{
		opts = {};
	}
	
	if( opts.caller === undefined )
	{
		opts.caller = SchemaError;
	}
	
	SchemaError.ourGlobeSuper.call( this, msg, caller );
}

exports.SchemaError = SchemaError;

var mods = og.loadMods();

var conf = mods.conf;
var RuntimeError = mods.RuntimeError;
var sys = mods.sys;

sys.extend( SchemaError, RuntimeError );

});
