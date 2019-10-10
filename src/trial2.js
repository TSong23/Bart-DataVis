require("babel-core/register");
require("babel-polyfill");
import { select, json, layout, tree, hierarchy, linkHorizontal, zoom, event, svg } from 'd3';

let w = 960,
  h = 2000,
  i = 0,
  duration = 500,
  root;

let treeLayout = tree()
  .size([h, w - 160]);

let diagonal = svg.diagonal()
  .projection(function (d) { return [d.y, d.x]; });

let vis = select("#chart").append("svg:svg")
  .attr("width", w)
  .attr("height", h)
  .append("svg:g")
  .attr("transform", "translate(40,0)");

json("data2.json", function (json) {
  json.x0 = 800;
  json.y0 = 0;
  update(root = json);
});

function update(source) {

  // Compute the new tree layout.
  let nodes = treeLayout.nodes(root).reverse();
  console.log(nodes)
  // Update the nodes…
  let node = vis.selectAll("g.node")
    .data(nodes, function (d) { return d.id || (d.id = ++i); });

  let nodeEnter = node.enter().append("svg:g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
  //.style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.

  nodeEnter.append("svg:circle")
    //.attr("class", "node")
    //.attr("cx", function(d) { return source.x0; })
    //.attr("cy", function(d) { return source.y0; })
    .attr("r", 4.5)
    .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; })
    .on("click", click);

  nodeEnter.append("svg:text")
    .attr("x", function (d) { return d._children ? -8 : 8; })
    .attr("y", 3)
    //.attr("fill","#ccc")
    //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
    .text(function (d) { return d.name; });

  // Transition nodes to their new position.
  nodeEnter.transition()
    .duration(duration)
    .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
    .style("opacity", 1)
    .select("circle")
    //.attr("cx", function(d) { return d.x; })
    //.attr("cy", function(d) { return d.y; })
    .style("fill", "lightsteelblue");

  node.transition()
    .duration(duration)
    .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
    .style("opacity", 1);


  node.exit().transition()
    .duration(duration)
    .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
    .style("opacity", 1e-6)
    .remove();
  
  // Update the links…
  let link = vis.selectAll("path.link")
    .data(treeLayout.links(nodes), function (d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
    .attr("class", "link")
    .attr("d", function (d) {
      let o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    })
    .transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr("d", function (d) {
      let o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    })
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

select(self.frameElement).style("height", "2000px");