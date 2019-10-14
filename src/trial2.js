require("babel-core/register");
require("babel-polyfill");
import { select, selectAll, json, tree, hierarchy, linkHorizontal, zoom, event } from 'd3';

class BartDataVis {
  constructor() {
    this.data;
    this.test;
    this.date;
    this.hour;
    this.origin;

    this.fetchData = this.fetchData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inputValidation = this.inputValidation.bind(this);
    this.render = this.render.bind(this);
  }

  fetchData(){
    return this.data = json('janData.json').then(data => {
      return data});
  }

  handleSubmit(e){
    e.preventDefault();
    if (this.inputValidation()){
      this.render();
    };
  }

  inputValidation() {
    // confirm if inputs are valid, then
    // date, hour, origin needs to be formatted
    let formDate = document.getElementById("bartDate").value;
    let formHour = document.getElementById("bartHour").value;
    let formOrigin = document.getElementById("bartOrigin").value;
    
    if ( formDate === "" || formHour === "" || formOrigin === ""){
      window.alert("Please fillout all fields");
      return false;
    } else {
      console.log("validation passed")
      console.log("this.data", this.data);
      formHour = formHour.split(":")[0];
      if (formHour.charAt(0) === '0'){
        formHour = formHour.substr(1);
      }

      this.date = formDate; 
      this.hour = formHour;
      this.origin = formOrigin;
      return true;
    }
  }

  render(){
    // define constants needed for svg
    const svg = select('svg');
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;

    const margin = { top: 0, right: 100, bottom: 0, left: 75 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const treeLayout = tree().size([innerHeight, innerWidth]);

    //before drawing the lines and nodes, clear svg
    selectAll("g > *").remove();

    const zoomG = svg 
      .attr('width', width)
      .attr('height', height)
      .append('g');

    const g = zoomG.append('g')
      .attr('tranform', `translate(${margin.left}, ${margin.top})`);

    svg.call(zoom().on('zoom', () => {
      g.attr('transform', event.transform);
    }));

    // set up the root node, links, path, 
    let root = hierarchy(this.data[this.date][this.hour][this.origin]);
    let links = treeLayout(root).links();

    console.log("root", root);
    console.log("links", links);
    
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
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // load the styles and links
  // load the data
  // then set data and wait for user to submit 
  const bartDataVis = new BartDataVis();
  bartDataVis.fetchData()
  .then(data => {
    bartDataVis.data = data;
    document.getElementById("bartFormSubmit").onclick = bartDataVis.handleSubmit;
  });
});
