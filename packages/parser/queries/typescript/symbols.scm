; TypeScript / JavaScript Symbol Extraction Queries
; Comprehensive S-expression patterns for Tree-Sitter parsing

; --- Function Declarations ---
(function_declaration
  name: (identifier) @function.name) @function.def

(generator_function_declaration
  name: (identifier) @function.name) @function.def

; --- Arrow Functions & Function Expressions assigned to variables ---
(lexical_declaration
  (variable_declarator
    name: (identifier) @function.name
    value: (arrow_function))) @function.def

(lexical_declaration
  (variable_declarator
    name: (identifier) @function.name
    value: (function_expression))) @function.def

(variable_declaration
  (variable_declarator
    name: (identifier) @function.name
    value: (arrow_function))) @function.def

; --- Class Declarations ---
(class_declaration
  name: (type_identifier) @class.name) @class.def

(abstract_class_declaration
  name: (type_identifier) @class.name) @class.def

; --- Method Definitions ---
(method_definition
  name: (property_identifier) @method.name) @method.def

(abstract_method_signature
  name: (property_identifier) @method.name) @method.def

; --- Interfaces ---
(interface_declaration
  name: (type_identifier) @interface.name) @interface.def

; --- Type Aliases ---
(type_alias_declaration
  name: (type_identifier) @type_alias.name) @type_alias.def

; --- Enums ---
(enum_declaration
  name: (identifier) @enum.name) @enum.def

; --- Imports & Exports ---
(import_statement) @import.statement
(export_statement) @export.statement
(comment) @comment.node
