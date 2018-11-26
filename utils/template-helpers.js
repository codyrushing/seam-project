const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({
  handlebars: handlebars
});

const urlsMatch = (page, currentUrl) => page.link === currentUrl || (page.redirect && page.redirect === currentUrl);

module.exports = {
  ...helpers,
  inlineFile: file => fs.readFileSync(path.join(__dirname, '..', file), 'utf-8'),
  getPageUrl: (page={}) => `/${
      page.metadata && page.metadata.route
        ? page.metadata.route.replace(/\*/g, '')
        : page.route
    }`,
  isActive: function(page, currentUrl, options) {
    if(
      urlsMatch(page, currentUrl)
        ||
        (page.subpages && !!page.subpages.find(sp => urlsMatch(sp, currentUrl)))
    ) {
      return options.fn(this);
    }
    return null;
  },
  getSectionPages: function(sectionPages, sections, options){
    sections = sections.split('/');
    const findBySection = (pages, section) => pages.find(page => page.name === section);

    for(var i=0; i<sections.length; i++){
      let section = sections[i];
      let matchingPages = findBySection(sectionPages, section);
      if(!matchingPages){
        break;
      }
      sectionPages = matchingPages.subpages || [];
    }
    return options.fn(sectionPages);
  },
  setVariable: function(varName, varValue, options){
    options.data.root[varName] = varValue;
  },
  // add more helpers here if needed
}
