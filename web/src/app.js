'use strict';

const SQRT3 = 1.732051;

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

function OnCellClick() {
  var selectedNode = d3.select(this.parentNode);
  var previousSelectedNode = d3.select('#selectedNode');
  const isUnselectingNode = (selectedNode.attr('id') === 'selectedNode');

  if (!previousSelectedNode.empty()) {
    previousSelectedNode.attr('id', null);
    previousSelectedNode.select('polygon')
      .attr('fill', GetDefaultCellBackgroundColor);
    previousSelectedNode.select('text')
      .attr('fill', GetDefaultCellTextColor);
  }

  if (isUnselectingNode) {
    return;
  }

  selectedNode.attr('id', 'selectedNode');
  selectedNode.select('polygon')
    .attr('fill', GetSelectedCellBackgroundColor);
  selectedNode.select('text')
    .attr('fill', GetSelectedCellTextColor);
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
