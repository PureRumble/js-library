ourglobe.define(
[
	"./id",
	"./storeconhandler"
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
var StoreConHandler = undefined;

mods.delay(
function()
{
	Id = mods.get( "id" );
	StoreConHandler = mods.get( "storeconhandler" );
});

var Link =
Class.create(
{

name: "Link",
constr:
[
function()
{
	return [ getA( StoreConHandler.COLLECTION_NAME_S, Id ) ];
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
var StoreConHandler = mods.get( "storeconhandler" );

Class.add(
Link,
{

verStoreVars:
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
getR( StoreConHandler.COLLECTION_NAME_S ),
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
