import {update} from './treeUpdate.js'
import {pin} from './pin.js'

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90}, width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom

//Initialize variables used for pinning members

let	duration = 750

// append the svg object to the body of the page
// give the svg the ability to zoom and pan
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
	.call(d3.zoom().on("zoom", function () {
    svg.attr("transform", d3.event.transform)
	}))
	.append("g")
	.attr('id', 'graph')
	.attr("transform", "translate("
				+ margin.left + "," + margin.top + ")")

//Append the image of the pin to the svg
const pinImage = svg.append('image')
	.attr('class', 'pinImage')
	.attr('xlink:href', "pin.png")
	.style('opacity', '0')

d3.json('./js/data.json').then(data=>{
	// Assigns parent, children, height, depth
	let root = d3.hierarchy(data, d=>d.children)
	root.x0 = height / 2
	root.y0 = 0

	// Collapse after the second level
	root.children.forEach(collapse)

	pin(root)
	update(root, root)

})

// Collapse the node and all it's children
function collapse(d) {
	if(d.children) {
		d._children = d.children
		d._children.forEach(collapse)
		d.children = null
	}
}

export {
	width,
	height,
	duration,
	svg,
	pinImage,
	collapse
}