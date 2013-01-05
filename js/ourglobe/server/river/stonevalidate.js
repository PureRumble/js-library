ourGlobe.define(
[
	"./streamerror",
	"./stream",
	"./stone"
],
function( mods )
{

var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var Stone = undefined;

mods.delay(
function()
{
	Stone = mods.get( "stone" );
});

var StoneValidate =
Class.create(
{

name: "StoneValidate",
delayedExt:
function()
{
	return Stone;
},
instVars:
{
	failureCode: "final"
},
constr:
[
function()
{
	return Stone.CONSTR_V;
},
function( drop )
{
	this.failureCode = undefined;
	
	this.ourGlobeCallSuper( undefined, drop );
}]

});

return StoneValidate;

},
function( mods, StoneValidate )
{

var hasT = ourGlobe.hasT;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var StreamError = mods.get( "streamerror" );
var Stone = mods.get( "stone" );
var Stream = mods.get( "stream" );

Class.add(
StoneValidate,
{

flowStream:
[
Stone.VALIDATE_V,
function( cb )
{
	this.drop.stream.validate( this.drop, cb );
}],

handleCbArgs:
[
Stone.HANDLE_CB_ARGS_V,
function( err, failureCode )
{
	if( arguments.length > 2 )
	{
		return(
			new StreamError(
				this.drop,
				"No more than two args may be given to the cb of "+
				"Stream.validate()",
				{ providedArgs: arguments },
				Stream.INVALID_ARGS_FOR_VALIDATE_CB
			)
		);
	}
	
	if(
		failureCode !== undefined &&
		Stream.failureCodeIsValid( failureCode ) === false
	)
	{
		return(
			new StreamError(
				this.drop,
				"Arg failureCode given to the cb of "+
				"Stream.validate() must be undef or a valid "+
				"failure code",
				{ failureCode: failureCode },
				Stream.INVALID_ARGS_FOR_VALIDATE_CB
			)
		);
	}
	
	this.failureCode = failureCode;
	
	return [ undefined, failureCode ];
}],

getErrThrownCode:
[
Stone.GET_ERR_THROWN_CODE_V,
function()
{
	return Stream.ERR_AT_VALIDATE;
}],

getCbErrCode:
[
Stone.GET_CB_ERR_CODE_V,
function()
{
	return Stream.ERR_AT_VALIDATE_CB;
}],

getInvalidCbArgsCode:
[
Stone.GET_INVALID_CB_ARGS_CODE_V,
function()
{
	return Stream.INVALID_ARGS_FOR_VALIDATE_CB;
}]

});

});
