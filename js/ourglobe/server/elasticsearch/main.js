ourglobe.define(
[
	"./elasticconhandler",
	"./elasticsearcherror"
],
function( mods )
{

return(
	{
		ElasticConHandler: mods.get( "elasticconhandler" ),
		ElasticsearchError: mods.get( "elasticsearcherror" )
	}
);

});
