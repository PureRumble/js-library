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

Binary.verClusterVars =
getF(
new FuncVer( [ "any", "any" ], "bool" ),
function( buf, contentType )
{
// verClusterVars() can be used to verify contentType alone,
// in which case contentType is the first arg
	return(
		(
			arguments.length === 1 &&
			buf === "jpg"
		) ||
		(
			buf instanceof Buffer === true &&
			contentType === "jpg"
		)
	);
});

Binary.prototype.getBuffer =
getF(
new FuncVer().setReturn( Buffer ),
function()
{
	return this.buf;
});

Binary.prototype.getContentType =
getF(
new FuncVer().setReturn( Binary.CONTENT_TYPE_S ),
function()
{
	return this.contentType;
});

});
