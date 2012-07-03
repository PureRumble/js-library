og.define(
[
	"exports"
],
function(
	exports
)
{

// MoreObject isnt allowed to use the core modules that
// are exposed under "ourglobe" and must therefore rely on
// ourglobe.loadMods(). This is because it is likely that
// MoreObject is used by the core modules in the future
var mods = og.loadMods();

var conf = mods.conf;
var assert = mods.assert;

var MoreObject = {};

MoreObject.getClass = function( obj )
{
	if( conf.doVer() === true )
	{
		assert.nrArgs( arguments, 1 );
	}
	
	if( obj instanceof Object === false )
	{
		return undefined;
	}
	
	return obj.constructor;
}

exports.MoreObject = MoreObject;

});
