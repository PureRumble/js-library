ourglobe.define(
function( mods )
{

var OurGlobeError = ourglobe.OurGlobeError;
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

var ElasticsearchError =
Class.create(
{

name: "ElasticsearchError",
extends: OurGlobeError,
constr:
[
getA(
	{
		extraProps: false,
		props:{ host: getV.R_PROPER_STR, opts: getV.R_PROPER_OBJ }
	},
	{
		extraProps: false,
		props:{ res: "str", status: getV.NON_NEG_INT }
	},
	"any",
	"any",
	"any",
	"any"
),
function( req, res, msg, errVar, errCode, errPlace )
{
	this.ourGlobeCallSuper(
		undefined, msg, errVar, errCode, errPlace
	);
}]

});

return ElasticsearchError;

});
