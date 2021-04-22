const fs = require("fs");
// create reports
const packages = ["di", "logger", "metadata", "modules", "resty", "router", "utils"]
  .map(name => "./packages/" + name + "/coverage/lcov.info")
  .map(file => {
    return new Promise((resolve, reject) => {
      fs.readFile(file,  (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })
  });


exports.module = Promise.all(packages).then(data =>
  new Promise(
    resolve =>
      fs.writeFile("./lcov.info", Buffer.concat(data), resolve))
)
;
