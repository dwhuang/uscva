// Parse vote data and output voting records per legislator in the following
// format:
//
//   { 'B000574':
//      { 'Not Voting':
//         [ 'h1-113.2013',
//           'h2-113.2013',
//           ... ],
//        'Aye':
//         [ 'h10-113.2013',
//           'h103-113.2013',
//           ... ]
//        ... },
//     'L000287':
//      { 'Not Voting':
//         [ 'h1-113.2013',
//           'h2-113.2013',
//           ... ],
//        'Aye':
//         [ 'h100-113.2013',
//           'h103-113.2013',
//           ... ],
//        ... },
//     ... }
//
// Input JSON format: https://github.com/unitedstates/congress/wiki/votes

'use strict';

const fs = require('fs');
const glob = require('glob');
const util = require('util');

const main = function() {
  const args = process.argv.slice(2);
  if (args.length != 1) {
    console.log('[Error] Missing input directory path');
    return 1;
  }

  const inputDir = args[0];
  const files = glob.sync(inputDir + '/**/*.json');
  const votingRecords = new VotingRecordExtractor().extract(files);

  console.log(
      util.inspect(votingRecords, {'depth': null, 'maxArrayLength': null}));

  return 0;
};

class VotingRecordExtractor {
  extract(files) {
    this._votingRecords = {};
    for (const file of files) {
      this._addVotingRecordsFromFile(file);
    }
    return this._votingRecords;
  }

  _addVotingRecordsFromFile(file) {
    const fileContent = JSON.parse(fs.readFileSync(file, 'utf8'));
    const voteId = fileContent['vote_id'];
    const votes = fileContent['votes'];

    for (const votingDecision in votes) {
      const votingGroup = votes[votingDecision];
      const normalizedVotingDecision =
          this._normalizeVotingDecision(votingDecision);
      this._addVotingRecordsFromVotingGroup(
          votingGroup, normalizedVotingDecision, voteId);
    }
  }

  _addVotingRecordsFromVotingGroup(votingGroup, votingDecision, voteId) {
    for (const legislator of votingGroup) {
      this._addVotingRecord(legislator['id'], votingDecision, voteId);
    }
  }

  _addVotingRecord(legislatorId, votingDecision, voteId) {
    if (!this._votingRecords[legislatorId]) {
      this._votingRecords[legislatorId] = {};
    }
    if (!this._votingRecords[legislatorId][votingDecision]) {
      this._votingRecords[legislatorId][votingDecision] = [];
    }
    this._votingRecords[legislatorId][votingDecision].push(voteId);
  }

  _normalizeVotingDecision(votingDecision) {
    if (votingDecision === 'Yea') {
      return 'Aye';
    } else if (votingDecision === 'No') {
      return 'Nay';
    } else {
      return votingDecision;
    }
  }
}

if (require.main === module) {
  process.exit(main());
}
