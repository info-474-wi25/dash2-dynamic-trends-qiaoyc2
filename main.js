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

    // const dataByLocation = d3.groups(processedData, d => d.location);
    const filteredData = processedData.filter(d => d.location === 'Birmingham, AL')

    // const categories = d3.rollup(categorizedData,
    //     v => d3.rollup(v,
    //         values => values.length,
    //         d => d.year
    //     ),
    //     d => d.categoryGroup
    // );
    console.log(nestedData)
    // 3.a: SET SCALES FOR CHART 1
    const [minDate, maxDate] = d3.extent(processedData, d => d.yearMonth);

    // 2. Offset the maximum date by 1 month
    const maxDatePlusOneMonth = d3.timeMonth.offset(maxDate, 1);
    const xScale = d3.scaleTime()
        .domain([minDate, maxDatePlusOneMonth])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0])
        .nice();

    const locations = Array.from(nestedData.keys());
    const colorScale = d3.scaleOrdinal()
        .domain(locations)
        .range(d3.schemeCategory10);

    const line = d3.line()
        .x(d => xScale(d.yearMonth))
        .y(d => yScale(d.avgTemp))

    const dataArray = Array.from(nestedData.entries());
    console.log(processedData)
    // 4.a: PLOT DATA FOR CHART 1
    svgLine.selectAll(".line")
        .data([filteredData])
        .enter()
        .append("path")
        .attr("class","line")
        .attr("d", line) // need to use the d funciton to plot multiple lines
        .attr("stroke", "steelblue") // don't forget update the color when we need multiple lines
        .attr("fill", "none");

    // 5.a: ADD AXES FOR CHART 1
    svgLine.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m")))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

    svgLine.append("g")
    .call(d3.axisLeft(yScale));
    

    // 6.a: ADD LABELS FOR CHART 1
    svgLine.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .text("Average Temperature (°C)");


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    
    // Create a tooltip div for interactivity
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px");
    
    // Define an update function that redraws the chart based on the selected city
    function updateChart(selectedCity) {
        // Filter data for the selected city
        const filteredData = processedData.filter(d => d.location === selectedCity);

        // Remove existing line and data points
        svgLine.selectAll(".line").remove();
        svgLine.selectAll(".data-point").remove();

        // Draw the line for the filtered data using .datum()
        svgLine.append("path")
            .datum(filteredData)
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", "steelblue")
            .attr("fill", "none");

        // Add circles for each data point for tooltip interactivity
        svgLine.selectAll(".data-point")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => xScale(d.yearMonth))
            .attr("cy", d => yScale(d.avgTemp))
            .attr("r", 5)
            .style("fill", "steelblue")
            .style("opacity", 0) // Hide circles until hovered
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`<strong>Month:</strong> ${d3.timeFormat("%Y-%m")(d.yearMonth)}<br>
                           <strong>Avg Temp:</strong> ${d.avgTemp.toFixed(1)}`);
                d3.select(this).style("opacity", 1);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY + 10) + "px")
                       .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this).style("opacity", 0);
            });
    }

    // 7: ADD EVENT LISTENER TO THE EXISTING DROPDOWN
    // Listen for changes on the select element with id "categorySelect"
    d3.select("#categorySelect").on("change", function() {
        const selectedCity = d3.select(this).property("value");
        updateChart(selectedCity);
    });

    // Initialize chart with the default city selected in the dropdown
    const defaultCity = d3.select("#categorySelect").property("value");
    updateChart(defaultCity);
});
