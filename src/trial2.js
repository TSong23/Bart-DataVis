require("babel-core/register");
require("babel-polyfill");
import { select, json, tree, hierarchy, linkHorizontal, zoom, event } from 'd3';

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
    return this.data = json('janData.json').then(data => {return data});
  }

  handleSubmit(e){
    e.preventDefault();
    if (this.inputValidation()){
      this.render();
    };
  }

  inputValidation() {
    // date, hour, origin needs to be formatted
    let formDate = document.getElementById("bartDate").value;
    let formHour = document.getElementById("bartHour").value;
    let formOrigin = document.getElementById("bartOrigin").value;
    
    if ( formDate === "" || formHour === "" || formOrigin === ""){
      window.alert("Please fillout all fields");
      return false;
    } else {
      console.log("validation passed")
      this.date = formDate; 
      this.hour = formHour;
      this.origin = formOrigin;
      return true;
    }
  }

  render(){
    console.log("render");
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
      .append('g');

    const g = zoomG.append('g')
      .attr('tranform', `translate(${margin.left}, ${margin.top})`);

    svg.call(zoom().on('zoom', () => {
      g.attr('transform', event.transform);
    }));
    const root = hierarchy(this.data[this.date][this.hour][this.origin]);
    
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // initialize bartDataVis
  // load the data
  const bartDataVis = new BartDataVis();
  bartDataVis.fetchData()
  .then(data => {
    //everything else has to go inside .then
    bartDataVis.data = data;
    // this.data = data;
    
    //listen for user input
    document.getElementById("bartFormSubmit").onclick = bartDataVis.handleSubmit;
  });
});
