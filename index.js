// Define the URL
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

// Set dimensions and margins for the chart
const margin = { top: 20, right: 30, bottom: 40, left: 60 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create an SVG container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip
const tooltip = d3.select("#tooltip");

const parseDate = d3.timeParse("%Y-%m-%d");

// Fetch the data and create the chart
d3.json(url).then(response => {
    const data = response.data.map(d => [parseDate(d[0]), d[1]]); // Convert date strings to Date objects
    
    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d[0]))
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[1])])
        .nice()
        .range([height, 0]);
    
    // Create the axes
    const xAxis = d3.axisBottom(x)
        .ticks(d3.timeYear.every(5))
        .tickFormat(d3.timeFormat("%Y"));

    const yAxis = d3.axisLeft(y);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .attr("id", "x-axis");

    // Add the y-axis
    svg.append("g")
        .call(yAxis)
        .attr("id", "y-axis");
    
    // Calculate bar width
    const barWidth = width / data.length;

    // Add the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", barWidth - 1) // Subtract a small value to prevent overlap
        .attr("height", d => height - y(d[1]))
        .attr("data-date", d => d3.timeFormat("%Y-%m-%d")(d[0]))
        .attr("data-gdp", d => d[1])
        .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
                .attr("data-date", d3.timeFormat("%Y-%m-%d")(d[0]))
                .html(`Date: ${d3.timeFormat("%m/%d/%Y")(d[0])}<br>GDP: ${d[1]}`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });
}).catch(error => {
    console.error("Error fetching data:", error);
});
