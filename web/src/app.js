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

function AddCellInfoTable(data) {
  var labels = data['labels'];
  if (labels.length <= 0) {
    return;
  }

  const voteCount = labels[0]['features'].length;

  var table = d3.select('body').append('table');
  table.attr('id', 'cellInfo');

  var tableHead = table .append('thead');
  var tableHeadRow = tableHead.append('tr');
  tableHeadRow.append('th').text('Party');
  tableHeadRow.append('th').text('Senator');
  tableHeadRow.append('th').text('State');
  tableHeadRow.append('th').text('Votes').attr('colspan', voteCount);

  var tableBody = table.append('tbody');

  for (var label of labels) {
    var profile = label['profile'];
    assert(profile);
    var votes = label['features'];
    assert(votes);
    assert(votes.length === voteCount);
    var party = profile['party'];
    var tableBodyRow = tableBody.append('tr');

    if (party === 'Democrat') {
      tableBodyRow.append('td').append('img').attr('src', 'img/democrat.png');
    } else if (party === 'Republican') {
      tableBodyRow.append('td').append('img').attr('src', 'img/republican.png');
    } else if (party == 'Independent') {
      tableBodyRow.append('td').text('N/A');
    } else {
      tableBodyRow.append('td').text('oops');
    }

    var fullName = profile['first_name'] + ' ' + profile['last_name'];
    tableBodyRow.append('td').text(fullName);
    tableBodyRow.append('td').text(profile['state']);

    for (var vote of votes) {
      tableBodyRow.append('td').text(vote);
    }
  }
}

function OnCellClick(data) {
  var cell = d3.select(this.parentNode);
  var previousSelectedCell = d3.select('#selectedCell');
  const isUnselectingCell = (cell.attr('id') === 'selectedCell');

  if (!previousSelectedCell.empty()) {
    UnselectCell(previousSelectedCell);
    RemoveCellInfoTable();
  }

  if (isUnselectingCell) {
    return;
  }

  SelectCell(cell);
  AddCellInfoTable(data);
}

function RenderGraph(entries) {
  var canvasSize = GetCanvasSize();
  var canvas = d3.select('#canvas')
      .attr('width', canvasSize[0])
      .attr('height', canvasSize[1])
    .append('g')
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
      });
  cell.append('polygon')
      .attr('points', FindHexagonVertices)
      .attr('fill', GetDefaultCellBackgroundColor)
      .on('click', OnCellClick);
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
      .attr('alignment-baseline', 'middle')
      .on('click', OnCellClick);
}

function Main() {
  d3.json('sbills-export.json', function(entries) {
    RenderGraph(entries);
  });
}

Main();
