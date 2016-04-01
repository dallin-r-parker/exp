var pm2 = require('pm2');

var config = require('../config');
var log = require('../log');
var pm2serve = require('../pm2serve');

async function action(projectDir, options) {
  if (options.all) {
    log("Stopping all servers...");
    await pm2.promise.connect();
    await pm2.promise.kill();
    log("Stopped.");

    // TODO: figure out why it's not exiting on it's own
    process.exit();
  } else {
    await pm2serve.setupServeAsync(projectDir);

    await pm2.promise.connect();
    try {
      log("Stopping the server...");
      await pm2.promise.stop(await pm2serve.pm2NameAsync());
    } catch (e) {
      log.error("Failed to stop the server\n" + e.message);
    }
    await pm2.promise.disconnect();
    await config.projectExpJsonFile(projectDir).mergeAsync({state: 'STOPPED'});
    log("Stopped.");
  }
}

module.exports = (program) => {
  program
    .command('stop [project-dir]')
    .alias('q')
    .description('Stops the server')
    .option('-a, --all', 'Stop all processes')
    .asyncActionProjectDir(action);
};
