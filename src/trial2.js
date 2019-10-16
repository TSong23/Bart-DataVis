require("babel-core/register");
require("babel-polyfill");
import { select, selectAll, json, tree, hierarchy, linkHorizontal,
  zoom, event, partition, getBBox, scaleOrdinal, quantize,
  arc} from 'd3';
import {interpolateCividis} from 'd3-scale-chromatic';

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
    
    let vWidth = 900;
    let vHeight = 900;
    let vRadius = Math.min(vWidth, vHeight) / 2;

    // Prepare our physical space
    let g = select('svg')
      .attr('width', document.body.clientWidth)
      .attr('height', document.body.clientHeight)
      .append('g')
      .attr('transform', 
        'translate(' + ((vWidth / 2)+175) + ',' + ((vHeight / 2)+50) + ')');

    // Declare d3 layout
    var vLayout = partition().size([2 * Math.PI, vRadius]);

    var vArc = arc()
      .startAngle(function (d) { return d.x0; })
      .endAngle(function (d) { return d.x1; })
      .innerRadius(function (d) { return d.y0; })
      .outerRadius(function (d) { return d.y1; });

    // Layout + Data
    var vRoot = hierarchy(this.data[this.date][this.hour][this.origin])
      .sum(function (d) { return d.value });

    console.log("vRoot", vRoot);
    let vColor = scaleOrdinal(quantize(interpolateCividis, vRoot.children.length + 1));
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
      .attr('transform', function (d) {  // <--3
        return 'translate(' + vArc.centroid(d) + ')rotate(' + computeTextRotation(d) + ')';
      })
      .attr('dx', '-20')  // <--4
      .attr('dy', '.5em')  // <--5
      .text(function (d) { return d.data.name });  // <--6
    
    // Draw on screen
    // vSlices.filter(function (d) { return d.parent; })
    //   .attr('d', vArc)
    //   .style('stroke', '#fff')
    //   .style('fill', function (d) {
    //     return vColor((d.children ? d : d.parent).data.name);
    //   });
    
    console.log("vSlices", vSlices);

    function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;  // <-- 1

    // Avoid upside-down labels; labels aligned with slices
    return (angle < 90 || angle > 270) ? angle : angle + 180;  // <--2

    // Alternate label formatting; labels as spokes
    //return (angle < 180) ? angle - 90 : angle + 90;  // <-- 3
  }

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
