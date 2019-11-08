require("babel-core/register");
require("babel-polyfill");

import * as janData from '../dist/janData.json';

import {
  select, selectAll, json, tree, hierarchy, linkHorizontal,
  zoom, event, partition, getBBox, scaleOrdinal, quantize,
  arc, interpolateRainbow, descendants, interpolate,
  scaleLinear, scaleSqrt, format
} from 'd3';

import {
  interpolateCividis, interpolateCool, schemeRdGy,
  schemeSet3
} from 'd3-scale-chromatic';

class BartDataVis {
  constructor() {
    this.data = janData["default"];
    this.test;
    this.date;
    this.hour;
    this.origin;

    this.fetchData = this.fetchData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.inputValidation = this.inputValidation.bind(this);
    this.render = this.render.bind(this);
  }

  fetchData() {
    return this.data = json('janData.json').then(data => {
      return data
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.inputValidation()) {
      this.render();
    };
  }

  inputValidation() {
    // confirm if inputs are valid, then
    // date, hour, origin needs to be formatted
    let formDate = document.getElementById("bartFormDate").value;
    let formHour = document.getElementById("bartFormHour").value;
    let formOrigin = document.getElementById("bartFormOrigin").value;

    if (formDate === "" || formHour === "" || formOrigin === "") {
      window.alert("Please fillout all fields");
      return false;
    } else {
      formHour = formHour.split(":")[0];
      if (formHour.charAt(0) === '0') {
        formHour = formHour.substr(1);
      }

      this.date = formDate;
      this.hour = formHour;
      this.origin = formOrigin;
      return true;
    }
  }

  
  render() {
    
    //formatting
    const vFormat = format(",d");
    
    // svg height, width, and radius or arc
    let vWidth = 1080;
    let vHeight = 949;  
    let vRadius = vWidth / 6;

    // arc drawing
    const vArc = arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(vRadius * 1.5)
      .innerRadius(d => d.y0 * vRadius)
      .outerRadius(d => Math.max(d.y0 * vRadius, d.y1 * vRadius - 1));

    // partitioning data
    const vPartition = data => {
      const root = hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
      return partition()
        .size([2 * Math.PI, root.height + 1])
        (root);
    }

    // Data and Root
    const vRoot = vPartition(this.data[this.date][this.hour][this.origin]);
    vRoot.each(d => d.current = d);

    // color for each slice
    const vColor = scaleOrdinal().range(quantize(interpolateRainbow, this.data[this.date][this.hour][this.origin].children.length + 1));


    // create svg element
    const vSvg = select('svg')
      .attr('width', vWidth)
      .attr('height', vHeight)
      .style("font", "10px sans-serif")

    const g = vSvg.append("g")
      .attr("transform", "translate(" + ((vWidth / 2) + 250) + ',' + ((vHeight / 2) + 100) + ')')
    

    // create path elements
    let path = g.append("g")
      .selectAll("path")
      .data(vRoot.descendants().slice(1))
      .join("path")
        .attr("fill", d => { 
          while (d.depth > 1) 
            d = d.parent; 
            return vColor(d.data.name); 
        })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("d", d => vArc(d.current));
    
    // debugger
    // path.filter(d => d.children)
    //   .style("cursor", "pointer")
    //   .on("click", clicked);


    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
    
    // const label = g.append("g")
    //   .attr("pointer-events", "none")
    //   .attr("text-anchor", "middle")
    //   .style("user-select", "none")
    //   .selectAll("text")
    //   .data(vRoot.descendants().slice(1))
    //   .join("text")
    //   .attr("dy", "0.35em")
    //   .attr("fill-opacity", d => this.labelVisible(d.current))
    //   .attr("transform", d => this.labelTransform(d.current))
    //   .text(d => d.data.name);

    // const parent = g.append("circle")
    //   .datum(vRoot)
    //   .attr("r", vRadius)
    //   .attr("fill", "none")
    //   .attr("pointer-events", "all")
    //   // .on("click", clicked);

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

  } //end of render

}//end of class


document.addEventListener('DOMContentLoaded', () => {
  // load the styles and links
  // load the data
  // then set data and wait for user to submit 
  const bartDataVis = new BartDataVis();
  document.getElementById("bartFormSubmit").onclick = bartDataVis.handleSubmit;
  // bartDataVis.fetchData()
  //   .then(data => {
  //     bartDataVis.data = data;
  //     document.getElementById("bartFormSubmit").onclick = bartDataVis.handleSubmit;
  //   });
});
