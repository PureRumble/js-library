ourglobe.define(
function( mods )
{

var OurGlobeError = ourglobe.OurGlobeError;

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
	
	if( errorPlace === undefined )
	{
		errorPlace = TestRuntimeError;
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
	
	this.name = this.constructor.name;
	this.message = msg;
	this.ourGlobeVar = errorVar;
	this.ourGlobeCode = errorCode;
	this.ourGlobePlace = errorPlace;
	
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
