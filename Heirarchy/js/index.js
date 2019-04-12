
var treeInfo =
{
	name: "Joe",
	values: {
		title: "Root",
		information: "Found at the base",
		data: "23000"
	},
	children: [
		{
			name: "Fred",
			values: {
				title: "Fred, Level 2",
				information: "First Child of Root",
				data: "2000"
			},
			children: [
				{
					name: "Jeremy",
					values: {
						title: "Jeremy, Level 3",
						information: "First Child of Fred",
						data: "200"
					},
					children: [
						{
							name: "Jill",
							values: {
								title: "Jill, Level 4",
								information: "First Child of Jeremy",
								data: "150"
							},
						},
					]
				},
				{
					name: "Jenifer",
					values: {
						title: "Jenifer, Level 3",
						information: "Second Child of Fred",
						data: "220"
					},
				},
				{
					name: "Jim",
					values: {
						title: "Jim, Level 3",
						information: "Third Child of Fred",
						data: "180"
					},
				},
			]
		},
		{
			name: "Jerry",
			values: {
				title: "Jerry, Level 2",
				information: "2nd Child of Joe",
				data: "3000"
			},
		},
	]
}

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom

//Initialize variables used for pinning members
let pinned, firstPin = true

var runningId = 0,
	duration = 750

d3.json('./js/data.json').then(data=>{
	console.log(data)
})

// append the svg object to the body of the page
// give the svg the ability to zoom and pan
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
	.call(d3.zoom().on("zoom", function () {
    svg.attr("transform", d3.event.transform)
	}))
	.append("g")
	.attr("transform", "translate("
				+ margin.left + "," + margin.top + ")")

//Append the image of the pin to the svg
const pinImage = svg.append('image')
	.attr('class', 'pinImage')
	.attr('xlink:href', "pin.png")
	.style('opacity', '0')

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width])

// Assigns parent, children, height, depth
let root = d3.hierarchy(treeInfo, d=>d.children)
root.x0 = height / 2
root.y0 = 0

// Collapse after the second level
root.children.forEach(collapse)

var treeData = treemap(root)

pin(root)
update(root, root)

// Collapse the node and all it's children
function collapse(d) {
	if(d.children) {
		d._children = d.children
		d._children.forEach(collapse)
		d.children = null
	}
}


function update(source) {
	// let newHeight = height
	// let newWidth = 300
	// treemap = d3.tree().size([newHeight, newWidth])

	// Assigns the x and y position for the nodes
	treeData = treemap(root)

	console.log({root, source})

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1)

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * (root.height < 4 ? width/root.height : width / 4)})

  // ****************** Nodes ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, d=> d.id || (d.id = ++runningId))

	updateNodes(source, node)

  // ****************** Links ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id })

	updateLinks(source, link)

	// ****************** Pinned **************************
	updatePinned()

	// Store the old positions for transition.
	nodes.forEach(function(d){
		d.x0 = d.x
		d.y0 = d.y
	})
}



function updateDisplay(values){
	let display = d3.select(`#display`)

	display.select(`h1`).text(values.title)
	display.select(`p.info`).text(values.information)
	display.select(`p.numbers`).text(d3.format(`$,`)(values.data))
}

function updateHeightDepth(current, depth){
	current.depth = depth
	let height = 0
	if (current.children || current._children) {
		let children = current.children || current._children
		let heights = []
		for(let i = 0; i < children.length; ++i)
			heights.push(updateHeightDepth(children[i], depth + 1))
		height = Math.max(...heights, height) + 1
	}
	current.height = height
	return height
}

function pin(node){

	if(pinned != node){
		pinned = node
		updateDisplay(pinned.data.values)
	}else{
		firstPin = true
		pinned = false
	}
}

function parentOfPinned(selected, pinnedParent){
	console.log({selected, pinnedParent, pinned})
	if(pinned == selected || !pinnedParent || pinned == root)
		return false
	else if(pinnedParent == selected)
		return true
	else 
		return parentOfPinned(selected, pinnedParent.parent)
}

function updateNodes(source, node){
	// Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")"
    })
		.on('click', click)
		// .on(`mouseover`, d=>updateDisplay(d.data.values))

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", d=>d._children ? "lightsteelblue" : "#fff")

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", d=>d.children || d._children ? -13 : 13)
      .attr("text-anchor", d=> d.children || d._children ? "end" : "start")
      .text(d=>d.data.name)

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node)

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", d=>"translate(" + d.y + "," + d.x + ")")

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
			if(d._children)
				return "#92Ca91"
			else if (d.data.color)
				return d.data.color
			else 
				return "#fff"
    })
    .attr('cursor', 'pointer')

  // Remove any exiting nodes
  var nodeExit = node.exit()
      .remove()

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6)

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
		.style('fill-opacity', 1e-6)
}

function updateLinks(source, link){
	// Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
			})

  // UPDATE
  var linkUpdate = linkEnter.merge(link)

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
			.attr('d', function(d){ return diagonal(d, d.parent) })

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
			.remove()
			
	// Creates a curved (diagonal) path from parent to the child nodes
	function diagonal(s, d) {

		path = `M ${s.y} ${s.x}
						C ${(s.y + d.y) / 2} ${s.x},
							${(s.y + d.y) / 2} ${d.x},
							${d.y} ${d.x}`

		return path
	}
}

function updatePinned(){
	//Display pin image next to pinned Node
	if(pinned){
		if(firstPin){
			firstPin = !firstPin
			pinImage.style('x', `${pinned.y - 42}px`)
				.style('y', `${pinned.x - 42}px`)
				.transition()
				.duration(duration)
				.style('opacity', '1')
			
		}else{
			pinImage.transition()
				.duration(duration)
				.style('x', `${pinned.y - 42}px`)
				.style('y', `${pinned.x - 42}px`)
		}
	} else
		pinImage.transition()
			.duration(duration)
			.style('opacity', '0')
}

// Toggle children on click.
function click(selected) {
	if(d3.event && d3.event.shiftKey)
		pin(selected)
	else if(parentOfPinned(selected, pinned.parent))
		return
	else if (selected.children) {
		selected._children = selected.children
		selected.children = null
	} else if(selected._children){
		selected.children = selected._children
		selected._children = null
	} else if (selected.data.color !== 'red'){
		let randomNum = Math.floor(Math.random() * 3)
		if(randomNum < 1){
			newChild = {
				name: "Fred",
				values: {
					title: "Fred, Level 2",
					information: ". . .",
					data: "2000"
				},
				children: [
					{
						name: "Jeremy",
						values: {
							title: "Jeremy, Level 3",
							information: "First Child of Fred",
							data: "200"
						},
					},
					{
						name: "Jill",
						values: {
							title: "Jill, Level 4",
							information: "First Child of Jeremy",
							data: "150"
						},
					},
				]
			}
			let newNode = d3.hierarchy(newChild, d=>d.children)
			newNode.depth = selected.depth + 1
			newNode.height = selected.height - 1
			newNode.parent = selected

			selected.children = []
			selected.data.children = []

			//Push it to parent.children array  
			selected.children.push(newNode);
			selected.data.children.push(newNode.data);

			updateHeightDepth(root, 0)

			selected.children.forEach(collapse)
		} else {
			selected.data.color = 'red'
		}

	}
	update(selected)
}