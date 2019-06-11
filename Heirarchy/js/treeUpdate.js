import { height, width, svg, duration, root, zoomer, zoom } from './index.js'
import { updatePinned, checkParentOfPinned } from './pin.js'
import { menuFunc } from './displayData.js'

var runningId = 0,
  realWidth = 960,
  realHeight = 500

export function update(source) {
  // let treemap = d3.tree()
  // 	.nodeSize([30,])
  // 	.separation((function separation(a, b) {
  // 		console.log({a, b})
  // 			return 1
  // 	}))

  let treemap = d3.tree().size([width, height])

  // Assigns the x and y position for the nodes
  let treeData = treemap(root)

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1)

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    // return (d.y = d.depth * 100)
    return (d.y = (d.depth * width) / 4)
  })

  // ****************** Nodes ***************************

  // Update the nodes...
  var node = svg
    .selectAll('g.node')
    .data(nodes, d => d.id || (d.id = ++runningId))

  updateNodes(source, node, root)

  // ****************** Links ***************************

  // Update the links...
  var link = svg.selectAll('path.link').data(links, function(d) {
    return d.id
  })

  updateLinks(source, link)

  // ****************** Pinned **************************
  updatePinned()

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })
}

function updateNodes(source, node, root) {
  // Enter any new modes at the parent's previous position.
  var nodeEnter = node
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + source.x0 + ',' + source.y0 + ')'
    })
    // .attr('transform', function(d) {
    //   return 'translate(' + source.y0 + ',' + source.x0 + ')'
    // })
    .on('click', click)
    .on('contextmenu', (d, i) => {
      //d3.contextMenu returns a function, normally the on function would then call it,
      // but we're already inside that function
      d3.contextMenu(menuFunc(d))(d, i)
    })

  // Add Circle for the nodes
  nodeEnter
    .append('circle')
    .attr('class', 'node')
    .attr('r', 1e-6)
    .style('fill', d => (d._children ? 'lightsteelblue' : '#fff'))

  // Add labels for the nodes
  nodeEnter
    .append('text')
    .attr('dy', '.35em')
    .attr('x', d => (d.children || d._children ? -13 : 13))
    .attr('text-anchor', d => (d.children || d._children ? 'end' : 'start'))
    .text(d => d.data.name)

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node)

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
  // .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')')

  // Update the node attributes and style
  nodeUpdate
    .select('circle.node')
    .attr('r', 10)
    .style('fill', function(d) {
      if (d._children) return '#92Ca91'
      else if (d.data.leaf) return 'red'
      else return '#fff'
    })
    .attr('cursor', 'pointer')

  // Remove any exiting nodes
  var nodeExit = node.exit().remove()

  // On exit reduce the node circles size to 0
  nodeExit.select('circle').attr('r', 1e-6)

  // On exit reduce the opacity of text labels
  nodeExit.select('text').style('fill-opacity', 1e-6)

  // Toggle children on click.
  function click(selected) {
    if (selected._children) {
      selected.children = selected._children
      selected._children = null
    } else if (checkParentOfPinned(selected)) return
    else if (selected.children) {
      selected._children = selected.children
      selected.children = null
    }
    update(selected)

    centerNode(selected)
  }
}

export function updateLinks(source, link) {
  // Enter any new links at the parent's previous position.
  var linkEnter = link
    .enter()
    .insert('path', 'g')
    .attr('class', 'link')
    .attr('d', function(d) {
      var o = { x: source.x0, y: source.y0 }
      return diagonal(o, o)
    })

  // UPDATE
  var linkUpdate = linkEnter.merge(link)

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(duration)
    .attr('d', function(d) {
      return diagonal(d, d.parent)
    })

  // Remove any exiting links
  var linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = { x: source.x, y: source.y }
      return diagonal(o, o)
    })
    .remove()

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {
    // let path = `M ${s.y} ${s.x}
    // 				C ${(s.y + d.y) / 2} ${s.x},
    // 					${(s.y + d.y) / 2} ${d.x},
    // 					${d.y} ${d.x}`
    // let path = `M ${s.x} ${s.y}
    // 				C ${s.x} ${(s.y + d.y) / 2},
    //           ${d.x} ${s.y},
    // 					${d.x} ${d.y}`
    let path = `M ${s.x} ${s.y}
    				C ${s.x} ${(s.y + d.y) / 2},
    					${d.x} ${(s.y + d.y) / 2},
    					${d.x} ${d.y}`
    return path
  }
}

export function updateHeightDepth(current, depth) {
  current.depth = depth
  let height = 0
  if (current.children || current._children) {
    let children = current.children || current._children
    let heights = []
    for (let i = 0; i < children.length; ++i)
      heights.push(updateHeightDepth(children[i], depth + 1))
    height = Math.max(...heights, height) + 1
  }
  current.height = height
  return height
}

function centerNode(source) {
  let x = -source.x0
  let y = -source.y0
  x = x + realWidth / 2
  y = y + realHeight / 3
  zoomer
    .transition()
    .duration(duration)
    .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(1))
}
