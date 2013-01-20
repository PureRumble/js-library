ourglobe.define(
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getF = ourGlobe.getF;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var ClusterDataRuntimeError =
Class.create(
{

name: "ClusterDataRuntimeError",
extends: RuntimeError,
constr:
[
RuntimeError.CONSTR_FV,
function( msg, errVar, errCode, errPlace )
{
	this.ourGlobeCallSuper(
		undefined, msg, errVar, errCode, errPlace
	);
}]

});

return ClusterDataRuntimeError;

});
