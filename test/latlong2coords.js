'use strict';

module.exports = (jsonItem) => {
  let item = JSON.parse(jsonItem);
  item.longitude = parseFloat(item.longitude);
  item.latitude = parseFloat(item.latitude);
  item.coordinates = [item.longitude, item.latitude];
  return JSON.stringify(item);
};
