ourglobe.core.define(
[],
function()
{

function FuncCreationRuntimeError(
	msg, errorVar, errorCode, errorPlace
)
{
	if( ourglobe.conf.doVer() === true )
	{
		if( !( arguments.length >= 1 && arguments.length <= 4 ) )
		{
			throw new ourglobe.RuntimeError(
				"Between one and four args must be provided",
				{ providedArgs: arguments }
			);
		}
		
// Args dont need to be further verified as this is already done
// by OurGlobeError
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = this.constructor;
	}
	
	FuncCreationRuntimeError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
}

return FuncCreationRuntimeError;

});
