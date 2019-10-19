require("babel-core/register");
require("babel-polyfill");
import { select, selectAll, json, tree, hierarchy, linkHorizontal,
  zoom, event, partition, getBBox, scaleOrdinal, quantize,
  arc, interpolateRainbow} from 'd3';
import {interpolateCividis, interpolateCool, schemeRdGy,
        schemeSet3} from 'd3-scale-chromatic';

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
    
    let vWidth = 750;
    let vHeight = 750;
    let vRadius = Math.min(vWidth, vHeight) / 2;

    // Prepare our physical space
    let g = select('svg')
      .attr('width', document.body.clientWidth)
      .attr('height', document.body.clientHeight)
      .append('g')
      .style("font", "10px sans-serif")
      .attr('transform', 
        'translate(' + ((vWidth / 2)+250) + ',' + ((vHeight / 2) + 200) + ')');

    // Declare d3 layout
    var vLayout = partition().size([2 * Math.PI, vRadius]);

    var vArc = arc()
      .startAngle(function (d) { return d.x0; })
      .endAngle(function (d) { return d.x1; })
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(vRadius / 2)
      .innerRadius(function (d) { return d.y0; })
      .outerRadius(function (d) { return d.y1 - 1; });

    // Layout + Data
    var vRoot = hierarchy(this.data[this.date][this.hour][this.origin])
      .sum(function (d) { return d.value })
      .sort((a,b) => b.value - a.value);

    console.log("vRoot", vRoot);
    let vColor = scaleOrdinal(quantize(interpolateRainbow, vRoot.children.length + 1));
    console.log("vColor", vColor);

    var vNodes = vRoot.descendants();
    vLayout(vRoot);

    var vSlices = g.selectAll('g')
      .data(vNodes)
      .enter()
      .append('g');

    vSlices.append('path')
      .attr('display', function(d) {return d.depth ? null : 'none'})
      .attr('d', vArc)
      .style('stroke', '#fff')
      .style('fill', function (d) { return vColor((d.children ? d : d.parent).data.name); });

    
    vSlices.append('text')  // <--1
      .filter(function (d) { return d.parent; })  // <--2
      .attr("transform", function (d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 1.9;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.35em")
      .text(d => d.data.name)
      .style('stroke', '#000');

    vSlices.append('svg:title')
      .text(function (d) { return `${d.data.name}\n Passengers: ${d.value}` })
 
    //render the information text on top
    let chartInfo = document.querySelector('.chart_info');
    let infoText = document.createTextNode(`From ${this.origin} blah `);
      chartInfo.appendChild(infoText);


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
