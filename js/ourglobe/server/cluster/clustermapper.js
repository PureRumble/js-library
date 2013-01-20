ourglobe.define(
[
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

var ClusterConHandler = undefined;

mods.delay(
function()
{
	ClusterConHandler = mods.get( "clusterconhandler" );
});

var ClusterMapper =
Class.create(
{

name: "ClusterMapper",
constr:
[
function()
{
	return(
		[
			getA(
				{
					extraItems: ClusterConHandler,
					minItems: 1,
					denseItems: true
				},
				{ extraItems: "+int" }
			)
		]
	);
},
function( clusterConHandlers, mapping )
{
	var clusterMapping = [];
	
	for( var coll in mapping )
	{
		var cch = clusterConHandlers[ mapping[ coll ] ];
		
		clusterMapping[ coll ] = cch;
		
		if( cch === undefined )
		{
			throw new RuntimeError(
				"Collection "+coll+" is to be mapped to the "+
				"ClusterConHandler on pos "+mapping[ coll ]+" but arg "+
				"clusterConHandlers is empty on that pos"
			);
		}
	}
	
	this.clusterConHandlers = clusterConHandlers;
	this.clusterMapping = clusterMapping;
}]

});

return ClusterMapper;

},
function( mods, ClusterMapper )
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

var ClusterConHandler = mods.get( "clusterconhandler" );

Class.add(
ClusterMapper,
{

getConHandler:
[
getA( ClusterConHandler.COLLECTION_NAME_S ),
getR( ClusterConHandler ),
function( collection )
{
	return this.clusterMapping[ collection ];
}]

});

});
