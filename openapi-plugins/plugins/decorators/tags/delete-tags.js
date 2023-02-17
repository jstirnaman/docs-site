module.exports = DeleteTags;

/**
 * Returns an object that defines handler functions for:
 * - DefinitionRoot (the root openapi) node
 * The DefinitionRoot handler, executed when
 * the parser is leaving the root node,
 * sets the root `tags` list to the provided `data`.
 */
/** @type {import('@redocly/openapi-cli').OasDecorator} */
function DeleteTags() {
  return {
    DefinitionRoot: {
      /** Set tags from custom tags when visitor enters root. */
      enter(root) {
          root.tags = [];
      },
      Operation: {
        enter(op) {
          op.tags = [];
        }
      }
    }
  }
};
