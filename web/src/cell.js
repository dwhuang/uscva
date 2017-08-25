var d3 = require('d3');

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
      case 1: return '•';
      default: return this.rawData.labels.length;
    }
  }

  DefaultBackgroundColor() {
    const value = this.rawData.umatrix_value * 255;
    return d3.rgb(value, value, value);
  }
}

module.exports = Cell;
