og.core.define(
[
	"./ourglobeerror",
	"./runtimeerror",
	"./sys",
	"exports"
],
function(
	OurGlobeErrorM,
	RuntimeErrorM,
	sysM,
	exports
)
{

exports.OurGlobeError = OurGlobeErrorM.OurGlobeError;
exports.RuntimeError = RuntimeErrorM.RuntimeError;
exports.sys = sysM.sys;
exports.getF = sysM.sys.getF;

});
