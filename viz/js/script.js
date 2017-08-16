'use strict';

(function() {

function GetCoordOffsets(entries) {
  var minX = Infinity;
  var minY = Infinity;

  entries.forEach(function(entry) {
    entry.vertices.forEach(function(vertex) {
      if (vertex[0] < minX) {
        minX = vertex[0];
      }
      if (vertex[1] < minY) {
        minY = vertex[1];
      }
    });
  });

  return [-minX, -minY];
}

function GetFillColor(d) {
  const value = d.umatrix_value * 255;
  return d3.rgb(value, value, value);
}

function Main() {
  const kScale = 12;

  d3.json('sbills-export.json', function(entries) {
    const coordOffsets = GetCoordOffsets(entries);

    d3.select('#canvas').selectAll('polygon')
        .data(entries)
      .enter().append('polygon')
        .attr('points', function(d) {
          var allCoordinates = d.vertices.map(function(coords) {
            const adjustedX = (coords[0] + coordOffsets[0]) * kScale;
            const adjustedY = (-coords[1] + coordOffsets[1]) * kScale;
            return adjustedX + ',' + adjustedY;
          }).join(' ');
          return allCoordinates;
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
