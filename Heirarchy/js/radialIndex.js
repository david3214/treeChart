var width = 1000,
  height = 1000
var radius = 400
var duration = 500
let id = 0
let root // store data in a variable accessible by all functions

let tree = data =>
  d3
    .tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(
    d3.hierarchy(data)
  )

let cluster = d3.cluster().size([height, width - 160])

let diagonal = d3
  .linkHorizontal()
  .x(function(d) {
    return d.y
  })
  .y(function(d) {
    return d.x
  }) /* d3.svg.diagonal().projection(function(d) {
  return [d.y, d.x]
}) */

let radialTree = d3
  .tree()
  .size([360, radius])
  .separation(function(a, b) {
    return (a.parent == b.parent ? 1 : 2) / a.depth
  })

let radialCluster = d3
  .cluster()
  .size([360, radius])
  .separation(function(a, b) {
    return (a.parent == b.parent ? 1 : 2) / a.depth
  })

let linkRadial = d3
  .linkRadial()
  .angle(function(d) {
    return d.x
  })
  .radius(function(d) {
    return d.y
  }) /* d3.svg.diagonal.radial().projection(function(d) {
  return [d.y, (d.x / 180) * Math.PI]
}) */

let svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`)
let node, link

d3.json('./js/data1.json').then(data => {
  // Assigns parent, children, height, depth
  console.log(data)
  // let newdata = d3.stratify().id(d => d.memberId)
  // const test = d3.hierarchy(data)
  // root = {
  //   ...test,
  //   x0: test.x,
  //   y0: test.y
  // }
  root = d3.hierarchy(data)

  root.x0 = 0
  root.y0 = 0

  // console.log('test', root)
  // root.xk = root.x
  // root.yk = root.y

  collapse(root)
  updateHeightDepth(root, 0)
  transitionToRadialTree(root)
})

function transitionToRadialTree(source) {
  console.log({ root, source })

  console.log(root.height)
  // radialTree.size([360, radius * root.height])
  let treeMap = radialTree(root)

  let nodes = treeMap.descendants(), // recalculate layout
    links = treeMap.descendants().slice(1)

  svg
    .transition()
    .duration(duration)
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
  // set appropriate translation (origin in middle of svg)

  node = svg.selectAll('g.node').data(nodes, d => (d.id ? d.id : (d.id = ++id)))

  let nodeEnter = node
    .enter()
    .append(`g`)
    .attr(`class`, `node`)
    .attr('transform', d => `translate(${project(source.x0, source.y0)})`)
  // `rotate(${(source.x0 * 180) / Math.PI - 90}) translate(${source.y0},0)`

  nodeEnter
    .append('circle')
    .attr('r', 4.5)
    .style('stroke', '#e41a1c')
    .style('fill', d => (d._children ? 'blue' : 'white'))
    .on('click', d => clickNode(d))

  nodeEnter
    .append('text')
    .attr('dy', '.31em')
    .attr('x', function(d) {
      return d.x < 180 ? -6 : 6
    })
    .style('text-anchor', function(d) {
      return d.x < 180 ? 'end' : 'start'
    })
    .attr('transform', function(d) {
      return 'rotate(' + (d.x < 180 ? d.x - 90 : d.x + 90) + ')'
    })
    .text(d => d.data.name)

  let nodeUpdate = nodeEnter.merge(node)

  nodeUpdate
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      // return `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      return `translate(${project(d.x, d.y)})`
    })

  nodeUpdate
    .select('circle')
    .style('fill', d => (d._children ? 'blue' : 'white'))

  node.exit().remove()

  link = svg.selectAll('.link').data(links)

  let linkEnter = link
    .enter()
    .insert('path', 'g')
    .attr('class', 'link')
  // .attr('d', function(d, i) {
  //   console.log({ source, sourceX: source.x })
  //   linkRadial(source, i)
  // })

  linkEnter.style('stroke', '#ccc').attr('d', function(d, i) {
    // console.log({ source, sourceX: source.x })
    // linkRadial(source, i)
    let o = { x: source.x0, y: source.y0 }
    return path(o, o)
  })

  let linkUpdate = linkEnter.merge(link)

  linkUpdate
    .transition()
    .duration(duration)
    .style('stroke', '#ccc')
    // .attr('d', linkRadial) //get the new radial path
    .attr('d', d => path(d, d.parent))

  link
    .exit()
    .transition()
    .duration(duration)
    .attr('d', () => path(source, source))
    .remove()

  // node
  //   .select('circle')
  //   .transition()
  //   .duration(duration)
  //   .style('stroke', '#984ea3')

  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })
}

function project(x, y) {
  var angle = ((x - 90) / 180) * Math.PI,
    radius = y
  return [radius * Math.cos(angle), radius * Math.sin(angle)]
}
function path(s, d) {
  // console.log({ s, d })
  return (
    'M' +
    project(s.x, s.y) +
    'C' +
    project(s.x, (s.y + d.y) / 2) +
    ' ' +
    project(s.depth === 1 ? s.x : d.x, (s.y + d.y) / 2) +
    ' ' +
    project(s.depth === 1 ? s.x : d.x, d.y)
  )
}

function clickNode(selected) {
  if (selected._children) {
    selected.children = selected._children
    selected._children = null
  } else if (selected.children) {
    selected._children = selected.children
    selected.children = null

    // this.updateGraph({ source: selected, center: true })
    // this.graph.centerNode(selected)
  }
  updateHeightDepth(root, 0)
  transitionToRadialTree(selected)
}

function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function updateHeightDepth(current, depth) {
  current.depth = depth
  let height = 0
  if (current.children) {
    let children = current.children
    let heights = []
    for (let i = 0; i < children.length; ++i) {
      heights.push(updateHeightDepth(children[i], depth + 1))
    }
    height = Math.max(...heights, height) + 1
  }
  current.height = height
  return height
}
