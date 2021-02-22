ourglobe.core.define(
[],
function()
{

var ReturnVarVer =
function( returnVarSchema )
{
	ReturnVarVer.ourGlobeSuper.call( this, returnVarSchema );
};

ReturnVarVer.getR =
function( returnVarSchema )
{
	return new ReturnVarVer( returnVarSchema );
};

return ReturnVarVer;

});
