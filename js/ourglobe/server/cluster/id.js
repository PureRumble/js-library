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

var idStrRegExp =
	"^[0-9a-f]{8}[0-9a-f]{4}4[0-9a-f]{3}"
	"[89ab][0-9a-f]{3}[0-9a-f]{12}$"
;
var idStrS = { strPattern: idStrRegExp };

var Id =
getF(
new FuncVer( [ [ idStrS, "undef" ] ]  ),
function( idStr )
{
	if( idStr === undefined )
	{
		var rb = crypto.randomBytes( 16 );
		
		rb[ 6 ] = ( rb[ 6 ] & 0x0f ) | 0x40;
		rb[ 8 ] = ( rb[ 8 ] & 0x3f ) | 0x80;
		
		idStr = new Buffer( rb ).toString( "hex" );
	}
	
	this.idStr = idStr;
});

Id.ID_STR_REG_EXP = idStrRegExp;
Id.ID_STR_S = idStrS;
Id.R_ID_STR_S = { req: true, strPattern: Id.ID_STR_REG_EXP };

return Id;

},
function( mods, Id )
{

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

Id.verIdStr =
getF(
new FuncVer( [ "any" ] )
	.setReturn( "bool" ),
function( idStr )
{
	return(
		sys.hasType( idStr, "str" ) === true &&
		idStr.search( Id.ID_STR_REG_EXP ) === 0
	);
});

Id.verClusterVars =
getF(
new FuncVer( [ "any" ] ).
	setReturn( "bool" ),
function( idStr )
{
	return Id.verIdStr( idStr );
})

Id.prototype.toString =
getF(
new FuncVer().setReturn( Id.ID_STR_S ),
function()
{
	return this.idStr;
});

});
