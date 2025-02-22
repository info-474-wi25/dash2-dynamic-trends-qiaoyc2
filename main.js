// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgLine = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    // Convert Date.Full to a Date object and extract Year-Month
    const parseDate = d3.timeParse("%Y-%m-%d"); // Adjust based on your date format
    const formatMonth = d3.timeFormat("%Y-%m");

    data.forEach(d => {
        d.date = parseDate(d["Date.Full"]);
        d.yearMonth = formatMonth(d.date); // Extract YYYY-MM
        d.avgTemp = +d["Data.Temperature.Avg Temp"]; // Convert temp to number
    });

    // Group data by Station.Location and Year-Month
    const nestedData = d3.groups(data, d => d["Station.Location"], d => d.yearMonth);

    // Compute monthly average temperature
    const processedData = nestedData.map(([location, months]) => {
        return months.map(([month, records]) => ({
            location: location,
            yearMonth: d3.timeParse("%Y-%m")(month), // Convert to Date format
            avgTemp: d3.mean(records, d => d.avgTemp)
        }));
    }).flat();

    console.log("Processed Data:", processedData);

    // 3.a: SET SCALES FOR CHART 1


    // 4.a: PLOT DATA FOR CHART 1


    // 5.a: ADD AXES FOR CHART 1


    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    

    // ==========================================
    //         CHART 2 (if applicable)
    // ==========================================

    // 3.b: SET SCALES FOR CHART 2


    // 4.b: PLOT DATA FOR CHART 2


    // 5.b: ADD AXES FOR CHART 


    // 6.b: ADD LABELS FOR CHART 2


    // 7.b: ADD INTERACTIVITY FOR CHART 2


});