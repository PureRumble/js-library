ourglobe.define(
function( mods )
{

var OurGlobeError = ourglobe.OurGlobeError;

var sys = ourglobe.sys;
var getF = ourglobe.getF;
var FuncVer = ourglobe.FuncVer;

var ElasticsearchError =
getF(
new FuncVer( [
	OurGlobeError.MSG_S,
	{
		extraProps: false,
		props:
		{
			host: FuncVer.R_PROPER_STR, opts: FuncVer.R_PROPER_OBJ
		}
	},
	{
		extraProps: false,
		props: { res: "str", status: FuncVer.NON_NEG_INT }
	},
	OurGlobeError.VAR_S,
	OurGlobeError.CODE_S,
	OurGlobeError.PLACE_S
]),
function(
	message, request, response, errorVar, errorCode, errorPlace
)
{
	if( errorPlace === undefined )
	{
		errorPlace = ElasticsearchError;
	}
	
	if( errorVar === undefined )
	{
		errorVar = {};
	}
	
	errorVar.request = request;
	errorVar.response = response;
	
	ElasticsearchError.ourGlobeSuper.call(
		this, message, errorVar, errorCode, errorPlace
	);
});

sys.extend( ElasticsearchError, OurGlobeError );

return ElasticsearchError;

});
