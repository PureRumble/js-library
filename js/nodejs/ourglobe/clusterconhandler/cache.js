var conf = require("ourglobe").conf;
var sys = require("ourglobe").sys;
var FuncVer = require("ourglobe").FuncVer;

function Cache( cacheObj, link, refreshedDate )
{
	if( conf.doVer() === true )
	{
		new FuncVer( [ "obj", Link, [ Date, "undef" ] ] )
			.verArgs( arguments )
		;
	}
	
	this.cacheObj = cacheObj;
	this.link = link;
	this.refreshedDate =
		refreshedDate !== undefined ?
			refreshedDate :
			new Date()
	;
}

Cache.prototype.getCache = function()
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer( [], Object ).verArgs( arguments );
	}
	
	var returnVar = this.cacheObj;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

Cache.prototype.getLink = function()
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer( [], Link ).verArgs( arguments );
	}
	
	var returnVar = this.link;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

Cache.prototype.getRefreshedDate = function()
{
	if( conf.doVer() === true )
	{
		var fv = new FuncVer( [], Date ).verArgs( arguments );
	}
	
	var returnVar = this.refreshedDate;
	
	if( conf.doVer() === true )
	{
		fv.verReturn( returnVar );
	}
	
	return returnVar;
}

exports.Cache = Cache;

var Link = require("./link").Link;
