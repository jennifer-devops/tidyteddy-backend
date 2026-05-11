const moment = require("moment-timezone");

const convertToDate = (date, timeZone = "Australia/Sydney") => {
  return moment(date).tz(timeZone).format("YYYY-MM-DD");
};
const convertToTimestamp = (date, timeZone = "Australia/Sydney") => {
  return moment(date).tz(timeZone);
};
module.exports = { convertToDate, convertToTimestamp };
