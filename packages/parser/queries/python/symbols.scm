; Python Symbol Extraction Queries
; Phase 13 will implement these using real tree-sitter-python grammar.
;
; Expected captures:
;   @function.name   — top-level function definitions
;   @class.name      — class definitions
;   @import.source   — import statement targets

(function_definition
  name: (identifier) @function.name)

(class_definition
  name: (identifier) @class.name)

(import_statement
  name: (dotted_name) @import.source)
