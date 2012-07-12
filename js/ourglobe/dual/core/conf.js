og.core.define(
function( exports )
{

var conf = {};

conf._doVer = true;

conf.doVer = function()
{
	return conf._doVer;
}

conf.turnOffVer = function()
{
	conf._doVer = false;
}

conf.turnOnVer = function()
{
	conf._doVer = true;
}

return conf;

});
