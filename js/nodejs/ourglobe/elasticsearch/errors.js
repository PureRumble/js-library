var OurGlobeError = require("ourglobe").OurGlobeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

function ElasticsearchError(
	message, request, response, caller
)
{
	if( conf.doVer() === true )
	{
		new FuncVer(
			[
				FuncVer.PROPER_STR,
				{
					extraProps:false, props:{
						host:FuncVer.R_PROPER_STR, opts:FuncVer.R_PROPER_OBJ
					}
				},
				{
					extraProps:false, props:{
						res:"str", status:FuncVer.NON_NEG_INT
					}
				},
				"func/undef"
			]
		)
			.verArgs( arguments)
		;
	}
	
	this.request = request;
	this.response = response;
	
	caller = caller !== undefined ? caller : ElasticsearchError;
	
	ElasticsearchError.super_.call( this, message, caller );
}

sys.inherits( ElasticsearchError, OurGlobeError );

exports.ElasticsearchError = ElasticsearchError;
