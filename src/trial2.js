require("babel-core/register");
require("babel-polyfill");
import { select, json, tree, hierarchy, linkHorizontal, zoom, event } from 'd3';

class BartDataVis {
  constructor() {
    this.data;
    this.test;
    this.fetchData = this.fetchData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  fetchData(){
    return this.data = json('janData.json').then(data => {return data});
  }

  handleSubmit(e){
    e.preventDefault();
    console.log("handle submit");
    this.test = "test success";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // initialize bartDataVis
  // load the data

  const bartDataVis = new BartDataVis();
  bartDataVis.fetchData()
  .then(data => {
    //everything else has to go inside .then
    console.log("bartDataVis", data)
    
    //listen for user input
    document.getElementById("bartFormSubmit").onclick = bartDataVis.handleSubmit;
  });
});
