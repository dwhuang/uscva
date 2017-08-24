'use strict';

var assert = require('assert');
var d3 = require('d3');

var SQRT3 = 1.732051;

function GetPartyAbbrev(partyName) {
  switch (partyName) {
    case 'Adams': return 'Adams';
    case 'Adams-Clay Federalist': return 'Adams-Clay F';
    case 'Adams-Clay Republican': return 'Adams-Clay R';
    case 'Anti-Jackson': return 'AJ';
    case 'American': return 'Am';
    case 'Anti-Administration': return 'Anti-Admin';
    case 'Conservative': return 'C';
    case 'Crawford Republican': return 'CRR';
    case 'Democrat': return 'D';
    case 'Democratic Republican (Jeffersonian)': return 'DR';
    case 'Federalist': return 'F';
    case 'Farmer-Labor': return 'FL';
    case 'Free Soiler': return 'FS';
    case 'Independent': return 'I';
    case 'Independent Democrat': return 'ID';
    case 'Independent Republican': return 'IR';
    case 'Jacksonian': return 'J';
    case 'Jackson Republican': return 'JR';
    case 'Liberal Republican': return 'LR';
    case 'Nullifier': return 'N';
    case 'National Republican': return 'NR';
    case 'Opposition': return 'OP';
    case 'Populist': return 'PO';
    case 'Pro-Administration': return 'Pro-Admin';
    case 'Progressive': return 'PR';
    case 'Republican': return 'R';
    case 'Readjuster': return 'RA';
    case 'Silver Republican': return 'SR';
    case 'Silver': return 'S';
    case 'Unionist': return 'U';
    case 'Unconditional Unionist': return 'UU';
    case 'Whig': return 'W';
  }
  return null;
}

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

function UnselectCell(d) {
  var cell = d3.select(this);
  var polygon = cell.select('polygon');
  polygon
    .attr('fill', polygon.attr('_fill'))
    .attr('_fill', null);
  var text = cell.select('text');
  text
    .attr('fill', text.attr('_fill'))
    .attr('_fill', null);
}

function SelectCell(d) {
  var cell = d3.select(this).style('cursor', 'default');
  var polygon = cell.select('polygon');
  polygon
    .attr('_fill', polygon.attr('fill'))
    .attr('fill', GetSelectedCellBackgroundColor);
  var text = cell.select('text');
  text
    .attr('_fill', text.attr('fill'))
    .attr('fill', GetSelectedCellTextColor);
  UpdateCellInfo(d);
}

function UpdateCellInfo(data) {
  var labels = data.labels;
  var cellInfo = d3.select('#cellInfo');

  var LINE_HEIGHT = 18;
  var VOTE_RECT_WIDTH = 10;
  var VOTE_RECT_VMARGIN = 2;

  var rows = cellInfo.selectAll('g.row').data(labels);
  rows.exit().remove();
  rows = rows.enter()
    .append('g')
      .attr('class', 'row')
      .each(function() {
        var numFeatures = data.weights.length;
        var row = d3.select(this);
        row.append('a')
          .append('text')
            .attr('x', VOTE_RECT_WIDTH * numFeatures + 10);
        for (var i = 0; i < numFeatures; ++i) {
          row.append('rect')
              .attr('width', VOTE_RECT_WIDTH)
              .attr('height', LINE_HEIGHT - VOTE_RECT_VMARGIN * 2)
              .attr('x', i * VOTE_RECT_WIDTH)
              .attr('y', VOTE_RECT_VMARGIN);
        }
      })
    .merge(rows);

  rows
      .attr('transform', function(d, i) {
        return 'translate(0,' + i * LINE_HEIGHT + ')';
      })
      .each(function(d, i) {
        d3.select(this).select('a')
          .attr('href', d.profile.url)
          .attr('xlink:href', d.profile.url) // backward compatibility
          .attr('target', '_blank')
          .attr('fill', 'blue');
        d3.select(this).select('text')
            .text(function(d) {
              return d.profile.last_name 
                + ', ' + d.profile.first_name
                + ' (' + GetPartyAbbrev(d.profile.party) + '-' + d.profile.state + ')';
            })
            .attr('font-size', LINE_HEIGHT - VOTE_RECT_VMARGIN)
            .attr('alignment-baseline', 'before-edge')
            .attr('font-family', 'Arial, Helvetica');
        d3.select(this).selectAll('rect')
            .data(d.features)
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

function RenderGraph(fpath) {
  d3.json(fpath, function(entries) {
    var canvas = d3.select('#transformedCanvas');
    var cells = canvas.selectAll('g.cell').data(entries);
    cells.exit().remove();
    var newCells = cells
      .enter().append('g')
        .attr('class', 'cell')
        .on('mouseenter', SelectCell)
        .on('mouseleave', UnselectCell)
        .each(function() {
          d3.select(this).append('polygon');
          d3.select(this).append('text');
        })
      .merge(cells)
        .attr('transform', function(d) {
          return 'translate(' + d.centroid + ')';
        })
        .each(function(d) {
          d3.select(this).select('polygon')
              .attr('points', FindHexagonVertices)
              .attr('fill', GetDefaultCellBackgroundColor);
          d3.select(this).select('text')
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
        });
  });
}

function Main() {
  // init model list
  var modelList = d3.select('#modelList');
  modelList.selectAll('option')
      .data(models)
    .enter().append('option')
      .attr('value', function(d) { return d.path; })
      .text(function(d) { return d.name; });
  modelList.on('change', function() {
    RenderGraph(this.value);
  });

  // init canvas
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
      .attr('transform', 'scale(12,-12)')
      .attr('id', 'transformedCanvas');
  var cellInfo = rawCanvas.append('g')
      .attr('id', 'cellInfo');

  RenderGraph(models[0].path);
}

var models = [
  {
    'path': 'out_pub/s_bills_109_115-export.json',
    'name': "Congress 109-115 senator bill votes about 'Taiwan' and 'China'",
  },
  {
    'path': 'out_pub/s_bills_amdts_109-export.json',
    'name': "Congress 109 senator bill & amendments votes about 'Taiwan' and 'China'",
  },
  {
    'path': 'out_pub/s_bills_amdts_110-export.json',
    'name': "Congress 110 senator bill & amendments votes about 'Taiwan' and 'China'",
  },
  {
    'path': 'out_pub/s_bills_amdts_111-export.json',
    'name': "Congress 111 senator bill & amendments votes about 'Taiwan' and 'China'",
  },
  {
    'path': 'out_pub/s_bills_amdts_112-export.json',
    'name': "Congress 112 senator bill & amendments votes about 'Taiwan' and 'China'",
  },
  {
    'path': 'out_pub/s_bills_amdts_113-export.json',
    'name': "Congress 113 senator bill & amendments votes about 'Taiwan' and 'China'",
  },
  {
    'path': 'out_pub/s_bills_amdts_114-export.json',
    'name': "Congress 114 senator bill & amendments votes about 'Taiwan' and 'China'",
  },
];

Main();
