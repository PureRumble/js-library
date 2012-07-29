ourglobe.core.define(
function()
{

var OurGlobeObject =
function()
{
	if( ourglobe.conf.doVer() === true )
	{
		if( arguments.length !== 0 )
		{
			throw new ourglobe.RuntimeError(
				"No args should be provided",
				{ providedNrArgs: arguments.length }
			);
		}
	}
};

return OurGlobeObject;

});
