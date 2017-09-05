'use strict';

var assert = require('assert');
var d3 = require('d3');
var d3tip = require('d3-tip');

var Cell = require('cell');
var featureIds = require('feature_ids');
var models = require('models');
var partyAbbrev = require('party_abbrev');

var SQRT3 = 1.732051;

var cellInfoAnchor = null;
var cellInfo2Anchor = null;

var tip = d3tip().attr('class', 'd3-tip').offset([-2, 30]).html(
    d => '<span>' + featureIds.Get(d.index) + '</span>');

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
  cell.select('g').selectAll('polygon')
      .each(function() {
        RestoreAttr(d3.select(this), 'fill', '_fill');
      });
  RestoreAttr(cell.select('text'), 'fill', '_fill');
  UpdateCellInfo();
}

function SelectCell(d) {
  var cell = d3.select(this).style('cursor', 'default');
  cell.select('g').selectAll('polygon')
      .each(function() {
        SetAttr(d3.select(this), 'fill', Cell.SelectedBackgroundColor, '_fill');
      });
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
    cellInfoAnchor.select('g').selectAll('polygon')
        .each(function() {
          SetAttr(d3.select(this), '_fill', 'yellow', '__fill');
        });
    // offset cellInfo panel
    d3.select('#cellInfo2')
      .attr('transform', 'translate(0,'
        + d3.select('#cellInfo').node().getBBox().height + ')');
  } else if (!cellInfo2Anchor
      && cellInfoAnchor.node() != d3.select(this).node()) {
    // second anchor cell if it is different from the first
    cellInfo2Anchor = d3.select(this);
    cellInfo2Anchor.select('g').selectAll('polygon')
        .each(function() {
          SetAttr(d3.select(this), '_fill', 'yellow', '__fill');
        });
  } else {
    // we already have two cells anchored, release the two cells first
    UnanchorCell();
    UpdateCellInfo(d);
    // try to anchor the current cell as a first anchor
    // NOTE: tried calling AnchorCell recursively, but d3.select(this) returns
    // null
    if (d.rawData.labels.length > 0) {
      cellInfoAnchor = d3.select(this);
      cellInfoAnchor.select('g').selectAll('polygon')
          .each(function() {
            SetAttr(d3.select(this), '_fill', 'yellow', '__fill');
          });
      d3.select('#cellInfo2')
        .attr('transform', 'translate(0,'
          + d3.select('#cellInfo').node().getBBox().height + ')');
    }
  }
  d3.event.stopPropagation();
}

function UnanchorCell() {
  if (cellInfo2Anchor != null) {
    cellInfo2Anchor.select('g').selectAll('polygon')
        .each(function() {
          var polygon = d3.select(this);
          if (polygon.attr('_fill') === null) {
            RestoreAttr(polygon, 'fill', '__fill');
          } else {
            RestoreAttr(polygon, '_fill', '__fill');
          }
        });
    cellInfo2Anchor = null;
    UpdateCellInfo();
  }
  if (cellInfoAnchor != null) {
    cellInfoAnchor.select('g').selectAll('polygon')
        .each(function() {
          var polygon = d3.select(this);
          if (polygon.attr('_fill') === null) {
            RestoreAttr(polygon, 'fill', '__fill');
          } else {
            RestoreAttr(polygon, '_fill', '__fill');
          }
        });
    cellInfoAnchor = null;
    UpdateCellInfo();
  }
  if (d3.event) {
    d3.event.stopPropagation();
  }
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
  var MAX_VOTE_BAR_WIDTH = 300;
  var MAX_VOTE_RECT_WIDTH = 10;
  var VOTE_RECT_VMARGIN = 2;

  if (labels.length > 0) {
    var num_votes = labels[0].features.length;
    var vote_rect_width = Math.round(MAX_VOTE_BAR_WIDTH / num_votes);
    if (vote_rect_width > MAX_VOTE_RECT_WIDTH) {
      vote_rect_width = MAX_VOTE_RECT_WIDTH;
    }
  }

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
            .attr('x', vote_rect_width * numFeatures + 10);
        for (var i = 0; i < numFeatures; ++i) {
          row.append('rect')
              .attr('width', vote_rect_width)
              .attr('height', LINE_HEIGHT - VOTE_RECT_VMARGIN * 2)
              .attr('x', i * vote_rect_width)
              .attr('y', VOTE_RECT_VMARGIN)
              .on('mouseover', tip.show)
              .on('mouseleave', tip.hide);
        }
      })
    .merge(rows);

  rows
      .attr('transform', (d, i) => 'translate(0,' + i * LINE_HEIGHT + ')')
      .each(function(d, i) {
        d3.select(this).select('a')
          .attr('href', d.profile ? d.profile.url : null)
          .attr('xlink:href', d.profile ? d.profile.url : null)
          .attr('target', d.profile ? '_blank' : null)
          .attr('fill', d.profile ? 'blue' : 'black');
        d3.select(this).select('text')
            .text((d) =>
              d.profile ? 
                '(' + partyAbbrev.GetPartyAbbrev(d.profile.party) +
                '-' + d.profile.state + ') ' +
                d.profile.last_name +
                ', ' + d.profile.first_name
              : d.id)
            .attr('font-size', LINE_HEIGHT - VOTE_RECT_VMARGIN)
            .attr('alignment-baseline', 'before-edge')
            .attr('font-family', 'Arial, Helvetica');
        d3.select(this).selectAll('rect')
            .data(d.features.map((f, i) => ({value: f, index: i})))
            .attr('fill', (d) => {
              if (d.value === '') {
                return 'transparent';
              }
              if (d.value == 1) {
                return 'green';
              } else if (d.value == -1) {
                return 'red';
              } else if (d.value == 0) {
                return 'gray';
              } else {
                return 'black'; // something's wrong
              }
            });
      });
}

function RenderGraph(model) {
  UnanchorCell();
  UnanchorCell();
  featureIds.Load(model.featureIdsPath, () => {
    d3.json(model.modelPath, (entries) => {
      var canvasSize = GetCanvasSize();
      var canvas = d3.select('#zoom');
      var cells = canvas.selectAll('g.cell').data(
          entries.map(entry => new Cell(entry)));
      cells.exit().remove();
      cells.enter().append('g')
          .attr('class', 'cell')
          .on('mouseenter', SelectCell)
          .on('mouseleave', UnselectCell)
          .on('click', AnchorCell)
          .each(function() {
            d3.select(this).append('g');
            d3.select(this).append('text');
          })
        .merge(cells)
          .attr('transform', d =>
            'translate(' + [
              d.rawData.centroid[0] + canvasSize[0] / 2,
              -d.rawData.centroid[1] + canvasSize[1] / 2
            ] + ')')
          .each(function(d) {
            var polygons = d3.select(this).select('g').selectAll('polygon')
                .data(d.PolygonGroup());
            polygons.exit().remove();
            polygons.enter().append('polygon')
              .merge(polygons)
                .each(function(d) {
                  d3.select(this)
                      .attr('points', d.points)
                      .attr('fill', d.fillColor)
                });
            d3.select(this).select('text')
                .text(Cell.Text)
                .attr('fill', Cell.DefaultTextColor)
                .attr('font-size', 1)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle');
          });

      AutoZoom();
    });
  });
}

function AutoZoom(entries) {
  var bbox = d3.select('#zoom').node().getBBox();
  var canvasSize = GetCanvasSize();
  var s = Math.min(canvasSize[0] / bbox.width, canvasSize[1] / bbox.height);
  s *= 0.7;
  var zoom = d3.zoom()
      .scaleExtent([5, 40])
      .translateExtent([[0, 0], canvasSize])
      .on('zoom', () => {
        d3.select('#zoom').attr('transform', d3.event.transform);
      });
  d3.select('#canvas').call(zoom);
  d3.select('#canvas')
      .transition()
      .duration(500)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(canvasSize[0]/2, canvasSize[1]/2)
          .scale(s)
          .translate(-canvasSize[0]/2, -canvasSize[1]/2)
      );
}

function Main() {
  // Init model list.
  var modelList = d3.select('#modelList');
  modelList.selectAll('option')
      .data(models)
    .enter().append('option')
      .attr('value', d => JSON.stringify(d))
      .text(d => d.name);
  modelList.on('change', function() {
    var selectedOption = this.options[this.selectedIndex];
    var model = JSON.parse(selectedOption.value);
    RenderGraph(model);
  });

  // Init canvas.
  var canvasSize = GetCanvasSize();
  var rawCanvas = d3.select('#canvas')
      .attr('width', canvasSize[0])
      .attr('height', canvasSize[1])
      .on('click', UnanchorCell)
  var zoomCanvas = rawCanvas.append('g').attr('id', 'zoom');
  zoomCanvas.call(tip);
  var cellInfoPane = rawCanvas.append('g')
      .on('click', () => { d3.event.stopPropagation(); });
  cellInfoPane.append('g').attr('id', 'cellInfo');
  cellInfoPane.append('g').attr('id', 'cellInfo2');

  RenderGraph(models[0]);
}

Main();
