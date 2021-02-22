ourglobe.define(
[
	"./store",
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

var StoreConHandler = undefined;

mods.delay(
function()
{
	StoreConHandler = mods.get( "storeconhandler" );
});

var StoreMapper =
Class.create(
{

name: "StoreMapper",
constr:
[
function()
{
	return(
		[
			getA(
				{
					extraItems: StoreConHandler,
					minItems: 1,
					denseItems: true
				},
				{ extraItems: "+int" }
			)
		]
	);
},
function( storeConHandlers, mapping )
{
	var storeMapping = [];
	
	for( var coll in mapping )
	{
		var cch = storeConHandlers[ mapping[ coll ] ];
		
		storeMapping[ coll ] = cch;
		
		if( cch === undefined )
		{
			throw new RuntimeError(
				"Collection "+coll+" is to be mapped to the "+
				"StoreConHandler on pos "+mapping[ coll ]+" but arg "+
				"storeConHandlers is empty on that pos"
			);
		}
	}
	
	this.storeConHandlers = storeConHandlers;
	this.storeMapping = storeMapping;
}]

});

return StoreMapper;

},
function( mods, StoreMapper )
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

var Store = mods.get( "store" );
var StoreConHandler = mods.get( "storeconhandler" );

Class.add(
StoreMapper,
{

getConHandler:
[
getA( Store.COLLECTION_NAME_S ),
getR( StoreConHandler ),
function( collection )
{
	return this.storeMapping[ collection ];
}]

});

});
