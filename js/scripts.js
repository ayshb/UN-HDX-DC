// Empty JS for your own code to be here
console.log(survey_data);
var survey = TAFFY(survey_data);

//choropleth
var width = 900,
    height = 500;

var divNode = d3.select('#map').node();

var projection = d3.geo.mercator()
    .scale(5300)
    .translate([width / 2, height / 2])
    .center([83.985593872070313, 28.465876770019531]);

var path = d3.geo.path().projection(projection);

var svg2 = d3.select("#map").append("svg").attr("width", width).attr("height", height);

d3.json("https://raw.githubusercontent.com/aayushrijal/Nepal-district-topojson/master/nepal-districts.topojson", function(error, ok) {
    var counties = topojson.feature(ok, ok.objects.districts);

    d3.csv("https://raw.githubusercontent.com/aayushrijal/Nepal-district-topojson/master/district.csv", function(data) {
        var valueById = {};
        data.forEach(function(d) {
            valueById[d.district] = d.value;
        });
        //counties
        svg2.append("g")
            .attr("class", "county")
            .selectAll("path")
            .data(counties.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d) {
                if (valueById[d.properties.DISTRICT]) {
                    return "#000";
                    // return color(valueById[d.properties.DISTRICT]);
                }
                return "#ccc";
            });

        var radius = d3.scale.sqrt()
            .domain([0, 1e6])
            .range([0, 20]);

        svg2.selectAll("circle")
            .data(counties.features)
            .enter()
            .append("svg:circle")
            .attr("transform", function(d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function(d) {
                if (valueById[d.properties.DISTRICT]) {
                    // return valueById[d.properties.DISTRICT];
                    return radius(valueById[d.properties.DISTRICT]) * 150;
                }
            })
            .attr("fill", "#FC8D59")
            .attr("opacity", "0.6")
            .on("mousemove", function(d) {
                var absoluteMousePos = d3.mouse(divNode);
                d3.select("#tooltip")
                    .style("left", absoluteMousePos[0] + 10 + "px")
                    .style("top", absoluteMousePos[1] + 15 + "px")
                    .select("#value")
                    .attr("class", "font")
                    .html(function() {
                        return "<strong>" + d.properties.DISTRICT + "</strong> " + "<br>" + "Organization Count: <strong>" + valueById[d.properties.DISTRICT] + "</strong> ";
                    });

                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").classed("hidden", true);
            });

        //county borders
        svg2.append("path").datum(topojson.mesh(ok, ok.objects.districts, function(a, b) {
            return a !== b;
        })).attr("class", "county-border").attr("d", path);
    });
});

//////////////

/////////////


var margin = {
        top: 40,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
    })

var svg1 = d3.select("#demog").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg1.call(tip);

var data = JSON.parse(document.getElementById('data').innerHTML);

//d3.tsv("data.tsv", type, function(error, data) {
x.domain(data.map(function(d) {
    return d.letter;
}));
y.domain([0, d3.max(data, function(d) {
    return d.frequency;
})]);

svg1.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg1.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Frequency");

svg1.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
        return x(d.letter);
    })
    .attr("width", x.rangeBand())
    .attr("y", function(d) {
        return y(d.frequency);
    })
    .attr("height", function(d) {
        return height - y(d.frequency);
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

//});

function type(d) {
    d.frequency = +d.frequency;
    return d;
}
