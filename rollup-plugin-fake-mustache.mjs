import { createFilter } from 'rollup-pluginutils';

export default function (options = {}) {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'mustache',
    transform (template, id) {
      if (!filter(id)) {
        return null;
      }

      const code = `export default {
        render: function (data) {
          return \`${template.replace(/`/g, '\\`')}\`.replace(/{{\\s*([^}]+)\\s*}}/g, function(_, variableName) {
            return data[variableName.trim()];
          });
        }
      }`;
      return { code, map: { mappings: '' } };
    }
  };
}
