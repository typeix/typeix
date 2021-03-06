const fs = require("fs");
// create reports
const packages = fs.readdirSync("./packages")
  .filter(item => item !== "tsconfig.base.json")
  .map(name => "./packages/" + name + "/coverage/lcov.info");

exports.module = Promise.all(
  packages.map(file => {
    return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })
  })
).then(data =>
  new Promise(
    resolve =>
      fs.writeFile("./lcov.info", Buffer.concat(data), resolve))
)
;
