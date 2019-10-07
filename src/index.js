import {select, json, tree, hierarchy, linkHorizontal, zoom, event} from 'd3';

const svg = select('svg');

const width = document.body.clientWidth;
const height = document.body.clientHeight;

const margin = { top: 0, right: 100, bottom: 0, left: 75 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const treeLayout = tree().size([innerHeight, innerWidth]);

const zoomG = svg 
  .attr('width', width)
  .attr('height', height)
  .append('g')

const g = zoomG.append('g')
  .attr('tranform', `translate(${margin.left}, ${margin.top})`);

svg.call(zoom().on('zoom', () => {
  g.attr('transform', event.transform);
}))

json('oneDaydata.json')
  .then(data => {
    //testing root descendents
    const root = hierarchy(data['2019-01-01']['11']['MONT']);
    
    console.log('descendents',root)
    const links = treeLayout(root).links();

    console.log('links', links)

    const linkPathGenerator = linkHorizontal()
      .x(d => d.y)
      .y(d =>d.x);

    g.selectAll('path').data(links)
      .enter().append('path')
        .attr('d', linkPathGenerator);
    
    g.append("circle")
      .attr("r", 2.5);

    g.selectAll('text').data(root.descendants())
      .enter().append('text')
        .attr('x', d => d.y)
        .attr('y', d => d.x)  
        .attr('dy', '0.32em')  
        // .attr('text-anchor',d => d.children ? 'middle' : 'start')
      .text(d => d.children ? d.data.name : `${d.data.name}: ${d.data.value}`)   
  });

