; TypeScript / JavaScript Symbol Extraction Queries
; Phase 12 will implement these using real Tree-Sitter grammar bindings.
;
; Expected captures:
;   @function.name   — top-level function declarations
;   @class.name      — class declarations
;   @method.name     — method definitions
;   @interface.name  — interface declarations (TypeScript only)
;   @import.source   — import statement specifiers
;   @export.name     — exported symbol names

; Function declarations
(function_declaration
  name: (identifier) @function.name)

; Arrow function assigned to variable
(lexical_declaration
  (variable_declarator
    name: (identifier) @function.name
    value: (arrow_function)))

; Class declarations
(class_declaration
  name: (type_identifier) @class.name)

; Method definitions
(method_definition
  name: (property_identifier) @method.name)
