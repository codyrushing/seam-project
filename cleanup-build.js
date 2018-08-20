const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { css, js, images } = require('./build-config.json');

module.exports = function(){
  rimraf.sync(
    path.join(__dirname, 'public')
  );

  css.concat(js).concat([images])
    .forEach(
      item => {
        let directory = __dirname;
        path.dirname(item.dest)
          .split('/')
          .forEach(
            dir => {
              directory = path.join(directory, dir);
              if(!fs.existsSync(directory)){
                fs.mkdirSync(directory);
              }
            }
          );
      }
    );
}
