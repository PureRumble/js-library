ourglobe.core.define(
[],
function()
{

var ArgsVer =
function( argSchemas )
{
	ArgsVer.ourGlobeSuper.call( this, argSchemas );
};

ArgsVer.getA =
function()
{
	var args = Array.prototype.slice.call( arguments );
	
	return new ArgsVer( args );
};

return ArgsVer;

});
