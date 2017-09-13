'use strict';

var d3 = require('d3');

var featuresIds = [];

function Get(index) {
  if (index >= featuresIds.length) {
    return 'Unknown';
  }
  var i = 0;
  for (var bill_id in featuresIds) {
    if (i == index) {
      return [bill_id, featuresIds[bill_id]]
    }
    ++i;
  }
  return ['Unknown', null];
}

function LoadFeatureIds(featureIdsFilePath, doneCallback) {
  d3.json(featureIdsFilePath, data => {
    featuresIds = data;
    doneCallback();
  });
}

module.exports = {
  Get: Get,
  Load: LoadFeatureIds
};
