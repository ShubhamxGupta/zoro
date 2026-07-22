; Java Symbol Extraction Queries
; Future phase will implement these using real tree-sitter-java grammar.

(method_declaration
  name: (identifier) @method.name)

(class_declaration
  name: (identifier) @class.name)
