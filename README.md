# Bart-DataVis

Currently in working progress

Bart-DataVis is a data visualization project that shows number of passengers using the BART system to travel from origin station
to the destination station. It allows the user to select the date and hour for which they want to view the data. 

## Technology

This project utilizes D3.js library to create a tree diagram. 


```javascript
 const root = hierarchy(data[`${date}`][`${hour}`][`${origin}`]);
    const nodes = root.descendants().reverse();
    const links = root.links();

    // compute the new tree layout. not sure what this changes
    treeLayout(root);
```



## Usage
Users can utilize this application to simulate experience of stock investing



