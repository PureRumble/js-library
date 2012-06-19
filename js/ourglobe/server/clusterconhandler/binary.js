var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

function Binary( buf, contentType )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ Buffer, Binary.CONTENT_TYPE_S ] )
			.verArgs( arguments )
		;
	}
	
	this.buf = buf;
	this.contentType = contentType;
}

Binary.CONTENT_TYPE_S = { values:[ "jpg" ] };

Binary.prototype.getBuffer = function()
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

Binary.prototype.getContentType = function()
{
	if( conf.doVer() === true )
	{
		new FuncVer( [], Binary.CONTENT_TYPE_S )
			.verArgs( arguments )
			.verReturn( this.contentType )
		;
	}
	
	return this.contentType;
}

exports.Binary = Binary;
