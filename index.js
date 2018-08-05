const path = require('path');
const fs = require('fs');
const compression = require('compression');
const express = require('express');
const app = express();

const config = require('./utils/config');
const sanitizeObject = require('./utils/sanitize-object');
const { VIEWS_PATH, PUBLIC_PATH, FORCE_WWW, PORT } = config;
const timestamp = Date.now();

const exphbs  = require('express-handlebars');
const hbs = exphbs.create({
  helpers: require('./utils/template-helpers'),
  extname: '.hbs',
  defaultLayout: 'default',
  viewsDir: VIEWS_PATH,
  layoutsDir: path.join(VIEWS_PATH, '_layouts'),
  partialsDir: path.join(VIEWS_PATH, '_partials')
});

app.enable('view cache');
app.engine('hbs', hbs.engine);
app.set('views', VIEWS_PATH);
app.set('view engine', 'hbs');

if(FORCE_WWW){
  app.use(
    // anything that does not start with www or localhost gets redirected to www
    (req, res, next) => /(^www\.)|(^localhost)/.test(req.hostname)
        ? next()
        : res.redirect(
          301,
          `${req.protocol}://www.${req.hostname}${req.originalUrl}`
        )
  );
}

app.use(compression());

app.use(
  express.static( path.join(__dirname, PUBLIC_PATH) )
);

const pages = require('./utils/build-page-tree');
pages.forEach(
  page => {
    app.get(
      `/${page.metadata.route || page.route}`,
      (req, res, next) => res.render(page.template, {
        ...config,
        ...req.params,
        ...sanitizeObject(req.query),
        ...page.metadata,
        pages,
        timestamp
      })
    );
  }
);

app.listen(PORT, err => {
  if(err) throw err;
  console.log(`Server listening on port ${PORT}`);
});
