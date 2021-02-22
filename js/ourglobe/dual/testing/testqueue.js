ourGlobe.define(
[
	
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;
var getF = ourGlobe.getF;

var TestQueue =
Class.create(
{

name: "TestQueue",
instVars:
{
	nrConcTests: "final"
},
constr:
[
getA.ANY_ARGS,
function( nrConcTests )
{
	if( arguments.length > 1 )
	{
		throw new RuntimeError(
			"No more than one arg may be provided",
			{ providedArgs: arguments }
		);
	}
	
	if(
		nrConcTests !== undefined &&
		( hasT( nrConcTests, "int" ) === false || nrConcTests < 1 )
	)
	{
		throw new RuntimeError(
			"Arg nrConcTests must be undef or a positive int",
			{ nrConcTests: nrConcTests }
		);
	}
	
	if( nrConcTests === undefined )
	{
		nrConcTests = 5;
	}
	
	this.nrConcTests = nrConcTests;
	this.nrCurrTests = 0;
	this.testStack = [];
}]

});

return TestQueue;

},
function( mods, TestQueue )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;
var getF = ourGlobe.getF;

Class.add(
TestQueue,
{

popTest:
[
function()
{
	if( this.nrCurrTests < this.nrConcTests )
	{
		if( this.testStack.length > 0 )
		{
			this.nrCurrTests++;
			
			var func = this.testStack.shift();
			
			func();
		}
	}
}],

pushTest:
[
getA( "func" ),
function( func )
{
	this.testStack.push( func );
	this.popTest();
}],

markTestDone:
[
function()
{
	this.nrCurrTests--;
	this.popTest();
}]

});

});