// Chart area
var svgWidth = 900;
var svgHeight = 500;

//Define Margins.
var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 80
};

// Chart Area  minus Margins.
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth  = svgWidth - margin.left - margin.right;

// create svg container
var svg = d3
    .select('#scatter')
    .append('svg')
    .classed('chart', true)
    .attr('width', svgWidth)
    .attr('height', svgHeight);

var chartGroup = svg.append("g")
// Move contents over beside the Margins
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var xAxis = "poverty";
var yAxis = "healthcare";


// update xScale upon click 
function xScale(dataCSV, xAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(dataCSV, d => d[xAxis]) * 0.98,
        d3.max(dataCSV, d => d[xAxis]) * 1
        ])
        .range([0, chartWidth]);
    return xLinearScale;
}

// update yScale upon click 
function yScale(dataCSV, yAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(dataCSV, d => d[yAxis]) * 0.85,
        d3.max(dataCSV, d => d[yAxis]) * 1.1
        ])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// update xAxis on click 
function showXAxis(xScale1, xAxis1) {
    var bottomAxis = d3.axisBottom(xScale1);
    xAxis1.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis1;
}

// update yAxis on click 
function showYAxis(yScale1, yAxis1) {
    var leftAxis = d3.axisLeft(yScale1);
    yAxis1.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis1;
}

// creating new circles by transitioning
function xCircles(circlesXattr, xScale1, xAxis) {

    circlesXattr.transition()
        .duration(500)
        .attr("cx", d => newXScale(d[xAxis]));

    return circlesXattr;
}

// creating new circles text group by transitioning
function xText(circlesXtext, xScale1, xAxis) {

    circlesXtext.transition()
        .duration(500)
        .select("text")
        .attr("x", d => newXScale(d[xAxis]));
    return circlesXtext;
}

// creating new circles by transitioning
function yCircles(circlesYattr, yScale1, yAxis) {

    circlesYattr.transition()
        .duration(500)
        .attr("cy", d => newYScale(d[yAxis]));

    return circlesYattr;
}

// creating new circles text group by transitioning
function yText(circlesYtext, yScale1, yAxis) {

    circlesYtext.transition()
        .duration(500)
        .select("text")
        .attr("y", d => newYScale(d[yAxis]));
    return circlesYtext;
}

// updating circles with tooltip
function updateToolTip(xAxis, yAxis, circlesGroup) {
    var xlabel;
    var ylabel;
    var xtrailer = " ";
    if (xAxis === "poverty") {
        xlabel = "Poverty:";
        xtrailer = "%"
    }
    else if (xAxis === "age") {
        xlabel = "Age:";
    }
    else {
        xlabel = "Household Income:";
    }

    if (yAxis === "healthcare") {
        ylabel = "Lacks Health Care:";
    }
    else if (yAxis === "smokes") {
        ylabel = "Smokers:";
    }
    else {
        ylabel = "Obese:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-15, 0])
        .html(function (d) {
            return (`${d.state}<br><br>${xlabel} ${d[xAxis]}${xtrailer}<br>${ylabel} ${d[yAxis]}%`);
        });
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
        d3.select(this).select("circle")
            .transition()
            .duration(200)
            .style("stroke", "black");
    })
        // event
        .on("mouseout", function (data) {
            toolTip.hide(data);
            d3.select(this).select("circle")
                .transition()
                .duration(1000)
                .style("stroke", "#e3e3e3");
        });
    return circlesGroup;
}

// bringing in data from CSV
d3.csv("assets/data/data.csv").then(function (dataCSV) {
    dataCSV.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // xLinearScale
    var xLinearScale = xScale(dataCSV, xAxis);

    // xLinearScale
    var yLinearScale = yScale(dataCSV, yAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // x axis
    var xAxisvar = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // y axis
    var yAxisvar = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    var circlesGroup = chartGroup
        .selectAll('circle')
        .data(dataCSV)
        .enter()
        .append("g")
        .classed("element-group", true);

    circleElem = circlesGroup
        .append('circle');

    var circlesAttr = circleElem
        .attr("cx", d => xLinearScale(d[xAxis]))
        .attr("cy", d => yLinearScale(d[yAxis]))
        .attr("r", 10)
        .attr("opacity", "1.0")
        .classed("stateCircle", true);

    circlesGroup
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[xAxis]))
        .attr("y", d => yLinearScale(d[yAxis]))
        .attr("dy", ".35em")
        .attr("font-size", "7px")
        .text(function (d) {
            return d.abbr;
        });

    // group for x-axis labels
    var xlabels = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var povertyLabel = xlabels.append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabels.append("text")
        .attr("x", 0)
        .attr("y", 36)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabels.append("text")
        .attr("x", 0)
        .attr("y", 54)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    // y-labels group
    var ylabels = chartGroup.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top / 2})`);

    var healthLabel = ylabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 45)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") 
        .classed("active", true)
        .text("Lacks Health Care (%)");

    var smokesLabel = ylabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 65)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokers (%)");

    var obesityLabel = ylabels.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 85)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Obese (%)");

    // update ToolTip function
    var circlesGroup = updateToolTip(xAxis, yAxis, circlesGroup);

    // event listener for x axis labels
    xlabels.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");
            if (value !== xAxis) {
                xAxis = value;
                console.log("3 X Axis--> ", xAxis);
                xLinearScale = xScale(dataCSV, xAxis);
                xAxis1 = showXAxis(xLinearScale, xAxis1);
                circlesAttr = xCircles(circlesAttr, xLinearScale, xAxis);

                // updates text for circles with new x values
                circlesGroup = xText(circlesGroup, xLinearScale, xAxis);

                // updates tooltips with new info
                console.log("5 xAxis --> ", xAxis);

                circlesGroup = updateToolTip(xAxis, yAxis, circlesGroup);

                // changes classes to change bold text

                if (xAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

                else if (xAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

            }

        });

    // y axis labels event listener
    ylabels.selectAll("text")
        .on("click", function () {
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== yAxis) {
                yAxis = yvalue;

                console.log("3-y Chosen-y Axis--> ", yAxis);

                yLinearScale = yScale(dataCSV, yAxis);

                // updates y axis with transition
                yAxis1 = showYAxis(yLinearScale, yAxis1);

                // updates circles with new x values
                circlesAttr = renderYCircles(circlesAttr, yLinearScale, yAxis);

                // updates text for circles with new x values
                circlesGroup = renderYText(circlesGroup, yLinearScale, yAxis);

                // updates tooltips with new info
                console.log("5-y yAxis --> ", yAxis);
                circlesGroup = updateToolTip(xAxis, yAxis, circlesGroup);

                // changes classes to change bold text
                if (yAxis === "healthcare") {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

                else if (yAxis === "smokes") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }

                else {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

            }

        });

}).catch(function (error) {
    console.log(error);
});

