ourglobe.define(
[
	"./id",
	"./clusterconhandler"
],
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

var Id = undefined;
var ClusterConHandler = undefined;

mods.delay(
function()
{
	Id = mods.get( "id" );
	ClusterConHandler = mods.get( "clusterconhandler" );
});

var Link =
Class.create(
{

name: "Link",
constr:
[
function()
{
	return [ getA( ClusterConHandler.COLLECTION_NAME_S, Id ) ];
},
function( collection, id )
{
	this.collection = collection;
	this.id = id;
}]

});

return Link;

},
function( mods, Link )
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

var Id = mods.get( "id" );
var ClusterConHandler = mods.get( "clusterconhandler" );

Class.add(
Link,
{

verClusterVars:
[
"static",
getA( "any" ),
getR( "bool" ),
function( collection )
{
	return(
		hasT( collection, "str" ) === true &&
		collection.length > 0
	);
}],

getCollection:
[
getR( ClusterConHandler.COLLECTION_NAME_S ),
function()
{
	return this.collection;
}],

getId:
[
getR( Id ),
function()
{
	return this.id;
}]

});

});
