import {select, json} from 'd3';

const svg = select('svg');

const width = document.body.clientWidth;
const height = document.body.clientHeight;

const myTree = tree()
  .size([height, width]);

svg 
    .attr('width', width)
    .attr('height', height)
  .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('rx', 40);

// const svg = select('svg')
// svg.style('background-color', 'lightblue');

json('testData.json')
  .then(data => {
    console.log(data);
  })