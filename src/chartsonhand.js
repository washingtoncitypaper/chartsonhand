// Charts On Hand version 1.0.0

// the url hash indicates which chart to display
var chart_id = window.location.hash.substring(1);

// keep iframe free of scrollbars and margins
$('html').css('overflow','hidden');
$('body').css('margin','0');

// make chart container
d3.select('body').append('div')
	.attr('id','container')
	.style('font-family','"Open Sans", sans-serif')
	.style('display','block')
	.style('margin','0 auto')
	.style('max-width','700px')
	.style('cursor','default')
	.text('Loading...');

function drawChart(sheet) {

	// erase container contents, in case chart has been drawn and is now being redrawn
	$('#container').empty();

	// get data related to this chart_id only
	function filter_by_chart_id(value) {
		return value.chart_id == chart_id;
	}
	var candidate_data = sheet.data.elements.filter(filter_by_chart_id), // get all candidates for this chart
		chart_info = sheet.charts.elements.filter(filter_by_chart_id)[0]; // get the metadata for this chart

	var chartProps = [
		{type: 'raised', display: 'Raised', color: '#3D9970'},
		{type: 'spent', display: 'Spent', color: '#c62828'},
		{type: 'on_hand', display: 'Cash on hand', color: '#0074D9'}
	];

	var max = chart_info.max_dollars;

	// get the highest dollar number that will appear in the chart
	if (max == "auto" || !max) {
		var each_max = [];
		for (var i = 0; i < chartProps.length; i++) {
			var this_type = chartProps[i].type;
			var this_max = d3.max(candidate_data, function(d) {return standardizeNumbers(d[this_type]);});
			each_max.push(this_max);
		}
		max = d3.max(each_max);
	} else {
		max = Number(max);
	}

	var margin = {left: 15}, // svg margin
		title_margin = {top: 5},
		legend_margin = {top: 10, bottom: 2}
		cluster_margin = {top: 20, bottom: 25}; // margins around bar clusters
		

	var svg_width_percent = 0.95, // percent of container width
		width = Math.round($('#container').width() * svg_width_percent), // svg width
		bar_max_width = 0.9 * width, // max width of rectangles in chart
		bar_height = 24, // height of rectangles in chart
		bar_margin = 2, // margin below each rectangle
		cluster_height = (bar_height + bar_margin) * chartProps.length + cluster_margin.top + cluster_margin.bottom, // total height of a single cluster
		label_height = Math.round(bar_height / 2) + 1, // size of main text labels
		caption_height = 30; // size of caption container


	var scale = d3.scale.linear().domain([0,max]).range([0,bar_max_width]); // scale for bar chart rectangles

	$('#container').append('<div id="chart_title_container"></div>');
	$('#chart_title_container').css('width', width + 'px').css('background-color','#f1f1f1');

	// title is not in svg so that line-breaking long titles is simpler
	$('#chart_title_container').append('<div id="chart_title">' + chart_info.title + '</div>');
	$('#chart_title')
		.css('display','block')
		.css('margin','auto')
		.css('width', width * 0.9 + 'px')
		.css('text-align','center')
		.css('font-size','18px')
		.css('line-height','22px')
		.css('font-weight','bold');

	var svg = d3.select('#container')
		.append('svg')
		.attr('width', width)
		.style('display','block')
		.style('padding','0')
		.style('margin','0');

	var background = svg.append('rect').attr('x','0').attr('y','0').attr('width', width).attr('fill','#f1f1f1');

	var legend = svg.append('g').attr('id','legend');

	var legend_height = (bar_height / 2 + bar_margin) * (chartProps.length) + legend_margin.top + legend_margin.bottom;
	var pre_caption_height = cluster_height * candidate_data.length + legend_height;

	var caption = svg.append('g').attr('id','caption');

	caption.append('rect')
		.attr('width', width)
		.attr('height', caption_height)
		.attr('x','0')
		.attr('y', pre_caption_height)
		.attr('fill', function(){
			base_color = background.attr('fill');
			return d3.rgb(base_color).darker();
		});

	caption.append('text')
		.text(chart_info.caption)
		.attr('text-anchor', 'end')
		.attr('x', width * 0.97)
		.attr('y', pre_caption_height + caption_height / 2)
		.attr('alignment-baseline','middle')
		.attr('dominant-baseline','middle')
		.style('font-size','12px')
		.style('font-style','italic')
		.style('fill','white');

	var svg_height = pre_caption_height + caption_height;

	svg.attr('height', svg_height);
	background.attr('height', svg_height);

	var legend_bars = legend.append('g').attr('id','legend_bars');
	for (var i = 0; i < chartProps.length; i++) {
		var prop = chartProps[i];
		legend_bars.append('rect')
			.attr('fill', function(d) {return prop.color} )
			.attr('height', bar_height / 2)
			.attr('width','20')
			.attr('y', i * (bar_height / 2 + bar_margin))
			.attr('x', width / 2.2 - 20);
		legend_bars.append('text')
			.text(prop.display)
			.attr('text-anchor','start')
			.attr('x', width / 2.2 + 2)
			.attr('y', i * (bar_height / 2 + bar_margin) + ((bar_height / 2 + bar_margin) / 2))
			.attr('alignment-baseline','middle')
			.attr('dominant-baseline','middle')
			.style('font-size', (label_height - 2) + 'px')
	}	
	legend_bars.attr('transform','translate(0,' + legend_margin.top + ')');

	var candidates = svg.append('g').attr('id','candidates').attr('transform','translate(' + margin.left + ',' + legend_height + ')');
	var candidate = candidates.selectAll('.candidate').data(candidate_data).enter().append('g').attr('class','candidate');
	candidate.attr('transform',function(d,i) {
		return 'translate(0,' + i * cluster_height + ')';
	});
	candidate.append('text')
		.text(function(d) {return d.candidate_name})
		.attr('x','0')
		.attr('y',label_height + 2)
		.style('font-weight','bold')
		.style('font-size', (label_height + 2) + 'px');
	
	var bars = candidate.append('g').attr('class','bars')
		.attr('transform',function(d,i) {
			return 'translate(0,' + cluster_margin.top + ')';
		});

	for (var i = 0; i < chartProps.length; i++) {
		var prop = chartProps[i];
		bars.append('rect')
			.attr('fill', function(d) {return prop.color} )
			.attr('width', function(d) {
				var number = standardizeNumbers(d[prop.type]);
				return scale(number);
			})
			.attr('height', bar_height)
			.attr('x','0')
			.attr('y', i * (bar_height + bar_margin));
		bars.append('text')
			.text(function(d) {
				var number = standardizeNumbers(d[prop.type]);
				return '$' + commaSeparateNumber(number);
			})
			.attr('x', function(d) {
				var number = standardizeNumbers(d[prop.type]);
				return scale(number);
			})
			.attr('y', i * (bar_height + bar_margin) + label_height)
			.attr('text-anchor','start')
			.attr('fill', function(d) {return prop.color} )
			.attr('transform','translate(2)')
			.attr('alignment-baseline','middle')
			.attr('dominant-baseline','middle')
			.style('font-size',label_height + 'px');
	}

	d3.selectAll('.bars text').each(function(){
		var text_length = this.getComputedTextLength();
		var rect_width = $(this).prev('rect').attr('width');
		// if the text label is less than half as wide as the rectangle, put the label inside the rectangle
		if (text_length < rect_width * 0.5) {
			d3.select(this).attr('text-anchor','end').attr('fill','white').attr('transform','translate(-3)');
		}
	});

	// make sure parent iframe is as tall as the chart
	var total_height = $('#chart_title').height() + svg_height;
	$('#chartsonhand_' + chart_id, window.parent.document).css('height', total_height + 'px');		

}

function standardizeNumbers(val) {
	// get rid of dollar signs and commas, then round
	var clean = val.replace(/[^0-9\.]+/g, '');
	return Math.round(clean);
}

function commaSeparateNumber(val) {
	// add thousand-separating commas
	while (/(\d+)(\d{3})/.test(val.toString())){
		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	}
	return val;
}

function init() {
	// get data from Google Sheets and draw chart
	Tabletop.init( { key: tabletop_key,
					callback: function(data, tabletop) { drawChart(data) },
					simpleSheet: false } )
}

init();

var windowWidth = $(window).width();

// redraw chart if window size changes
function redrawChart() {
	if ($(window).width() != windowWidth) {
		init();
		windowWidth = $(window).width();
	}
}

$(window).resize(function() {
	redrawChart();
});

$(window).on('orientationchange', function(event) {
	redrawChart();
});