'use strict';

var assert = require('assert');
var d3 = require('d3');

var SQRT3 = 1.732051;

function FindHexagonVertices() {
  return [
    [0, 1],
    [SQRT3/2, 1/2],
    [SQRT3/2, -1/2],
    [0, -1],
    [-SQRT3/2, -1/2],
    [-SQRT3/2, 1/2],
  ];
}

function GetDefaultCellBackgroundColor(d) {
  const value = d.umatrix_value * 255;
  return d3.rgb(value, value, value);
}

function GetSelectedCellBackgroundColor() {
  return d3.rgb(66, 98, 244)
}

function GetDefaultCellTextColor() {
  return d3.rgb(150, 150, 150);
}

function GetSelectedCellTextColor() {
  return d3.rgb(255, 255, 255);
}

function GetCanvasSize() {
  var w = window,
  d = document,
  e = d.documentElement,
  g = d.getElementsByTagName('body')[0],
  x = w.innerWidth || e.clientWidth || g.clientWidth,
  y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return [x, y];
}

function UnselectCell(cell) {
  cell.attr('id', null);
  cell.select('polygon')
    .attr('fill', GetDefaultCellBackgroundColor);
  cell.select('text')
    .attr('fill', GetDefaultCellTextColor);
}

function SelectCell(cell) {
  cell.attr('id', 'selectedCell');
  cell.select('polygon')
    .attr('fill', GetSelectedCellBackgroundColor);
  cell.select('text')
    .attr('fill', GetSelectedCellTextColor);
}

function RemoveCellInfoTable() {
  d3.select('#cellInfo').remove();
}

function UpdateCellInfo(data) {
  var labels = data.labels;
  var cellInfo = d3.select('#cellInfo');

  var rows = cellInfo.selectAll('g.row').data(labels);
  var newRows = rows.enter().append('g').attr('class', 'row');
  newRows.append('text');
  newRows.append('g')
    .attr('class', 'voteBar')
    .attr('transform', 'translate(100, 0)');
  rows.exit().remove();

  var LINE_HEIGHT = 18;

  rows.merge(newRows)
    .attr('transform', function(d, i) {
      return 'translate(0,' + i * LINE_HEIGHT + ')';
    })
    .each(function(d, i) {
      d3.select(this).select('text')
        .text(function(d) {
          return d.profile.last_name;
        })
        .attr('font-size', LINE_HEIGHT - 4)
        .attr('alignment-baseline', 'before-edge');
      var voteRect = d3.select(this).select('.voteBar')
        .selectAll('rect')
        .data(d.features);
      var newVoteRect = voteRect.enter().append('rect')
        .attr('width', 10)
        .attr('height', 10);
      var barY = i * (LINE_HEIGHT - 4)
      voteRect.exit().remove();
      voteRect.merge(newVoteRect)
        .attr('x', function(d, i) { return i * 10; })
        .attr('y', 2)
        .attr('height', LINE_HEIGHT - 2 * 2)
        .attr('fill', function(d) {
          if (d == 1) {
            return 'green';
          } else if (d == -1) {
            return 'red';
          } else {
            return 'gray';
          }
        });
    });
}

function OnCellClick(data) {
  var cell = d3.select(this.parentNode);
  var previousSelectedCell = d3.select('#selectedCell');
  const isUnselectingCell = (cell.attr('id') === 'selectedCell');

  if (!previousSelectedCell.empty()) {
    UnselectCell(previousSelectedCell);
    //RemoveCellInfoTable();
  }

  if (isUnselectingCell) {
    return;
  }

  SelectCell(cell);
  UpdateCellInfo(data);
}

function RenderGraph(entries) {
  var canvasSize = GetCanvasSize();
  var rawCanvas = d3.select('#canvas')
      .attr('width', canvasSize[0])
      .attr('height', canvasSize[1]);
  var canvas = rawCanvas.append('g')
      .attr(
        'transform',
        'translate(' + [canvasSize[0]/2, canvasSize[1]/2] + ')'
      )
    .append('g')
      .attr('transform', 'scale(12,-12)');

  var cell = canvas.selectAll('g')
      .data(entries)
    .enter().append('g')
      .attr('transform', function(entry) {
        return 'translate(' + entry.centroid + ')';
      })
    .on('mouseenter', function(d) {
      var polygon = d3.select(this).select('polygon');
      polygon.attr('mouseenter_fill', polygon.attr('fill'));
      polygon.attr('fill', '#ff7');
      UpdateCellInfo(d);
    })
    .on('mouseleave', function(d) {
      var polygon = d3.select(this).select('polygon');
      polygon.attr('fill', polygon.attr('mouseenter_fill'));
    });
  cell.append('polygon')
      .attr('points', FindHexagonVertices)
      .attr('fill', GetDefaultCellBackgroundColor)
      .on('click', UpdateCellInfo);
  cell.append('text')
      .text(function(entry) {
        switch (entry.labels.length) {
          case 0: return null;
          case 1: return '•';
        }
        return entry.labels.length;
      })
      .attr('fill', GetDefaultCellTextColor)
      .attr('font-size', 1)
      .attr('transform', 'scale(1,-1)')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle');

  var cellInfo = rawCanvas.append('g')
      .attr('id', 'cellInfo');
}

function Main() {
  d3.json('sbills-export.json', function(entries) {
    RenderGraph(entries);
  });
}

Main();
