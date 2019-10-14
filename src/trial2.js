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
    this.inputValidation();
  }

  inputValidation() {
    let date = document.getElementById("bartDate").value;
    let hour = document.getElementById("bartHour").value;
    let origin = document.getElementById("bartOrigin").value;
  console.log("date", date);
  console.log("hour", hour);
  console.log("origin", origin);
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
