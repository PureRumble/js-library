ourglobe.define(
[
	"./id",
	"./store"
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
var Store = undefined;

mods.delay(
function()
{
	Id = mods.get( "id" );
	Store = mods.get( "store" );
});

var Link =
Class.create(
{

name: "Link",
constr:
[
function()
{
	return [ getA( Store.COLLECTION_NAME_S, Id ) ];
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
var Store = mods.get( "store" );

Class.add(
Link,
{

getStoreName:
[
"static",
Store.GET_STORE_NAME_V,
function()
{
	return "org.ourGlobe.server.store.Link";
}],

restoreObj:
[
"static",
Store.RESTORE_OBJ_V,
function( obj )
{
	return new Link( obj.collection, obj.id );
}],

getCollection:
[
getR( Store.COLLECTION_NAME_S ),
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
