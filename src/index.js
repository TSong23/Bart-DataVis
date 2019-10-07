import {select, json, tree, hierarchy, linkHorizontal, zoom, event} from 'd3';


// like example, start with defining root and then defining
// chart size

// try setting the svg inside the async
let date = '2019-01-01';
let hour = '11';
let origin = 'MONT';

// constants needed inside the async
let dy = 150;
let dx = 10;
let margin = ({ top: 10, right: 120, bottom: 10, left: 40 });




json('oneDaydata.json')
  .then(data => {
    const root = hierarchy(data[`${date}`][`${hour}`][`${origin}`]);
    const links = root.links();

    // not sure what this does
    // each node has a property of x0 and y0 for some reason
    root.eachBefore(d => {
      d.x0 = d.x;
      console.log(d.x)
      d.y0 = d.y;
    });

    // chart render and transition logic
    let left = root;
    let right = root;
    root.eachBefore(node => {
      if (node.x < left.x) left = node;
      if (node.x > right.x) right = node;
    });
    
    // 
    const height = right.x - left.x + margin.top + margin.bottom;



    

    const linkPathGenerator = linkHorizontal()


  });

// const root = hierarchy(data['2019-01-01']['11']['MONT']);
// console.log("root", root)


const svg = select('svg');

// make the width and heigh flexible
// 
















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

