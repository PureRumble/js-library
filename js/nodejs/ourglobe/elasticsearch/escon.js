var url = require("url");

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;
var MoreObject = require("ourglobe/utils").MoreObject;

var MoreHttp = require("ourglobe/utils").MoreHttp;

function EsCon( host, port )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ FuncVer.PROPER_STR, FuncVer.NON_NEG_INT ] )
			.verArgs( arguments )
		;
	}
	
	this.host = host;
	this.port = port;
}

EsCon.prototype.request = function( method, path, opts, cb )
{
	if( conf.doVer() === true )
	{
		var methodS = { values:[ "GET", "PUT", "POST", "DELETE" ] };
		
		new FuncVer()
			.addArgs( [
				methodS,
				FuncVer.PROPER_STR,
				{
					types:"obj/undef", extraProps:false, props:{
						params:"obj/undef",
						data:{
							types:"obj/arr/undef",
							denseItems:true,
							extraItems:"+obj"
						}
					}
				},
				"func"
			] )
			.addArgs( [ methodS, FuncVer.PROPER_STR, "func" ] )
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( opts, "func" ) === true )
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
		if( sys.hasType( data, "arr" ) === false )
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
	
	var reqOpts = {
		method: method,
		port: this.port,
		path: path,
		params: params,
		headers: headers,
		data: jsonData
	};
	
	var outerThis = this;
	
	MoreHttp.request(
		this.host, reqOpts, function( err, status, resBuf )
		{
			if( conf.doVer() === true )
			{
				new FuncVer()
					.addArgs( [ Error ] )
					.addArgs( [
						"undef", FuncVer.NON_NEG_INT, [ Buffer, "undef" ]
					] )
					.verArgs( arguments )
				;
			}
			
			if( sys.errorCheck( err, cb ) === true ) { return; }
			
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
				err = new ElasticsearchError(
					"The received response data isnt a valid JSON "+
					"object. The response data and request are: "+
					MoreObject.getPrettyStr(
						{ response:jsonRes, request:reqOpts }
					),
					{ host:outerThis.host, opts:reqOpts },
					{ res:jsonRes, status:status }
				);
			}
			else if(
				new RegExp( /2\d\d|404/ ).test( ""+status ) === false
			)
			{
				err = new ElasticsearchError(
					"Response status code isnt expected."+
					"The status code, data and request are: "+
					MoreObject.getPrettyStr( {
						status:status, response:jsonRes, request:reqOpts
					} ),
					{ host:outerThis.host, opts:reqOpts },
					{ res:jsonRes, status:status }
				);
			}
			else if( res !== undefined )
			{
				var errorOccured = false;
				
				if( res.error !== undefined )
				{
					errorOccured = true;
				}
				else if( sys.hasType( data, "arr" ) === true )
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
					err = new ElasticsearchError(
						"Response data indicates an error occured."+
						"The response data and request are:"+
						MoreObject.getPrettyStr(
							{ response:jsonRes, request:reqOpts }
						),
						{ host:outerThis.host, opts:reqOpts },
						{ res:jsonRes, status:status }
					);
				}
			}
			
			if( sys.errorCheck( err, cb ) === true )
			{
				return;
			}
			else
			{
				cb( undefined, res );
			}
		}
	);
}

exports.EsCon = EsCon;

var ElasticsearchError = require("./errors").ElasticsearchError;