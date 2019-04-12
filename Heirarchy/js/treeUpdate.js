function update(source, root) {
	// let newHeight = height
	// let newWidth = 300
	// treemap = d3.tree().size([newHeight, newWidth])

	// Assigns the x and y position for the nodes
	treeData = treemap(root)

	console.log({ root, source })

	// Compute the new tree layout.
	var nodes = treeData.descendants(),
		links = treeData.descendants().slice(1)

	// Normalize for fixed-depth.
	nodes.forEach(function (d) { d.y = d.depth * (root.height < 4 ? width / root.height : width / 4) })

	// ****************** Nodes ***************************

	// Update the nodes...
	var node = svg.selectAll('g.node')
		.data(nodes, d => d.id || (d.id = ++runningId))

	updateNodes(source, node)

	// Store the old positions for transition.
	nodes.forEach(function (d) {
		d.x0 = d.x
		d.y0 = d.y
	})

	// ****************** Links ***************************

	// Update the links...
	var link = svg.selectAll('path.link')
		.data(links, function (d) { return d.id })

	updateLinks(source, link)

	// ****************** Pinned **************************
	updatePinned()
}