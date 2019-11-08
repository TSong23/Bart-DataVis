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
    let vWidth = 900;
    // let vHeight = 949;  
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
      .style('width', 1320)
      .style('height', 1080)
      .style("font", "14px sans-serif")

    const g = vSvg.append("g")
      .attr("transform", "translate(" + ((vWidth / 2)+ 250) + ',' + ((vWidth / 2)  + 25) + ')')
    

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
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.7 : 0.5) : 0)
      .attr("d", d => vArc(d.current));
    
    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);


    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${vFormat(d.value)}`);
    
    const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(vRoot.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.children ? `${d.data.name}\n${vFormat(d.value)}` : d.data.name );

    const vParent = g.append("circle")
      .datum(vRoot)
      .attr("r", vRadius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    function clicked(p) {
      vParent.datum(p.parent || vRoot);

      vRoot.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = g.transition().duration(750);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
        .tween("data", d => {
          const i = interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.7 : 0.5) : 0)
        .attrTween("d", d => () => vArc(d.current));

      label.filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current))
        .text(d => `${d.data.name}\n${vFormat(d.value)}`);
    }
    

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }
    
    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * vRadius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
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
