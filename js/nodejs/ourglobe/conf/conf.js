var conf = {};

var _doVer = true;

/*
This func may not depend on any other functions
*/
conf.doVer = function()
{
	return _doVer;
}

conf.turnOffVer = function()
{
	_doVer = false;
}

conf.turnOnVer = function()
{
	_doVer = true;
}

exports.conf = conf;
