ourglobe.core.define(
[
	"./core",
	"ourglobe/dual/classes",
	"ourglobe/dual/modulehandling",
],
function(
	core,
	Classes,
	ModuleHandling
)
{

return(
	{
		OurGlobeError: core.OurGlobeError,
		RuntimeError: core.RuntimeError,
		SchemaError: core.SchemaError,
		FuncVerError: core.FuncVerError,
		FuncCreationRuntimeError: core.FuncCreationRuntimeError,
		conf: core.conf,
		sys: core.sys,
		getF: core.getF,
		getV: core.getV,
		assert: core.assert,
		FuncVer: core.FuncVer,
		Schema: core.Schema,
		FuncParamVer: core.FuncParamVer,
		ArgsVer: core.ArgsVer,
		ExtraArgsVer: core.ExtraArgsVer,
		ReturnVarVer: core.ReturnVarVer,
		getA: core.getA,
		getE: core.getE,
		getR: core.getR
	}
);

});
