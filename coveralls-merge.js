const coveralls = require('@sourceallies/coveralls-merge');
// create reports
const packages = ["di", "logger", "metadata", "modules", "resty", "router", "utils"];
coveralls.sendReports(
  packages.map(name => {
    return {
      type: "lcov",
      reportFile: "./packages/" + name + "/coverage/lcov.info"
    }
  })
);
