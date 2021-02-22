ourglobe.define(
function( mods )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var MoreMath = {};

MoreMath.getRandInt =
getF(
new FuncVer( [ { gte: 0 } ], { gte: 0 } ),
function( integer )
{
	return Math.floor( Math.random() * integer );
});

return MoreMath;

});
