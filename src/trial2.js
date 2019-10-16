require("babel-core/register");
require("babel-polyfill");
import { select, selectAll, json, tree, hierarchy, linkHorizontal,
  zoom, event, partition, getBBox, scaleOrdinal, quantize, interpolateRainbow,
  arc} from 'd3';
import {schemeCategory10} from 'd3-scale-chromatic';

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
    let formDate = document.getElementById("bartFormDate").value;
    let formHour = document.getElementById("bartFormHour").value;
    let formOrigin = document.getElementById("bartFormOrigin").value;
    
    if ( formDate === "" || formHour === "" || formOrigin === ""){
      window.alert("Please fillout all fields");
      return false;
    } else {
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
    
    let vWidth = 300;
    let vHeight = 300;
    let vRadius = Math.min(vWidth, vHeight) / 2;

    // Prepare our physical space
    let g = select('svg')
      .attr('width', vWidth)
      .attr('height', vHeight)
      .append('g')
      .attr('transform', 
        'translate(' + vWidth / 2 + ',' + vHeight / 2 + ')');

    // Declare d3 layout
    var vLayout = partition().size([2 * Math.PI, vRadius]);

    var vArc = arc()
      .startAngle(function (d) { return d.x0; })
      .endAngle(function (d) { return d.x1; })
      .innerRadius(function (d) { return d.y0; })
      .outerRadius(function (d) { return d.y1; });

    // Layout + Data
    var vRoot = hierarchy(this.data[this.date][this.hour][this.origin])
      .sum(function (d) { 
        return d.value 
      });
    console.log("vRoot", vRoot);
    let vColor = scaleOrdinal(quantize(interpolateRainbow, vRoot.children.length + 1));
    console.log("vColor", vColor);

    var vNodes = vRoot.descendants();
    vLayout(vRoot);

    var vSlices = g.selectAll('path')
      .data(vNodes)
      .enter()
      .append('path');
    
    // Draw on screen
    vSlices.filter(function (d) { return d.parent; })
      .attr('d', vArc)
      .style('stroke', '#fff')
      .style('fill', function (d) {
        return vColor((d.children ? d : d.parent).data.name);
      });
    
    console.log("vSlices", vSlices);

  }

  //end of class
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
