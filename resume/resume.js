var colorrange = [];

function chart(csvpath, color) {
  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  }
  strokecolor = colorrange[0];

  var margin = {top: 20, right: 40, bottom: 30, left: 30};
  var width = 1000;
  var height = 300;

  var x = d3.scaleLinear()
      .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);

  var z = d3.scaleOrdinal()
      .range(colorrange);

  var stack = d3.stack()
      .keys(["html", "js", "ruby", "objc", "swift", "haskell"])
      .offset(d3.stackOffsetNone)

  var nest = d3.nest()
      .key(function(d) { return d.key; });

  var area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(function(d) { return x(d.data.year); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); });

  // var svg = d3.select(".chart").append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
      // var height = height + margin.top + margin.bottom;
      // var width = width + margin.left + margin.right;
  var svg = d3.select("svg.chart")
      .attr("viewBox", "0 0 " + width + " " + height)
    .append("g")
      // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var graph = d3.csv(csvpath, function(data) {
    var data_ = data.map(function (d) {
        return {
            year: +d.year,
            html: +d.html,
            js: +d.js,
            ruby: +d.ruby,
            objc: +d.objc,
            swift: +d.swift,
            haskell: +d.haskell
        };
    });
    var layers = stack(data_);

    x.domain(d3.extent(data_, function(d) { return d.year; }));
    y.domain([0, 1]);

    svg.selectAll(".layer")
        .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { console.log(d); return area(d); })
        .style("fill", function(d, i) { return z(i); });

    svg.selectAll(".layer")
      .attr("opacity", 1)

    var x2011 = x(2011.25) + 20
    var x2018 = x(2018.25) - 20
    var label1 = label("2011")
      .attr("transform", "translate(" + x2011 + ", " + y(0.5) + ")")
    var label2 = label("2018")
      .attr("transform", "translate(" + x2018 + ", " + y(0.5) + ")")

    svg.node().appendChild(label1.node())
    svg.node().appendChild(label2.node())
  });
}

function label(text) {
  var g = d3.select(document.createElementNS(d3.namespaces.svg, 'g'));

  g.append("rect")
    .attr("x", -38)
    .attr("y", -18)
    .attr("width", 76)
    .attr("height", 36)
    .attr("rx", 20)
    .attr("ry", 20)
    .attr("class", "year")

  g.append("text")
    .attr("dy", "6px")
    .text(text)

  return g
}
