og.define(

function( mods )
{

var getF = og.getF;
var FuncVer = og.FuncVer;

var MoreMath = {};

MoreMath.randInt =
getF(
new FuncVer( [ { gte: 0 } ], { gte: 0 } ),
function( int )
{
	return Math.floor( Math.random() * integer );
});

return MoreMath;

});
