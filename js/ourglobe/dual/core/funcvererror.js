og.core.define(
function()
{

function FuncVerError( msg, errorVar, errorCode, errorPlace )
{
	if( og.conf.doVer() === true )
	{
		if( !( arguments.length >= 1 || arguments.length <= 4 ) )
		{
			throw new og.RuntimeError(
				"Between one and four args must be provided",
				{ providedArgs: arguments }
			);
		}
		
// Args dont need to be further verified as this is already done
// by OurGlobeError
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = FuncVerError;
	}
	
	FuncVerError.ourGlobeSuper.call(
		this, msg, errorVar, errorCode, errorPlace
	);
}

return FuncVerError;

});
