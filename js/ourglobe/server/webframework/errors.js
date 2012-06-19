var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

function ServerRuntimeError( msg, opts )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			RuntimeError.ERROR_MSG_S, RuntimeError.OPTS_S
		] )
			.verArgs( arguments )
		;
	}
	
	ServerRuntimeError.super_.call( this, msg, opts );
}
sys.inherits( ServerRuntimeError, RuntimeError );

function DataHandlerRuntimeError( msg, dataHandler, caller )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [
			FuncVer.PROPER_STR, DataHandler, "func/undef"
		] )
			.verArgs( arguments )
		;
	}
	
	DataHandlerRuntimeError.super_.call( this, msg, caller );
	
	this.dataHandler = dataHandler;
}
sys.inherits( DataHandlerRuntimeError, RuntimeError );

exports.DataHandlerRuntimeError = DataHandlerRuntimeError;
exports.ServerRuntimeError = ServerRuntimeError;

var DataHandler = require("./datahandler").DataHandler;
