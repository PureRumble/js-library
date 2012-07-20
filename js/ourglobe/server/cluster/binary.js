ourglobe.define(
function( mods )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var contentTypeS = { values:[ "jpg" ] };

var Binary =
getF(
new FuncVer( [ Buffer, contentTypeS ] ),
function ( buf, contentType )
{
	this.buf = buf;
	this.contentType = contentType;
});

Binary.CONTENT_TYPE_S = contentTypeS;

return Binary;

},
function( mods, Binary )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

Binary.prototype.getBuffer =
getF(
new FuncVer( undefined, Buffer ),
function()
{
	return this.buf;
});

Binary.prototype.getContentType =
getF(
new FuncVer( undefined, Binary.CONTENT_TYPE_S ),
function()
{
	return this.contentType;
});

});
