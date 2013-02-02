ourglobe.define(
[
	"./binary",
	"./id",
	"./link",
	"./cache"
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

var Store = Class.create( { name: "Store" } );

Class.addStatic(
Store,
{
	STORE_SYS_PROP: "ourGlobeServerStore={F|6yOA&]#",
	ID_STORE_NAME: "org.ourGlobe.server.store.Id",
	BINARY_STORE_NAME: "org.ourGlobe.server.store.Binary",
	DATE_STORE_NAME: "org.ourGlobe.server.store.Date",
	GET_STORE_NAME_V: getV( getR( "any" ) ),
	RESTORE_OBJ_V: getV( getA( "obj" ), getR( "any" ) ),
	COLLECTION_NAME_S: getV.PROPER_STR_L,
	storableClasses:[]
});

return Store;

},
function( mods, Store )
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

var Binary = mods.get( "binary" );
var Id = mods.get( "id" );
var Link = mods.get( "link" );
var Cache = mods.get( "cache" );

Class.add(
Store,
{

init:
[
"static",
getA.ANY_ARGS,
function()
{
	Store.storableClasses[ Store.DATE_STORE_NAME ] = Date;
	Store.storableClasses[ Binary.getStoreName() ] = Binary;
	Store.storableClasses[ Id.getStoreName() ] = Id;
	Store.storableClasses[ Link.getStoreName() ] = Link;
	Store.storableClasses[ Cache.getStoreName() ] = Cache;
}]

});

});
