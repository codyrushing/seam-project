const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({
  handlebars: handlebars
});

module.exports = {
  ...helpers,
  inlineFile: file => fs.readFileSync(path.join(__dirname, '..', file), 'utf-8'),
  getPageUrl: (page={}) => `/${
      page.metadata.route
        ? page.metadata.route.replace(/\*/g, '')
        : page.route
    }`
  // add more helpers here if needed
}
