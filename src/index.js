import {select, json, tree, hierarchy, linkHorizontal} from 'd3';

const svg = select('svg');

const width = document.body.clientWidth;
const height = document.body.clientHeight;

const treeLayout = tree()
  .size([height, width]);

svg 
    .attr('width', width)
    .attr('height', height)
    


json('data2.json')
  .then(data => {
    // need to call hierarchy on data to get it ready for d3
    // let consoleData = data['2019-01-01']['11'];
    // console.log('data', data);
    const root = hierarchy(data);
    // let actualRoot = root.data;
    // console.log('actualRoot', actualRoot)
    const links = treeLayout(root).links();

    console.log('links', links)


    const linkPathGenerator = linkHorizontal()
      .x(d => d.y)
      .y(d =>d.x);

    svg.selectAll('path').data(links)
      .enter().append('path')
        .attr('d', linkPathGenerator);
  });

