ourGlobe.define(
[
	"http",
	"./riverruntimeerror",
	"./streamerror",
	"./stream",
	"./riverdrop"
],
function( mods )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var http = mods.get( "http" );

var Stream = undefined;
var RiverDrop = undefined;

mods.delay(
function()
{
	Stream = mods.get( "stream" );
	RiverDrop = mods.get( "riverdrop" );
});

var River =
Class.create(
{
name: "River",
constr:
[
getA.ANY_ARGS,
function( topStream, port )
{
	if( arguments.length !== 2 )
	{
		throw new RuntimeError(
			"Exactly two args must be provided",
			{ providedArgs: arguments }
		);
	}
	
	if( topStream instanceof Stream === false )
	{
		throw new RuntimeError(
			"Arg topStream must be a Stream",
			{ topStream: topStream }
		);
	}
	
	if( hasT( port, "int" ) === false || port < 0 )
	{
		throw new RuntimeError(
			"Arg port must be a non-neg int", { port: port }
		);
	}
	
	this.topStream = topStream;
	this.port = port;
	this.isRunning = false;
	
	var river = this;
	
	var server =
	http.createServer(
		getCb(
			this,
			getA( "inst", "inst" ),
			function( req, res )
			{
				this.flowDropThroughStream(
					new RiverDrop( req, res ),
					this.topStream,
					true,
					function()
					{
						
					}
				);
			}
		)
	);
	
	this.server = server;
	
	server.on(
		"listening",
		getCb(
			this,
			function()
			{
				this.isRunning = true;
			}
		)
	);
	
	server.on(
		"close",
		getCb(
			this,
			function()
			{
				this.isRunning = false;
			}
		)
	);
}]

});

Class.addStatic(
River,
{
	FLOW_CB_V: getV(),
	FREEZE_CB_V: getV()
});

return River;

},
function( mods, River )
{

var RuntimeError = ourGlobe.RuntimeError;

var sys = ourGlobe.sys;
var hasT = ourGlobe.hasT;
var getCb = ourGlobe.getCb;
var getV = ourGlobe.getV;
var getA = ourGlobe.getA;
var getE = ourGlobe.getE;
var getR = ourGlobe.getR;
var Class = ourGlobe.Class;

var http = mods.get( "http" );

var RiverRuntimeError = mods.get( "riverruntimeerror" );
var StreamError = mods.get( "streamerror" );
var Stream = mods.get( "stream" );
var RiverDrop = mods.get( "riverdrop" );

Class.add(
River,
{

handleErr:
[
getA( RiverDrop, StreamError, "func" ),
function( riverDrop, firstErr, cb )
{
	riverDrop.serveErr(
		firstErr,
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( secondErr )
		{
			this.finish( riverDrop, cb );
		})
	);
}],

handleFailure:
[
getA( RiverDrop, "str", "func" ),
function( riverDrop, failureCode, cb )
{
	riverDrop.serveFailure(
		failureCode,
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			this.finish( riverDrop, cb );
		})
	);
}],

flowDropThroughStream:
[
getA( RiverDrop, Stream, "bool/undef", "func" ),
getA( RiverDrop, Stream, "func" ),
function( riverDrop, stream, topStream, cb )
{
	if( hasT( topStream, "func" ) === true )
	{
		cb = topStream;
		topStream = undefined;
	}
	
	if( topStream === undefined )
	{
		topStream = false;
	}
	
	riverDrop.flowToStream( stream );
	
	if( topStream === true )
	{
		this.beginRiverFlow( riverDrop, cb );
	}
	else
	{
		this.begin( riverDrop, cb );
	}
}],

beginRiverFlow:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.beginRiverFlow(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			this.begin( riverDrop, cb );
		})
	);
}],

begin:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.begin(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			this.validate( riverDrop, cb );
		})
	);
}],

validate:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.validate(
		getCb(
		this,
		getA( StreamError, "undef" ),
		getA( "undef", "str/undef" ),
		function( err, failureCode )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			if( failureCode !== undefined )
			{
				this.handleFailure( riverDrop, failureCode, cb );
				
				return;
			}
			
			this.prepare( riverDrop, cb );
		})
	);
}],

prepare:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.prepare(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			this.branch( riverDrop, cb );
		})
	);
}],

branch:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.branch(
		getCb(
		this,
		getA( StreamError, "undef" ),
		getA( "undef", [ Stream, "undef" ] ),
		function( err, nextStream )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			if( nextStream !== undefined )
			{
				this.flowDropThroughStream(
					riverDrop,
					nextStream,
					getCb(
						this,
						function()
						{
							this.finish( riverDrop, cb );
						}
					)
				);
				
				return;
			}
			
			this.serve( riverDrop, cb );
		})
	);
}],

serve:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.serve(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			if( err !== undefined )
			{
				this.handleErr( riverDrop, err, cb );
				
				return;
			}
			
			this.finish( riverDrop, cb );
		})
	);
}],

finish:
[
getA( RiverDrop, "func" ),
function( riverDrop, cb )
{
	riverDrop.finish(
		getCb(
		this,
		getA( [ StreamError, "undef" ] ),
		function( err )
		{
			riverDrop.leaveStream();
			
			cb();
		})
	);
}],

flow:
[
getA( "func/undef" ),
function( cb )
{
	if( this.isRunning === true )
	{
		throw new RiverRuntimeError(
			"The server is already running", "ServerIsAlreadyRunning"
		);
	}
	
	var server = this.server;
	
	if( cb !== undefined )
	{
		var river = this;
		
		server.once(
			"listening",
			getCb(
				this,
				function()
				{
					cb();
				}
			)
		);
	}
	
	server.listen( this.port, "localhost" );
}],

freeze:
[
getA( "func/undef" ),
function( cb )
{
	if( this.isRunning === false )
	{
		throw new RiverRuntimeError(
			"The server isnt running", "ServerIsNotRunning"
		);
	}
	
	var server = this.server;
	
	if( cb !== undefined )
	{
		server.once(
			"close",
			getCb(
				this,
				function()
				{
					cb();
				}
			)
		);
	}
	
	server.close();
}]

});

});
