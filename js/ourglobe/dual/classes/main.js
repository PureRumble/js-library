ourglobe.core.define(
[
	"./classruntimeerror",
	"./class"
],
function(
	ClassRuntimeError,
	Class
)
{

ourglobe.Class = Class;

return(
	{
		ClassRuntimeError: ClassRuntimeError,
		Class: Class
	}
);

});
