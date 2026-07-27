; Go Symbol Extraction S-Expression Queries
(function_declaration name: (identifier) @function.name) @function.def
(method_declaration name: (field_identifier) @method.name) @method.def
(type_declaration (type_spec name: (type_identifier) @type.name)) @type.def
(import_declaration) @import.statement
(comment) @comment.node
