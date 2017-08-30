'use strict';

var assert = require('assert');
var d3 = require('d3');

var Cell = require('cell');
var models = require('models');
var partyAbbrev = require('party_abbrev');

var SQRT3 = 1.732051;

var cellInfoAnchor = null;
var cellInfo2Anchor = null;

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

function GetCanvasSize() {
  var w = window,
  d = document,
  e = d.documentElement,
  g = d.getElementsByTagName('body')[0],
  x = w.innerWidth || e.clientWidth || g.clientWidth,
  y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return [x, y - 50];
}

function SetAttr(sel, attr, value, tmpAttr) {
  sel.attr(tmpAttr, sel.attr(attr));
  sel.attr(attr, value);
}

function RestoreAttr(sel, attr, tmpAttr) {
  sel.attr(attr, sel.attr(tmpAttr));
  sel.attr(tmpAttr, null);
}

function UnselectCell() {
  var cell = d3.select(this);
  RestoreAttr(cell.select('polygon'), 'fill', '_fill');
  RestoreAttr(cell.select('text'), 'fill', '_fill');
  UpdateCellInfo();
}

function SelectCell(d) {
  var cell = d3.select(this).style('cursor', 'default');
  SetAttr(cell.select('polygon'), 'fill', Cell.SelectedBackgroundColor, '_fill');
  SetAttr(cell.select('text'), 'fill', Cell.SelectedTextColor, '_fill');
  UpdateCellInfo(d);
}

function AnchorCell(d) {
  if (d.rawData.labels.length <= 0) {
    return;
  }
  if (!cellInfoAnchor) {
    // first anchor cell
    cellInfoAnchor = d3.select(this);
    var polygon = cellInfoAnchor.select('polygon');
    SetAttr(polygon, '_fill', 'yellow', '__fill');
    // offset cellInfo panel
    d3.select('#cellInfo2')
      .attr('transform', 'translate(0,' 
        + d3.select('#cellInfo').node().getBBox().height + ')');
  } else if (!cellInfo2Anchor
      && cellInfoAnchor.node() != d3.select(this).node()) {
    // second anchor cell if it is different from the first
    cellInfo2Anchor = d3.select(this);
    var polygon = cellInfo2Anchor.select('polygon');
    SetAttr(polygon, '_fill', 'yellow', '__fill');
  } else {
    // we already have two cells anchored, release the two cells first
    UnanchorCell();
    UpdateCellInfo(d);
    // try to anchor the current cell as a first anchor
    // NOTE: tried calling AnchorCell recursively, but d3.select(this) returns
    // null
    if (d.rawData.labels.length > 0) {
      cellInfoAnchor = d3.select(this);
      var polygon = cellInfoAnchor.select('polygon');
      SetAttr(polygon, '_fill', 'yellow', '__fill');
      d3.select('#cellInfo2')
        .attr('transform', 'translate(0,' 
          + d3.select('#cellInfo').node().getBBox().height + ')');
    }
  }
  d3.event.stopPropagation();
}

function UnanchorCell() {
  if (cellInfo2Anchor != null) {
    var polygon = cellInfo2Anchor.select('polygon');
    if (polygon.attr('_fill') === null) {
      RestoreAttr(polygon, 'fill', '__fill');
    } else {
      RestoreAttr(polygon, '_fill', '__fill');
    }
    cellInfo2Anchor = null;
    UpdateCellInfo();
  }
  if (cellInfoAnchor != null) {
    var polygon = cellInfoAnchor.select('polygon');
    if (polygon.attr('_fill') === null) {
      RestoreAttr(polygon, 'fill', '__fill');
    } else {
      RestoreAttr(polygon, '_fill', '__fill');
    }
    cellInfoAnchor = null;
    UpdateCellInfo();
  }
  d3.event.stopPropagation();
}

function UpdateCellInfo(d) {
  var labels = [];
  if (d && d.rawData.labels && d.rawData.labels.length > 0) {
    labels = d.rawData.labels;
  }
  var cellInfo = null;
  if (!cellInfoAnchor) {
    cellInfo = d3.select('#cellInfo');
  } else if (!cellInfo2Anchor) {
    cellInfo = d3.select('#cellInfo2');
  }
  if (!cellInfo) {
    return;
  }

  var LINE_HEIGHT = 18;
  var VOTE_RECT_WIDTH = 10;
  var VOTE_RECT_VMARGIN = 2;

  var rows = cellInfo.selectAll('g.row').data(labels);
  rows.exit().remove();
  rows = rows.enter()
    .append('g')
      .attr('class', 'row')
      .each(function() {
        var numFeatures = d.rawData.weights.length;
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
                + ' (' + partyAbbrev.GetPartyAbbrev(d.profile.party)
                + '-' + d.profile.state + ')';
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
    var cells = canvas.selectAll('g.cell').data(
        entries.map(function(entry) { return new Cell(entry); }));
    cells.exit().remove();
    var newCells = cells
      .enter().append('g')
        .attr('class', 'cell')
        .on('mouseenter', SelectCell)
        .on('mouseleave', UnselectCell)
        .on('click', AnchorCell)
        .each(function() {
          d3.select(this).append('polygon');
          d3.select(this).append('text');
        })
      .merge(cells)
        .attr('transform', function(d) {
          return 'translate(' + d.rawData.centroid + ')';
        })
        .each(function() {
          d3.select(this).select('polygon')
              .attr('points', FindHexagonVertices)
              .attr('fill', Cell.DefaultBackgroundColor);
          d3.select(this).select('text')
              .text(Cell.Text)
              .attr('fill', Cell.DefaultTextColor)
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
      .attr('height', canvasSize[1])
      .on('click', UnanchorCell)
  var zoomCanvas = rawCanvas.append('g')
      .attr('id', 'zoom');
  var transformLayer = zoomCanvas.append('g')
      .attr(
        'transform',
        'translate(' + [canvasSize[0]/2, canvasSize[1]/2] + ')scale(20, -20)'
      );
  var canvas = transformLayer.append('g').attr('id', 'transformedCanvas');
  var cellInfoPane = rawCanvas.append('g')
      .on('click', function() { d3.event.stopPropagation(); });
  cellInfoPane.append('g').attr('id', 'cellInfo');
  cellInfoPane.append('g').attr('id', 'cellInfo2');

  var zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[0, 0], canvasSize])
      .on('zoom', function() {
        console.log(d3.event.transform);
        zoomCanvas.attr('transform', d3.event.transform);
      });
  rawCanvas.call(zoom);

  RenderGraph(models[0].path);
}

Main();
