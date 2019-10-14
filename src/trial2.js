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
    this.inputValidation();
  }

  inputValidation() {
    // date, hour, origin needs to be formatted
    let formDate = document.getElementById("bartDate").value;
    let formHour = document.getElementById("bartHour").value;
    let formOrigin = document.getElementById("bartOrigin").value;
    
    if ( formDate === "" || formHour === "" || formOrigin === ""){
      console.log("inputValidation working");
    } else {
      //run functions to generate the graph
      this.date = formDate; 
      this.hour = formHour;
      this.origin = formOrigin;
      this.render();
    }
  }

  render(){

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
