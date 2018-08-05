const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({
  handlebars: handlebars
});

module.exports = {
  ...helpers,
  getPageUrl: (page={}) => `/${
      page.metadata.route
        ? page.metadata.route.replace(/\*/g, '')
        : page.route
    }`
  // add more helpers here if needed
}
