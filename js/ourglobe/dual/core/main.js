ourglobe.core.define(
[
	"./core",
	"ourglobe/dual/modulehandling"
],
function(
	core,
	ModuleHandling
)
{

return(
	{
		OurGlobeError: core.OurGlobeError,
		RuntimeError: core.RuntimeError,
		SchemaError: core.SchemaError,
		FuncVerError: core.FuncVerError,
		conf: core.conf,
		sys: core.sys,
		getF: core.getF,
		getV: core.getV,
		assert: core.assert,
		OurGlobeObject: core.OurGlobeObject,
		FuncVer: core.FuncVer,
		Schema: core.Schema
	}
);

});
