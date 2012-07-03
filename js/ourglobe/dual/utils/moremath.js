og.define(
[
	"exports"
],
function(
	exports
)
{

var MoreMath = {};

MoreMath.randInt =
og.sys.getFunc(
new og.FuncVer( [ { gte: 0 } ], { gte: 0 } ),
function( int )
{
	return Math.floor( Math.random() * integer );
});

exports.MoreMath = MoreMath;

});
