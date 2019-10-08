require("babel-core/register");
require("babel-polyfill");
import { select, json, tree, hierarchy, linkHorizontal, zoom, event } from 'd3';


//STEP 0: Get user input
let date = '2019-01-01';
let hour = '11';
let origin = 'MONT';


//STEP 1: constants needed
let width = 900;
let margin = ({ top: 10, right: 120, bottom: 10, left: 40 });
let dy = 150;
let dx = 10;

const treeLayout = tree().nodeSize([dx, dy]);

const svg = select('svg');
const gLink = svg.append("g");
const gNode = svg.append("g");

const diagonal = linkHorizontal().x(d => d.y).y(d => d.x);

//STEP 1: load data

json('oneDaydata.json')
  .then(data => {
    let root = hierarchy(data[`${date}`][`${hour}`][`${origin}`]);
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });
    // call the recursive function here?
    console.log("root", root) //returns the root
    update(root, root)
  })


//STEP 2: create recursive function to generate tree
function update(source, root){

  //duration: needed for transition
  const nodes = root.descendants().reverse();
  const links = root.links();

  //from root passed in, make correct layout
  treeLayout(root);

  //define some root attributes
  root.x0 = dy / 2;
  root.y0 = 0;
  root.descendants().forEach((d, i) => {
    d.id = i;
    d._children = d.children;
    if (d.depth && d.data.name.length !== 7) d.children = null;
  });  

  // chart render and transition logic
  let left = root;
  let right = root;
  root.eachBefore(node => {
    if (node.x < left.x) left = node;
    if (node.x > right.x) right = node;
  });

  //height = leaf nodes height. duration = transition duraiton
  const height = right.x - left.x + margin.top + margin.bottom;
  const duration = event && event.altKey ? 2500 : 250;

  // transition animation logic
  const transition = svg.transition()
    .duration(duration)
    .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

  //update the nodes
  // for all the nodes, parent is now defined as "g"
  const node = gNode.selectAll("g")
    .data(nodes, d => d.id);

  const nodeEnter = node.enter().append("g")
    .attr("transform", d => `translate(${root.y0},${root.x0})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0)
    .on("click", d => {
      d.children = d.children ? null : d._children;
      // recursively calling this func
      // need to reformat
      update(d, root);
    });

  nodeEnter.append("circle")
    .attr("r", 2.5)
    .attr("fill", d => d._children ? "#555" : "#999")
    .attr("stroke-width", 10);

  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d._children ? -6 : 6)
    .attr("text-anchor", d => d._children ? "end" : "start")
    .text(d => d.data.name)
    .clone(true).lower()
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .attr("stroke", "white");

  // Transition nodes to their new position.
  const nodeUpdate = node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1)
    .attr("stroke-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node.exit().transition(transition).remove()
    .attr("transform", d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0);

  // Update the links…
  const link = gLink.selectAll("path")
    .data(links, d => d.target.id);

  // Enter any new links at the parent's previous position.
  const linkEnter = link.enter().append("path")
    .attr("d", d => {
      const o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    });

  // Transition links to their new position.
  link.merge(linkEnter).transition(transition)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition(transition).remove()
    .attr("d", d => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    });

  // Stash the old positions for transition.
  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

