var data, base,
    months = ['January', 'February', 'March', 'April',
          'May', 'June', 'July', 'August',
          'September', 'October', 'November', 'December'];

var getTemp = function(base, variance) {
    var temp = Number(base) + Number(variance)
    return temp;
}

var margin = { top: 20, right: 20, bottom: 100, left: 70},
    width = 1100 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var colors = ['rgb(38, 92, 29)', 'rgb(17, 207, 45)', 'rgb(171, 213, 5)',
              'rgb(235, 240, 5)', 'rgb(218, 183, 0)', 'rgb(223, 123, 6)',
              'rgb(221, 80, 1)', 'rgb(200, 40, 0)', 'rgb(200, 0, 0)'];

var x = d3.time.scale()
    .rangeRound([0, width]);

var y = d3.time.scale()
    .rangeRound([0, height]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(d3.time.year, 25)

var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .ticks(d3.time.month, 1)
    .tickFormat(d3.time.format('%B'))

var chart = d3.select('.chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('class', 'container')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var div = d3.select('body')
    .append('div')
    .attr('class', 'info')
    .style('opacity', 0)

d3.json('global-temperature.json', function(error, json) {
    if (error) return console.warn(error);

    var base = json.baseTemperature
    data = json.monthlyVariance;

    var firstYear = d3.min(data, function(d) { return d.year });
    var lastYear = d3.max(data, function(d) { return d.year });

    var highTemp = d3.max(data, function(d) { return d.variance }) + base;
    var lowTemp = d3.min(data, function(d) { return d.variance }) + base;
    var colorSpan = (highTemp - lowTemp) / colors.length;

    var offset = Math.ceil(height / 12);
    var boxHeight = offset * 1.084
    var boxWidth = Math.ceil(width / (lastYear - firstYear));

    x.domain([
        d3.min(data, function(d) {
            var date = new Date(d.year, 1, 1)
            return date;
        }),
        d3.max(data, function(d) {
            var date = new Date(d.year, 1, 1)
            return date;
        })
    ]);
    y.domain([
        d3.min(data, function(d) {
            var date = new Date(null, 0, 1)
            return date;
        }),
        d3.max(data, function(d) {
            var date = new Date(null, 11, 1)
            return date;
        })
    ]);
    chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height + offset) + ')')
        .call(xAxis)

    chart.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    var yAxisElements = d3.select('.y').selectAll('text')
        .attr('transform', 'translate(0, '+ (boxHeight / 2) + ')')

    var box = chart.selectAll('.data')
        .data(data)
      .enter().append('g')
        .attr('class', 'data')

    var rectangle = box.append('rect')
        .attr('x', function(d) { return x(new Date(d.year, 1, 1)) })
        .attr('y', function(d) { return (d.month - 1) * boxHeight })
        .attr('height', boxHeight)
        .attr('width', boxWidth)
        .style('fill', function(d) {
            var temp = getTemp(base, d.variance)
            var aboveLow = (temp - lowTemp);
            var step = Math.floor(aboveLow / colorSpan);
            if (step > colors.length - 1) {
                step = colors.length - 1;
            }
            return colors[step]
        })
        .on('mouseover', function(d) {
            div .style('opacity', .9)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY + 'px');
            div .html(function() {
                var text = '<strong>' + months[d.month - 1] + ', ' + d.year + '</strong><br>' +
                    getTemp(base, d.variance).toFixed(3) + '&deg; C<br><br>' +
                    'From average:<br>' +
                    d.variance + '&deg; C'
                return text;
            })
        })
        .on('mouseout', function(d) {
            div.style('opacity', 0)
        })

        var key = d3.select('#key')
        colors.forEach(function(element, index) {
            key.append('div')
                .style('background', element)
                .text((lowTemp + index * colorSpan).toFixed(3) + '° C')

        })

})
