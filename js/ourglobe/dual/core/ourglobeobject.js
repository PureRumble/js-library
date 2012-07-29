ourglobe.core.define(
function()
{

var OurGlobeObject =
function()
{
	
};

OurGlobeObject.prototype.ourGlobeCall =
function( funcName )
{
	if( ourglobe.conf.doVer() === true )
	{
		if( arguments.length < 1 )
		{
			throw new ourglobe.RuntimeError(
				"Atleast one arg must be provided",
				{ providedNrArgs: arguments.length }
			);
		}
		
		if(
			funcName !== undefined && typeof( funcName ) !== "string"
		)
		{
			throw new ourglobe.RuntimeError(
				"Arg funcName must be undef or a str",
				{ providedArg: funcName }
			);
		}
	}
	
	if( funcName === undefined )
	{
		funcName = "constructor";
	}
	
	var func = this.__proto__.__proto__[ funcName ];
	
	if( sys.hasType( func, "func" ) === false )
	{
		throw new RuntimeError(
			"'"+funcName+"' must be a func in the super class to be "+
			"called",
			{ obtainedFromSuperClass: func }
		);
	}
	
	var args = [];
	
	if( arguments.length > 1 )
	{
		args = Array.prototype.slice.call( arguments, 1 );
	}
	
	return func.apply( this, args );
};

return OurGlobeObject;

});
