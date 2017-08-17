'use strict';

(function() {

function FindHexagonVertices() {
  const SQRT3 = 1.732051;
  return [
    [0, 1],
    [SQRT3/2, 1/2],
    [SQRT3/2, -1/2],
    [0, -1],
    [-SQRT3/2, -1/2],
    [-SQRT3/2, 1/2],
  ];
}

function GetFillColor(d) {
  const value = d.umatrix_value * 255;
  return d3.rgb(value, value, value);
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

function Main() {

  d3.json('sbills-export.json', function(entries) {
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
        })
      .append('polygon')
        .attr('points', function(entry) {
          return FindHexagonVertices(entry.centroid);
        })
        .attr('fill', GetFillColor)
        .on('click', function() {
          d3.select('#SelectedHexagon')
            .attr('id', null)
            .attr('fill', GetFillColor);
          d3.select(this)
            .attr('id', 'SelectedHexagon')
            .attr('fill', d3.rgb(66, 98, 244));
        });
  });
}

Main();

}) ();
