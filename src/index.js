require("babel-core/register");
require("babel-polyfill");
import {select, json, tree, hierarchy, linkHorizontal, zoom, event} from 'd3';


// chart is rendering but the way this chart works is through recursive calls
// define the root data outside. then define the recrusive "update"
// then pass in the root while making sure it works with the svg somehow


// this async function call works
let data;
async function fetchData(){
  data = await json('oneDaydata.json');
}

document.getElementById('dataForm').onsubmit = function () {
  console.log(document.getElementById('searchTerm').value);
  return false;
};



// these variables need to be changed through user interaction
// whenever user submits the day, hour, and station, the page should refresh
let date = '2019-01-01';
let hour = '11';
let origin = 'MONT';

// define root for the bottom most stack
const bartData = fetchData();
let root = bartData[date][hour][origin];
console.log("root", root);





//refactor recursive function and take out constants to the front
// 

/////////////////////////////////////////////////////////////////

// constants needed for svg inside async
let width = 900;
let margin = ({ top: 10, right: 120, bottom: 10, left: 40 });
let dy = 150;
let dx = 10;

// define tree layout
// done in both example.js and freecode camp video
const treeLayout = tree().nodeSize([dx, dy]);

// select svg element defined in index.html
// construct nodes
const svg = select('svg');
const gLink = svg.append("g");
const gNode = svg.append("g");

// define the string connection
const diagonal = linkHorizontal().x(d => d.y).y(d => d.x);



json('oneDaydata.json')
  .then(data => {
    // get root to be in form
    // nodes is just an array; idk why reversed tho
    // each node has attributes of data, depth, height, parent, x, y
    const root = hierarchy(data[`${date}`][`${hour}`][`${origin}`]);
    const nodes = root.descendants().reverse();
    const links = root.links();

    // compute the new tree layout. not sure what this changes
    treeLayout(root);

    //define some root attributes
    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });
    console.log("root.descendants", root.descendants());

    // chart render and transition logic
    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });
    //left and right refers to the edge leaf nodes
    // has property of x that shows pixel coordinate of sort
    console.log("left", left)
    console.log("right", right)
    
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
    console.log("node", node)
    
    // nodeEnter is some crazy object
    const nodeEnter = node.enter().append("g")
      .attr("transform", d => `translate(${root.y0},${root.x0})`)
      .attr("fill-opacity", 0)
      .attr("stroke-opacity", 0)
      .on("click", d => {
        d.children = d.children ? null : d._children;
        // recursively calling this func
        // need to reformat
        update(d);
      });
    
    nodeEnter.append("circle")
      .attr("r", 2.5)
      .attr("fill", d => d._children ? "#555" : "#999")
      .attr("stroke-width", 10);

    nodeEnter.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d._children ? -6 : 6)
      .attr("text-anchor", d => d._children ? "end" : "start")
      .clone(true).lower()
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .text(d => d.children ? d.data.name : `${d.data.name}: ${d.data.value}`)
      .attr("stroke", "white");
      
    console.log("nodeEnter", nodeEnter)

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
        const o = { x: root.x0, y: root.y0 };
        return diagonal({ root: o, target: o });
      });

    // Transition links to their new position.
    link.merge(linkEnter).transition(transition)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition(transition).remove()
      .attr("d", d => {
        const o = { x: root.x, y: root.y };
        return diagonal({ root: o, target: o });
      });

    // Stash the old positions for transition.
    root.eachBefore(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  });

// // not sure what this does
//     // each node has a property of x0 and y0 for some reason
//     // root.eachBefore(d => {
//     //   d.x0 = d.x;
//     //   console.log(d.x)
//     //   d.y0 = d.y;
//     // });


    

//     // const linkPathGenerator = linkHorizontal()














//////////////////////////////////////////////////////////////////

// const svg = select('svg');

// const width = document.body.clientWidth;
// const height = document.body.clientHeight;

// const margin = { top: 0, right: 100, bottom: 0, left: 75 };
// const innerWidth = width - margin.left - margin.right;
// const innerHeight = height - margin.top - margin.bottom;

// const treeLayout = tree().size([innerHeight, innerWidth]);

// const zoomG = svg 
//   .attr('width', width)
//   .attr('height', height)
//   .append('g')

// const g = zoomG.append('g')
//   .attr('tranform', `translate(${margin.left}, ${margin.top})`);

// svg.call(zoom().on('zoom', () => {
//   g.attr('transform', event.transform);
// }))

// json('oneDaydata.json')
//   .then(data => {
//     //testing root descendents
//     const root = hierarchy(data['2019-01-01']['11']['MONT']);
    
//     console.log('descendents',root)
//     const links = treeLayout(root).links();

//     console.log('links', links)

//     const linkPathGenerator = linkHorizontal()
//       .x(d => d.y)
//       .y(d =>d.x);

//     g.selectAll('path').data(links)
//       .enter().append('path')
//         .attr('d', linkPathGenerator);
    
//     g.append("circle")
//       .attr("r", 2.5);

//     g.selectAll('text').data(root.descendants())
//       .enter().append('text')
//         .attr('x', d => d.y)
//         .attr('y', d => d.x)  
//         .attr('dy', '0.32em')  
//         // .attr('text-anchor',d => d.children ? 'middle' : 'start')
//       .text(d => d.children ? d.data.name : `${d.data.name}: ${d.data.value}`)   
//   });

