var crypto = require("crypto");

var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

var _ID_SIZE = 16;

function Id( src )
{
	if( conf.doVer() === true )
	{
		new FuncVer()
			.addArgs( [
				[ Id.ID_STR_S, Buffer, "undef" ]
			])
			.verArgs( arguments )
		;
		
		var buf =
			sys.hasType( src, "str" ) === true ?
				new Buffer( src, "base64" ) :
				src
		;
		
		if(
			buf !== undefined &&
			(
				buf.length !== _ID_SIZE ||
				( buf[ 6 ] & 0xf0 ) !== 0x40 ||
				( buf[ 8 ] & 0xc0 ) !== 0x80
			)
		)
		{
			throw new RuntimeError(
				"Provided Buffer must represent a valid Id but this "+
				"Buffer is: "+src
			);
		}
	}
	
	var buf = undefined;
	
	if( sys.hasType( src, "str" ) === true )
	{
		buf = new Buffer( src, "base64" );
	}
	else if( src instanceof Buffer === true )
	{
		buf = src;
	}
	else
	{
		
		var rb = crypto.randomBytes( _ID_SIZE );
		
		rb[ 6 ] = ( rb[ 6 ] & 0x0f ) | 0x40;
		rb[ 8 ] = ( rb[ 8 ] & 0x3f ) | 0x80;
		
		buf = new Buffer( rb );
	}
	
	this.buf = buf;
}

Id.ID_STR_S = FuncVer.PROPER_STR;
Id.R_ID_STR_S = FuncVer.R_PROPER_STR;

Id.prototype.getBuffer = function()
{
	if( conf.doVer() === true )
	{
		new FuncVer( [], Buffer )
			.verArgs( arguments )
			.verReturn( this.buf )
		;
	}
	
	return this.buf;
}

Id.prototype.toString = function()
{
	if( conf.doVer() === true )
	{
		var fv =
			new FuncVer( undefined, Id.ID_STR_S ).verArgs( arguments )
		;
	}
	
	var returnVar = this.buf.toString( "base64" );
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

exports.Id = Id;
