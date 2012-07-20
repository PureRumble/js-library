ourglobe.define(
[
	"crypto"
],
function( mods )
{

var crypto = mods.get( "crypto" );

var RuntimeError = ourglobe.RuntimeError;

var conf = ourglobe.conf;
var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var Id =
getF(
new FuncVer( [ [ "str", Buffer, "undef" ] ] ),
function( src )
{
	var buf = src;
	
	if(	sys.hasType( src, "str" ) === true )
	{
		if( src.length === 0 )
		{
			throw new RuntimeError(
				"An Id str can not be empty",
				undefined,
				Id.INVALID_ARGS_FOR_ID_CREATION
			);
		}
		
		try
		{
			buf = new Buffer( src, "base64" );
		}
		catch( e )
		{
			throw new RuntimeError(
				"An Id str must be a valid base-64 str",
				{ providedIdStr: src },
				Id.INVALID_ARGS_FOR_ID_CREATION
			);
		}
	}
	
	if(
		buf !== undefined &&
		(
			buf.length !== Id.ID_SIZE ||
			( buf[ 6 ] & 0xf0 ) !== 0x40 ||
			( buf[ 8 ] & 0xc0 ) !== 0x80
		)
	)
	{
		throw new RuntimeError(
			"Provided Buffer/str must represent a valid Id",
			{ providedBuffer: buf },
			Id.INVALID_ARGS_FOR_ID_CREATION
		);
	}
	
	if( buf === undefined )
	{
		var rb = crypto.randomBytes( Id.ID_SIZE );
		
		rb[ 6 ] = ( rb[ 6 ] & 0x0f ) | 0x40;
		rb[ 8 ] = ( rb[ 8 ] & 0x3f ) | 0x80;
		
		buf = new Buffer( rb );
	}
	
	this.buf = buf;
});

Id.INVALID_ARGS_FOR_ID_CREATION = "InvalidArgsForIdCreation";
Id.ID_SIZE = 16;
Id.ID_STR_S = FuncVer.PROPER_STR;
Id.R_ID_STR_S = FuncVer.R_PROPER_STR;

return Id;

},
function( mods, Id )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

Id.prototype.getBuffer =
getF(
new FuncVer( undefined, Buffer ),
function()
{
	return this.buf;
});

Id.prototype.toString =
getF(
new FuncVer( undefined, Id.ID_STR_S ),
function()
{
	return this.buf.toString( "base64" );
});

});
