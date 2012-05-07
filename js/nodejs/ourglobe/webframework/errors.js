var RuntimeError = require("ourglobe").RuntimeError;

var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

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

var DataHandler = require("./datahandler").DataHandler;
