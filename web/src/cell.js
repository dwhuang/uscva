var d3 = require('d3');

const SQRT3 = 1.732051;

class Cell {
  // Static methods to use with d3 and make the call site a little bit cleaner.
  static Text(cell) { return cell.Text(); }
  static DefaultTextColor() { return d3.rgb(150, 150, 150); }
  static SelectedTextColor() { return d3.rgb(255, 255, 255); }
  static DefaultBackgroundColor(cell) { return cell.DefaultBackgroundColor(); }
  static SelectedBackgroundColor() { return d3.rgb(66, 98, 244); }

  constructor(rawData) {
    this.rawData = rawData;
  }

  Text() { 
    switch (this.rawData.labels.length) {
      case 0: return null;
      case 1: return null;
      default: return this.rawData.labels.length;
    }
  }

  DefaultBackgroundColor() {
    const value = this.rawData.umatrix_value * 255;
    return d3.rgb(value, value, value);
  }

  // TODO(owenchu): Refactor this mess.
  PolygonGroup() {
    const labels = this.rawData.labels;
    const numDemocrats = labels.filter(function(label) {
      return label.profile.party === 'Democrat';
    }).length;
    const numRepublicans = labels.filter(function(label) {
      return label.profile.party === 'Republican';
    }).length;
    const numOtherSenators = labels.length - numDemocrats - numRepublicans;

    const entries = [];
    if (numDemocrats > 0) {
      entries.push({
        count: numDemocrats,
        party: 'Democrat',
        fillColor: d3.rgb(0, 176, 237)
      });
    }
    if (numRepublicans > 0) {
      entries.push({
        count: numRepublicans,
        party: 'Republican',
        fillColor: d3.rgb(237, 19, 42)
      });
    }
    if (numOtherSenators > 0) {
      entries.push({
        count: numOtherSenators,
        party: 'Other',
        fillColor: d3.rgb(51, 153, 102)
      });
    }
    entries.sort(function(a, b) {
      if (a.count > b.count) return -1;
      if (a.count < b.count) return 1;
      // TODO(owenchu): Order by party so it's consistent across cells.
      return 0;
    });

    if (entries.length === 0) {
      return [
        {
          points: [[0, 1], [SQRT3/2, 1/2], [SQRT3/2, -1/2], [0, -1],
                   [-SQRT3/2, -1/2], [-SQRT3/2, 1/2]],
          fillColor: d3.rgb(210, 210, 210)
        }
      ];
    } else if (entries.length === 1) {
      return [
        {
          points: [[0, 1], [SQRT3/2, 1/2], [SQRT3/2, -1/2], [0, -1],
                   [-SQRT3/2, -1/2], [-SQRT3/2, 1/2]],
          fillColor: entries[0].fillColor
        }
      ];
    } else if (entries.length === 2) {
      if (entries[0].count > entries[1].count) {
        return [
          {
            points: [[0, 1], [SQRT3/2, 1/2], [SQRT3/2, -1/2], [-SQRT3/2, -1/2],
                     [-SQRT3/2, 1/2]],
            fillColor: entries[0].fillColor
          },
          {
            points: [[-SQRT3/2, -1/2], [SQRT3/2, -1/2], [0, -1]],
            fillColor: entries[1].fillColor
          }
        ];
      } else {
        return [
          {
            points: [[0, 1], [SQRT3/2, 1/2], [SQRT3/2, 0], [-SQRT3/2, 0],
                     [-SQRT3/2, 1/2]],
            fillColor: entries[0].fillColor
          },
          {
            points: [[-SQRT3/2, 0], [SQRT3/2, 0], [SQRT3/2, -1/2],
                     [0, -1], [-SQRT3/2, -1/2]],
            fillColor: entries[1].fillColor
          }
        ];
      }
    } else {
      if (entries[0].count === entries[1].count &&
          entries[1].count === entries[2].count) {
        return [
          {
            points: [[0, 1], [SQRT3/2, 1/2], [SQRT3/2, 1/4], [-SQRT3/2, 1/4],
                     [-SQRT3/2, 1/2]],
            fillColor: entries[0].fillColor
          },
          {
            points: [[-SQRT3/2, 1/4], [SQRT3/2, 1/4], [SQRT3/2, -1/4],
                     [-SQRT3/2, -1/4]],
            fillColor: entries[1].fillColor
          },
          {
            points: [[-SQRT3/2, -1/4], [SQRT3/2, -1/4], [SQRT3/2, -1/2], [0, -1],
                     [-SQRT3/2, -1/2]],
            fillColor: entries[2].fillColor
          }
        ];
      } else {
        return [
          {
            points: [[0, 1], [SQRT3/2, 1/2], [SQRT3/2, 0], [-SQRT3/2, 0],
                     [-SQRT3/2, 1/2]],
            fillColor: entries[0].fillColor
          },
          {
            points: [[-SQRT3/2, 0], [SQRT3/2, 0], [SQRT3/2, -1/2],
                     [-SQRT3/2, -1/2]],
            fillColor: entries[1].fillColor
          },
          {
            points: [[-SQRT3/2, -1/2], [SQRT3/2, -1/2], [0, -1]],
            fillColor: entries[2].fillColor
          }
        ];
      }
    }
  }
}

module.exports = Cell;
