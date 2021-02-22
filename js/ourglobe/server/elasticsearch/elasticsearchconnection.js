ourglobe.define(
[
	"url",
	"ourglobe/server/morehttp",
	"./elasticsearcherror"
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

var ElasticsearchConnection =
Class.create(
{

name: "ElasticsearchConnection",
constr:
[
getA( getV.PROPER_STR, getV.NON_NEG_INT ),
function( host, port )
{
	this.host = host;
	this.port = port;
}]

});

return ElasticsearchConnection;

},
function( mods, ElasticsearchConnection )
{

var url = mods.get( "url" );

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

var MoreHttp = mods.get( "morehttp" ).MoreHttp;
var ElasticsearchError = mods.get( "elasticsearcherror" );

var methodS = { values:[ "GET", "PUT", "POST", "DELETE" ] };

Class.add(
ElasticsearchConnection,
{

request:
[
getA(
	methodS,
	getV.PROPER_STR,
	{
		types: "obj/undef",
		extraProps: false,
		props:
		{
			params: "obj/undef",
			data:
			{
				types: "obj/arr/undef",
				denseItems: true,
				extraItems: "+obj"
			}
		}
	},
	"func"
),
getA( methodS, getV.PROPER_STR, "func" ),
function( method, path, opts, cb )
{
	if( hasT( opts, "func" ) === true )
	{
		cb = opts;
		opts = undefined;
	}
	
	var params, data = undefined;
	
	if( opts !== undefined )
	{
		params = opts.params;
		data = opts.data;
	}
	
	var jsonData = undefined;
	
	if( data !== undefined )
	{
		if( hasT( data, "arr" ) === false )
		{
			jsonData = JSON.stringify( data );
		}
		else
		{
			jsonData = [];
			
			for( var pos = 0; pos < data.length; pos++ )
			{
				jsonData[ pos ] = JSON.stringify( data[ pos ] );
			}
			
			jsonData[ jsonData.length ] = "\n";
			
			jsonData = jsonData.join( "\n" );
		}
	}
	
	var headers =
		jsonData !== undefined ?
			{
				"Content-Length": jsonData.length,
				"Content-Type": "application/x-www-form-urlencoded"
			} :
			undefined
	;
	
	var reqOpts =
	{
		method: method,
		port: this.port,
		path: path,
		params: params,
		headers: headers,
		data: jsonData
	};
	
	var outerThis = this;
	
	MoreHttp.request(
		this.host,
		reqOpts,
		getCb(
		this,
		getA( Error ),
		getA( "undef", getV.NON_NEG_INT, [ Buffer, "undef" ] ),
		function( err, status, resBuf )
		{
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			
			var res = undefined;
			var jsonRes = undefined;
			var parseFailed = false;
			
			if( resBuf !== undefined )
			{
				jsonRes = resBuf.toString();
				
				try
				{
					res = JSON.parse( jsonRes );
				}
				catch( e )
				{
					parseFailed = true;
				}
			}
			
			var err = undefined;
			
			if( parseFailed === true )
			{
				err =
				new ElasticsearchError(
					{ host:outerThis.host, opts:reqOpts },
					{ res:jsonRes, status:status },
					"The received response data isnt a valid JSON "+
					"object"
				);
			}
			else if(
				new RegExp( /2\d\d|404/ ).test( ""+status ) === false
			)
			{
				err =
				new ElasticsearchError(
					{ host:outerThis.host, opts:reqOpts },
					{ res:jsonRes, status:status },
					"Response status code isnt expected"
				);
			}
			else if( res !== undefined )
			{
				var errorOccured = false;
				
				if( res.error !== undefined )
				{
					errorOccured = true;
				}
				else if( hasT( data, "arr" ) === true )
				{
					var items = res.items;
					
					for( var pos = 0; pos < items.length; pos++ )
					{
						if(
							(
								items.index !== undefined &&
								items.index.error !== undefined
							)
							||
							(
								items.delete !== undefined &&
								items.delete.error !== undefined
							)
						)
						{
							errorOccured = true;
							break;
						}
					}
				}
				
				if( errorOccured === true )
				{
					err =
					new ElasticsearchError(
						{ host:outerThis.host, opts:reqOpts },
						{ res:jsonRes, status:status },
						"Response data indicates an error occured"
					);
				}
			}
			
			if( err !== undefined )
			{
				cb( err );
				
				return;
			}
			else
			{
				cb( undefined, res );
			}
		})
	);
}]

});

});
