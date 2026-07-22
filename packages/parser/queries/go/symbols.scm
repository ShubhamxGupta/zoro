; Go Symbol Extraction Queries
; Phase 14 will implement these using real tree-sitter-go grammar.

(function_declaration
  name: (identifier) @function.name)

(method_declaration
  name: (field_identifier) @method.name)

(type_declaration
  (type_spec name: (type_identifier) @type.name))
