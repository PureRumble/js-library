og.define(
[
	"exports"
],
function(
	exports
)
{

function OurGlobeError( msg, opts )
{
	if( og.conf.doVer() === true )
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
				"Arg opts must be an obj or undef but is:\n" + opts
			);
		}
		
		if(
			opts !== undefined && opts.code !== undefined &&
			(
				typeof( opts.code ) !== "string" ||
				opts.code.length === 0
			)
		)
		{
			throw new Error(
				"Arg opts.code must be undef or a non-empty str "+
				"but is:\n"+opts.code
			);
		}
		
		if(
			opts !== undefined &&
			opts.caller !== undefined &&
			typeof( opts.caller ) !== "function"
		)
		{
			throw new Error(
				"Arg opts.caller must be under or a func but is:\n"+
				opts.caller
			);
		}
	}
	
	if( opts === undefined )
	{
		opts = {};
	}
	
	if( opts.caller === undefined )
	{
		opts.caller = OurGlobeError;
	}
	
	var caller = opts.caller;
	
	OurGlobeError.ourGlobeSuper.call( this, msg );
	
	this.message = msg;
	this.name = "OurGlobeError";
	this.ourGlobeCode = opts.code;
	this.ourGlobeVar = opts.var;
	
	Error.captureStackTrace( this, caller );
}

exports.OurGlobeError = OurGlobeError;

var sys = og.require( "og/d/sys" ).sys;

sys.extend( OurGlobeError, Error );

});
