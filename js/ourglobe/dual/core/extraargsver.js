ourglobe.core.define(
[],
function()
{

var ExtraArgsVer =
function( extraArgsSchema )
{
	ExtraArgsVer.ourGlobeSuper.call( this, extraArgsSchema );
};

ExtraArgsVer.getE =
function( extraArgsSchema )
{
	return new ExtraArgsVer( extraArgsSchema );
};

return ExtraArgsVer;

});
