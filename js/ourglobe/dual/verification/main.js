og.define(
[
	"./schemaerror",
	"./funcvererror",
	"./assert",
	"./schema",
	"./funcver",
	"exports"
],
function(
	SchemaErrorM,
	FuncVerErrorM,
	assertM,
	SchemaM,
	FuncVerM,
	exports
)
{

exports.SchemaError = SchemaErrorM.SchemaError;
exports.FuncVerError = FuncVerErrorM.FuncVerError;

exports.assert = assertM.assert;
exports.Schema = SchemaM.Schema;
exports.FuncVer = FuncVerM.FuncVer;

});
