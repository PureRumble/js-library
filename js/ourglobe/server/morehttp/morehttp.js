og.define(
[
	"http"
],
function( mods )
{

var http = mods.get( "http" );

var conf = og.conf;
var sys = og.sys;
var getF = og.getF;
var FuncVer = og.FuncVer;

var MoreHttp = {};

MoreHttp.REQUEST_CB_FV =
new FuncVer()
	.addArgs( [ Error ] )
	.addArgs( [
		"undef", FuncVer.NON_NEG_INT, [ Buffer, "undef" ]
	] )
;

MoreHttp.request =
getF(
new FuncVer()
	.addArgs( [
		FuncVer.PROPER_STR,
		{
			types: "obj/undef",
			extraProps: false,
			props:
			{
				port: "int/undef",
				method:
				{
					values: [ "GET", "POST", "PUT", "DELETE", undefined ]
				},
				path: "str/undef",
				params: "obj/undef",
				headers: "obj/undef",
				data: "str/undef"
			}
		},
		"func"
	])
	.addArgs( [ FuncVer.PROPER_STR, "func" ] ),
function( hostname, opts, cb )
{
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
	
	var req =
	http.request(
	reqOpts,
	
	getF(
	new FuncVer( [ "obj" ] ),
	function( res )
	{
		var statusCode = res.statusCode;
		var chunks = [];
		var length = 0;
		
		res.on(
			"close",
			getF(
				new FuncVer( [ Error ] ),
				function( err )
				{
					cb( err );
				}
			)
		);
		
		res.on(
			"data",
			getF(
				new FuncVer( [ Buffer ] ),
				function( chunk )
				{
					chunks.push( chunk );
					length += chunk.length;
				}
			)
		);
		
		res.on(
			"end",
			getF(
				new FuncVer(),
				function()
				{
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
				}
			)
		);
	}));
	
	req.on(
		"error",
		getF(
			new FuncVer( [ Error ] ),
			function( err )
			{
				cb( err );
			}
		)
	);
	
	if( data !== undefined )
	{
		req.write( data );
	}
	
	req.end();
});

return MoreHttp

});
