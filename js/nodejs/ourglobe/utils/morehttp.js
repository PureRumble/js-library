var http = require("http");
var sys = require("ourglobe").sys;

var conf = require("ourglobe").conf;
var FuncVer = require("ourglobe").FuncVer;

var MoreHttp = {};

MoreHttp.REQUEST_CB_FV =
new FuncVer()
	.addArgs( [ Error ] )
	.addArgs( [
		"undef", FuncVer.NON_NEG_INT, [ Buffer, "undef" ]
	] )
;

MoreHttp.request = function( hostname, opts, cb )
{
	if( conf.doVer() === true )
	{
		new FuncVer()
			.addArgs( [
				FuncVer.PROPER_STR,
				{
					types:"obj/undef",
					extraProps:false,
					props:{
						port:"int/undef",
						method:{
							values:[
								"GET", "POST", "PUT", "DELETE", undefined
							]
						},
						path:"str/undef",
						params:"obj/undef",
						headers:"obj/undef",
						data:"str/undef"
					}
				},
				"func"
			] )
			.addArgs( [ FuncVer.PROPER_STR, "func" ] )
			.verArgs( arguments )
		;
	}
	
	if( sys.hasType( opts, "func" ) === true )
	{
		cb = opts;
		opts = undefined;
	}
	
	var port, method, path, params, headers, data = undefined;
	
	if( opts !== undefined )
	{
		port = opts.port;
		method = opts.method;
		path = opts.path;
		params = opts.params;
		headers = opts.headers;
		data = opts.data;
	}
	
	var paramsStr = undefined;
	
	if( params !== undefined )
	{
		paramsStr = "";
		
		for( var param in params )
		{
			if( params[param] !== undefined )
			{
				paramsStr +=
					encodeURIComponent( param )+"="+
					encodeURIComponent( params[param] )+
					"&"
				;
			}
		}
		
		paramsStr = paramsStr !== "" ?
			paramsStr.substr( 0, paramsStr.length-1 ) :
			undefined
		;
	}
	
	path = path !== undefined ? path : "/";
	
	path += paramsStr !== undefined ? "?"+paramsStr : ""; 
	
	path = path !== "/" ? path : undefined;
	
	var reqOpts = {
		method: method,
		hostname: hostname,
		port: port,
		path: path,
		headers: headers,
		data: data
	};
	
	var req = http.request( reqOpts,
	function( res )
	{
		if( conf.doVer() === true )
		{
			new FuncVer( [ "obj" ] ).verArgs( arguments );
		}
		
		var statusCode = res.statusCode;
		var chunks = [];
		var length = 0;
		
		res.on( "close", function( err )
		{
			if( conf.doVer() === true )
			{
				new FuncVer( [ Error ] ).verArgs( arguments );
			}
			
			cb( err );
			
		} );
		
		res.on( "data", function( chunk )
		{
			if( conf.doVer() === true )
			{
				new FuncVer( [ Buffer ] ).verArgs( arguments );
			}
			
			chunks.push( chunk );
			length += chunk.length;
			
		} );
		
		res.on( "end", function()
		{
			if( conf.doVer() === true )
			{
				new FuncVer().verArgs( arguments );
			}
			
			var resp = undefined;
			
			if( length > 0 )
			{
				resp = new Buffer( length );
				var total = 0;
				
				chunks.forEach( function( chunk )
				{
					chunk.copy( resp, total, 0 );
					total += chunk.length;
					
				} );
			}
			
			cb( undefined, statusCode, resp );
			
		} );
		
	} );
	
	req.on( "error", function( err )
	{
		if( conf.doVer() === true )
		{
			new FuncVer( [ Error ] ).verArgs( arguments );
		}
		
		cb( err );
		
	} );
	
	if( data !== undefined )
	{
		req.write( data );
	}
	
	req.end();
}

exports.MoreHttp = MoreHttp;
