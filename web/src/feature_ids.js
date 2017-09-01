'use strict';

// TODO(dwhuang): Export multiple feature ID files or maybe just output IDs in
// the model files if possible.

var d3 = require('d3');

var featuresIds = [];

function Get(index) {
  if (index >= featuresIds.length) {
    return 'Unknown';
  }
  return featuresIds[index];
}

function LoadFeatureIds(featureIdsFilePath, doneCallback) {
  d3.json(featureIdsFilePath, function(data) {
    featuresIds = data;
    doneCallback();
  });
}

module.exports = {
  Get: Get,
  Load: LoadFeatureIds
};
