const { exec } = require('child_process');
const path = require('path');
const { css, js, images } = require('./build-config.json');
const handler = (err, stdout, stderr) => {
  console.log(this);
  console.log(stdout);
  console.error(stderr);
}

require('./cleanup-build')();

const devProcesses = [
  'nodemon --ignore src/js --ignore public --ext js,hbs .',
  // compile css initially
  ...css.map(
    item => `lessc ${item.src} ${item.dest}`
  ),
  // watch for changes
  ...css.map(
    item => `less-watch-compiler ${path.dirname(item.src)} ${path.dirname(item.dest)} ${path.basename(item.src)}`
  ),
  // compile js and watch for changes
  ...js.map(
    item => `watchify ${item.src} -t babelify -o ${item.dest} --debug --verbose`
  ),
  'node ./utils/compress-images.js',
  `npm run custom`
]
.map(
  command => {
    // TODO, hacky, but gives us access to locally installed binaries
    const devProcess = exec(`PATH=$PATH:./node_modules/.bin ${command}`);
    devProcess.stdout.pipe(process.stdout);
    devProcess.stderr.pipe(process.stderr);
    return devProcess;
  }
);

// imagemin doesn't have a CLI

const onExit = (options, err) => {
  devProcesses.forEach(
    devProcess => devProcess.kill()
  );
};

//do something when app is closing
process.on('exit', onExit);

//catches ctrl+c event
process.on('SIGINT', onExit);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', onExit);
process.on('SIGUSR2', onExit);

//catches uncaught exceptions
process.on('uncaughtException', onExit);
