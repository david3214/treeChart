import { update } from './treeUpdate.js'
import { pin } from './pin.js'
import { updateDisplay } from './displayData.js'

// Set the dimensions and margins of the diagram
var margin = { top: 20, right: 90, bottom: 30, left: 90 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  realWidth = 960,
  realHeight = 500

let duration = 750

let root = null

var zoom = d3
  .zoom()
  // .scaleExtent([0.3, 2])
  .on('zoom', zoomed)

function zoomed() {
  svg.attr('transform', d3.event.transform)
}

let svgContainer = d3
  .select(`body`)
  .append(`svg`)
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom)
  .on('contextmenu', () => d3.event.preventDefault())

let zoomer = svgContainer
  .append('rect')
  .attr('width', realWidth)
  .attr('height', realHeight)
  .style('fill', 'none')
  .style('pointer-events', 'all')
  .call(zoom)

// let svgZoom = d3
//   .select('body')
//   .append('svg')
//   .call(
//     d3.zoom().on('zoom', function() {
//       svgZoom.attr('transform', d3.event.transform)
//     })
//   )
//   .append('g')

let svg = svgContainer
  .append('g')
  .attr('id', 'graph')
  .attr(`transform`, `translate(${(width / 2, height / 2)})`)

//Append the image of the pin to the svg
const pinImage = svg
  .append('image')
  .attr('class', 'pinImage')
  .attr('xlink:href', 'pin.png')
  .style('opacity', '0')

updateDisplay({})

d3.json('./js/data.json').then(data => {
  // Assigns parent, children, height, depth
  console.log(data)
  // let newdata = d3.stratify().id(d => d.memberId)
  root = d3.hierarchy(data, d => d.children)
  root.x0 = 0
  root.y0 = realWidth / 2

  // Collapse after the second level
  root.children.forEach(collapse)

  pin(root)
  update(root)
})

// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

export { width, height, duration, svg, pinImage, collapse, root, zoomer, zoom }
