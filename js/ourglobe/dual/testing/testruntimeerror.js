ourglobe.define(
function( mods )
{

var OurGlobeError = ourglobe.OurGlobeError;

// This class is used for handling unintentional errs that occur 
// during testing. Since it is to be used to test anything within
// ourGlobe, it doesnt extend OurGlobeError

var TestRuntimeError =
function( msg, errorVar, errorCode, errorPlace )
{
	if( arguments.length < 1 || arguments.length > 4 )
	{
		throw new TestRuntimeError(
			"Between one and four args must be provided"
		);
	}
	
	Error.call( this, msg );
	
	if(
		typeof( errorCode ) === "function" &&
		errorPlace === undefined
	)
	{
		errorPlace = errorCode;
		errorCode = undefined;
	}
	
	if(
		typeof( errorVar ) === "function" &&
		errorCode === undefined &&
		errorPlace === undefined
	)
	{
		errorPlace = errorVar;
		errorVar = undefined;
	}
	
	if(
		typeof( errorVar ) === "string" && errorCode === undefined
	)
	{
		errorCode = errorVar;
		errorVar = undefined;
	}
	
	if( errorPlace === undefined )
	{
		errorPlace = this.__proto__.constructor;
	}
	
	var res =
	OurGlobeError.verArgsWithoutErr(
		msg, errorVar, errorCode, errorPlace
	);
	
	if( res !== undefined )
	{
		throw new TestRuntimeError(
			res.message, res.errorVar, res.errorCode, res.errorPlace
		);
	}
	
	this.className = this.className;
	this.message = msg;
	this.ourGlobeVar = errorVar;
	this.ourGlobeCode = errorCode;
	
	Error.captureStackTrace( this, errorPlace );
};

TestRuntimeError.prototype.__proto__ = Error.prototype;

return TestRuntimeError;

},
function( mods, TestRuntimeError )
{

var OurGlobeError = ourglobe.OurGlobeError;

TestRuntimeError.prototype.toString =
function()
{
	return OurGlobeError.toString( this );
};

});
