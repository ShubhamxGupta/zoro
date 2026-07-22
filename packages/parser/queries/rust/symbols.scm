; Rust Symbol Extraction Queries
; Future phase will implement these using real tree-sitter-rust grammar.

(function_item
  name: (identifier) @function.name)

(struct_item
  name: (type_identifier) @struct.name)

(impl_item
  trait: (type_identifier)? @impl.trait)
