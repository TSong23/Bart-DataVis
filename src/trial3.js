require("babel-core/register");
require("babel-polyfill");

import * as janData from '../dist/janData.json';

import {
  select, selectAll, json, tree, hierarchy, linkHorizontal,
  zoom, event, partition, getBBox, scaleOrdinal, quantize,
  arc, interpolateRainbow, descendants, interpolate,
  scaleLinear, scaleSqrt
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

    // Data and Root
    var vRoot = hierarchy(this.data[this.date][this.hour][this.origin])
      .sum( d =>  d.value );
    
    // burst consts
    // define size, fonts, and color function
    // let formatNumber = d3.format(",d")
    let vWidth = 800;
    let vHeight = 800;
    let vRadius = Math.min(vWidth, vHeight) / 2;
    let vColor = scaleOrdinal(quantize(interpolateRainbow, vRoot.children.length + 1));

    // burst transition constants
    let x = scaleLinear()
      .range([0, 2 * Math.PI]);

    let y = scaleSqrt()
      .range([0, vRadius]);



    // select svg and give height and width
    let vSvg = select('svg')
      .selectAll("*").remove()
      .attr('width', 1080)
      .attr('height', 949)
      .append("g")
      .style("font", "10px sans-serif")
      .attr("transform", "translate(" + ((vWidth / 2) + 250) + ',' + ((vHeight / 2) + 100) + ')');

    //define arc properties
    let vLayout = partition().size([2 * Math.PI, vRadius]);

    let vArc = arc()
      .startAngle(function (d) { return d.x0; })
      .endAngle(function (d) { return d.x1; })
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(vRadius / 2)
      .innerRadius(function (d) { return d.y0; })
      .outerRadius(function (d) { return d.y1 - 1; });

    // define slices and apply partition function
    let vNodes = vRoot.descendants();
    vLayout(vRoot);
    console.log("vNodes", vNodes);

    // attach descendants and burst slices
    let vSlices = vSvg.selectAll("g")
      .data(vNodes)
      .enter()
      .append("g");

    vSlices.append('path')
      .attr('display', function (d) { return d.depth ? null : 'none' })
      .attr('d', vArc)
      .style('stroke', '#fff')
      .style('fill', function (d) { return vColor((d.children ? d : d.parent).data.name); })
      .on("click", click)
      .append("title")
      .text(d => { return d.data.name + "\n" + d.value; })


    function click(d) {
      console.log("click registered")
      console.log("x", x);
      console.log("y", y)
      console.log("d", d)
      vSvg.transition()
        .duration(750)
        .tween("scale", function () {
          var xd = interpolate(x.domain(), [d.x0, d.x1]),
            yd = interpolate(y.domain(), [d.y0, 1]),
            yr = interpolate(y.range(), [d.y0 ? 20 : 0, vRadius]);
          console.log("tween, xd, yd, yr", xd, yd, yr)
          return function (t) {
            x.domain(xd(t)); y.domain(yd(t)).range(yr(t));
          };
        })
        .selectAll("path")
        .attrTween("d", function (d) {
          console.log("attrTween, d", d)
          return function () {
            return vArc(d);
          };
        });
    }; //end of function click

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
