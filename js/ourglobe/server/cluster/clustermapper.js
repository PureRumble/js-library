ourglobe.define(
[
	"./clusterconhandler"
],
function( mods )
{

var RuntimeError = ourglobe.RuntimeError;

var FuncVer = ourglobe.FuncVer;
var getF = ourglobe.getF;

var ClusterMapper =
getF(
function()
{
	return(
		new FuncVer( [
			{
				extraItems: mods.get( "clusterconhandler" ),
				minItems: 1,
				denseItems: true
			},
			{ extraItems: "+int" }
		])
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
});

return ClusterMapper;

},
function( mods, ClusterMapper )
{

var FuncVer = ourglobe.FuncVer;
var getF = ourglobe.getF;

var ClusterConHandler = mods.get( "clusterconhandler" );

ClusterMapper.prototype.getConHandler =
getF(
new FuncVer(
	[ ClusterConHandler.COLLECTION_NAME_S ], ClusterConHandler
),
function( collection )
{
	return this.clusterMapping[ collection ];
});

});
