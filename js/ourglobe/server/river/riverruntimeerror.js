ourGlobe.define(
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var assert = ourGlobe.assert;
var sys = ourGlobe.sys;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var RiverRuntimeError =
Class.create(
{

name: "RiverRuntimeError",
extends: RuntimeError,
constr:
[
RuntimeError.CONSTR_V,
function( msg, errorVar, errorCode, errorPlace )
{
	this.ourGlobeCallSuper(
		undefined, msg, errorVar, errorCode, errorPlace
	);
}]

});

return RiverRuntimeError;

});
