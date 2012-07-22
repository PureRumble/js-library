ourglobe.define(
[
	"./id",
	"./clusterconhandler"
],
function( mods )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var Link =
getF(
function()
{
	return(
		new FuncVer( [
			mods.get( "clusterconhandler" ).COLLECTION_NAME_S,
			mods.get( "./id" )
		])
	);
},
function( collection, id )
{
	this.collection = collection;
	this.id = id;
});

return Link;

},
function( mods, Link )
{

var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;
var sys = ourglobe.sys;

var Id = mods.get( "id" );
var ClusterConHandler = mods.get( "clusterconhandler" );

Link.verClusterVars =
getF(
new FuncVer( [ "any" ] ).setReturn( "bool" ),
function( collection )
{
	return(
		sys.hasType( collection, "str" ) === true &&
		collection.length > 0
	);
});

Link.prototype.getCollection =
getF(
new FuncVer( undefined, ClusterConHandler.COLLECTION_NAME_S ),
function()
{
	return this.collection;
});

Link.prototype.getId =
getF(
new FuncVer( undefined, Id ),
function()
{
	return this.id;
});

});
