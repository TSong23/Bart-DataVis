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

  vPartition(data){
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
    return d3.partition()
      .size([2 * Math.PI, root.height + 1])
      (root);
  }

  arcVisible(d){
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  labelVisible(d){
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  labelTransform(d){
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  clicked(p, root){
    parent.datum(p.parent || root);

    root.each(d => d.target = {
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
        return this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
      .attrTween("d", d => () => arc(d.current));

    label.filter(function (d) {
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    }).transition(t)
      .attr("fill-opacity", d => +labelVisible(d.target))
      .attrTween("transform", d => () => labelTransform(d.current));

  }
  
  render() {

    // define size, radius, fonts, and color function
    let vWidth = 800;
    let vHeight = 800;
    const radius = Math.min(vWidth, vHeight) / 6;
    const color = scaleOrdinal(quantize(interpolateRainbow, this.data.children.length + 1));
    const format = format(",d")

    //define arc function
    let vArc = arc()
      .startAngle(function (d) { return d.x0; })
      .endAngle(function (d) { return d.x1; })
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius / 2)
      .innerRadius(function (d) { return d.y0; })
      .outerRadius(function (d) { return d.y1 - 1; });
    
    // Data and Root
    const vRoot = this.vPartition(this.data);

    vRoot.each(d => d.current = d);

    let vSvg = select('svg')
      .attr('width', 1080)
      .attr('height', 949)
      .style("font", "10px sans-serif")
      
    let g = vSvg.append("g")
      .attr("transform", "translate(" + ((vWidth / 2) + 250) + ',' + ((vHeight / 2) + 100) + ')');

    let path = g.append("g")
      .selectAll("path")
      .data(vRood.descendants().slice(1))
      .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("d", d => vArc(d.current));

    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
    
    const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => this.labelVisible(d.current))
      .attr("transform", d => this.labelTransform(d.current))
      .text(d => d.data.name);

    const parent = g.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);


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
