og.core.define(
function()
{

var OurGlobeObject = {};

OurGlobeObject.getClass =
function( obj )
{
	if( og.conf.doVer() === true )
	{
		og.assert.nrArgs( arguments, 1 );
	}
	
	if( obj instanceof Object === false )
	{
		return undefined;
	}
	
	return obj.constructor;
}

return OurGlobeObject;

});
