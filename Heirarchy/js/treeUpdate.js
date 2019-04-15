import {height, width, svg, collapse, duration} from './index.js'
import {updatePinned, pin, parentOfPinned, pinned} from './pin.js'

var runningId = 0

export function update(source, root) {

	let treemap = d3.tree().size([height, width])

	// Assigns the x and y position for the nodes
	let treeData = treemap(root)

	console.log({ root, source })

	// Compute the new tree layout.
	var nodes = treeData.descendants(),
		links = treeData.descendants().slice(1)

	// Normalize for fixed-depth.
	nodes.forEach(function (d) {return d.y = d.depth * width / 4})

	// ****************** Nodes ***************************

	// Update the nodes...
	var node = svg.selectAll('g.node')
		.data(nodes, d => d.id || (d.id = ++runningId))

	updateNodes(source, node, root)

	// ****************** Links ***************************

	// Update the links...
	var link = svg.selectAll('path.link')
		.data(links, function (d) { return d.id })

	updateLinks(source, link)

	// ****************** Pinned **************************
	updatePinned()

	// Store the old positions for transition.
	nodes.forEach(function (d) {
		d.x0 = d.x
		d.y0 = d.y
	})
}

function updateNodes(source, node, root){
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


	// Toggle children on click.
	function click(selected) {
		if(d3.event && d3.event.shiftKey)
			pin(selected)
		else if(parentOfPinned(selected, pinned.parent, root))
			return
		else if (selected.children) {
			selected._children = selected.children
			selected.children = null
		} else if(selected._children){
			selected.children = selected._children
			selected._children = null
		} else if (selected.data.color !== 'red'){
			let randomNum = Math.floor(Math.random() * 1)
			if(randomNum < 1){
				let newChild = {
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
		update(selected, root)
	}
}

export function updateLinks(source, link){
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

		let path = `M ${s.y} ${s.x}
						C ${(s.y + d.y) / 2} ${s.x},
							${(s.y + d.y) / 2} ${d.x},
							${d.y} ${d.x}`

		return path
	}
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