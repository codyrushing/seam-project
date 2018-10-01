const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { VIEWS_PATH } = require('./config');
const matter = require('gray-matter');
const { getPageUrl } = require('./template-helpers');

const pages = [];

const hbsRegex = /.hbs$/;

const root = path.join(__dirname, '../');

const hasPageIndex = p => p.metadata && p.metadata.hasOwnProperty('pageIndex');
const getPage = item => item.subpages && item.subpages.length
  ? item.subpages[0]
  : item;
const sortByPageIndex = (a, b) => {
  if(a.name === 'index'){
    return -1;
  }
  if(b.name === 'index'){
    return 1;
  }
  a = getPage(a);
  b = getPage(b);
  if(hasPageIndex(a) && hasPageIndex(b)){
    return (a.metadata.pageIndex || 0) - (b.metadata.pageIndex || 0)
  }
  return a.name < b.name
    ? 1
    : -1;
};

const getRouteFromTemplatePath = template => template
  .replace(hbsRegex, '') // remove extension
  .replace(/index$/, '') // remove index
  .replace(/\/$/, ''); // remove trailing slash

const traverse = (dir, base=root) => {
  const fullDirectoryPath = path.join(base, dir);
  fs.readdirSync(fullDirectoryPath).forEach(
    page => {
      if(page.charAt(0) === '_'){
        return;
      }
      const fullPagePath = path.join(fullDirectoryPath, page);
      const stats = fs.statSync( fullPagePath );
      if(stats.isDirectory()){
        return traverse(page, fullDirectoryPath, );
      }
      if(stats.isFile() && hbsRegex.test(page)){
        let template = path.relative(
          path.join(root, VIEWS_PATH),
          fullPagePath
        );
        let route = getRouteFromTemplatePath(template);
        const p = {
          template,
          route,
          metadata: matter.read(fullPagePath, {delims: ['{{!--', '--}}']}).data
        };
        p.link = getPageUrl(p);
        pages.push(p);
      }
    }
  );
};

traverse(VIEWS_PATH);

const getSectionForPage = (p, depth=0) => p.template.split('/')[depth].replace(hbsRegex, '');

const nestPages = (pages, depth=0) => {
  return pages
  .reduce(
    (acc, v) => {
      const matchingGroup = acc.find(
        sublist => getSectionForPage(sublist[0], depth) === getSectionForPage(v, depth)
      );
      if(matchingGroup){
        matchingGroup.push(v);
      }
      else {
        acc.push([v]);
      }
      return acc;
    },
    []
  )
  .map(
    l => {
      if(l.length > 1){
        let subpages = nestPages(l, depth+1);
        return {
          ..._.omit(subpages[0], 'subpages'),
          type: 'section',
          name: getSectionForPage(l[0], depth),
          subpages,
        };
      }
      return {
        type: 'page',
        name: getSectionForPage(l[0], depth),
        ...l[0]
      };
    }
  )
  .sort(sortByPageIndex);

}

const pagesNested = nestPages(pages, 0);

module.exports = {
  pages: pages.sort(sortByPageIndex),
  pagesNested
}
