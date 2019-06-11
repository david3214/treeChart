//Display Variables
let margin = { top: 20, right: 90, bottom: 30, left: 90 },
  width = 1000,
  height = 500,
  imageRadius = 30

//Pin variables
let pinned,
  firstPin = true

let duration = 750
let root = null

let runningId = 0

let treemap = d3.tree().size([height, width])

let svgZoom = d3
  .select('body')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('width', '75%')
  .style('max-height', '500px')
  .on('contextmenu', () => d3.event.preventDefault())
  .call(
    d3.zoom().on('zoom', function() {
      svgZoom.attr('transform', d3.event.transform)
    })
  )
  .on('dblclick.zoom', null)
  .append('g')

let svg = svgZoom
  .append('g')
  .attr('id', 'graph')
  .attr('transform', 'translate(' + width / 2 + ',' + 0 + ')')

//Append the image of the pin to the svg
const pinImage = svg
  .append('image')
  .attr('class', 'pinImage')
  .attr('xlink:href', 'pin.png')
  .style('opacity', '0')

updateDisplay()

let fetchedData = fetchData()

root = d3.hierarchy(fetchedData, d => d.children)
root.x0 = height / 2
root.y0 = 0

// Collapse after the second level
root.children.forEach(collapse)

pin(root)
update(root)

// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

//------------------- Updates ------------------------

function update(source) {
  console.log({ root })
  var newHeight = Math.max(root.descendants().reverse().length * 55, height)

  treemap = d3.tree().size([newHeight, width])

  // Assigns the x and y position for the nodes
  let treeData = treemap(root)

  // Compute the new tree layout.
  let nodes = treeData.descendants(),
    links = treeData.descendants().slice(1)

  nodes.forEach(function(d) {
    return (d.y = (d.depth * width) / 4)
  })

  // ****************** Nodes ***************************

  // Update the nodes...
  let node = svg
    .selectAll('g.node')
    .data(nodes, d => d.id || (d.id = ++runningId))

  updateNodes(source, node)

  // ****************** Links ***************************

  // Update the links...
  let link = svg.selectAll('path.link').data(links, function(d) {
    return d.id
  })

  updateLinks(source, link)

  updatePinned()

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })
}

function updateNodes(source, node) {
  let cc = clickcancel()
  // Enter any new modes at the parent's previous position.
  let nodeEnter = node
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + source.x0 + ',' + source.y0 + ')'
    })
  //.call(cc)
  // cc.on("click", () => console.log("click"))
  // cc.on("dblclick", () => console.log("Double Click"))

  // add picture
  let defs = nodeEnter.append('defs')

  defs
    .append('clipPath')
    .attr('id', d => 'thePicture')
    .append('circle')
    .attr('r', imageRadius)
    .attr('cx', 0)
    .attr('cy', 0)

  defs
    .append('clipPath')
    .attr('id', d => 'theLogo')
    .append('circle')
    .attr('r', imageRadius / 2)
    .attr('cx', imageRadius / 2)
    .attr('cy', imageRadius / 2)

  // Add Circle for the nodes
  nodeEnter
    .append('circle')
    .attr('class', `node`)
    .attr('r', 1e-6)
    .style('fill', '#fff')

  nodeEnter
    .append('image')
    .attr('x', -imageRadius)
    .attr('y', -imageRadius)
    .attr('class', 'pic')
    .attr('width', 1e-6)
    .attr('height', 1e-6)
    .attr('xlink:href', 'http://lorempixel.com/100/100/sports/3/')
    .attr('clip-path', 'url(#thePicture)')
    .on('click', click)
    .on('contextmenu', (d, i) => {
      d3.contextMenu(menuFunc(d))(d, i)
    })

  nodeEnter
    .append('circle')
    .attr('class', 'nodeIcon')
    .attr('r', 1e-6)
    .attr('cx', imageRadius / 2)
    .attr('cy', imageRadius / 2)
    .style('fill', '#fff')

  nodeEnter
    .append('image')
    .attr('class', 'logo')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 1e-6)
    .attr('height', 1e-6)
    .attr('xlink:href', 'http://lorempixel.com/100/100/sports/2/')
    .attr('clip-path', 'url(#theLogo)')
    .on('click', () => console.log('Logo Clicked'))
    .on('contextmenu', (d, i) => {
      d3.contextMenu(logoMenu(d))(d, i)
    })
  // Add labels for the nodes
  nodeEnter
    .append('text')
    .attr('dy', '.35em')
    .attr('x', d => (d.children || d._children ? -33 : 33))
    .attr('text-anchor', d => (d.children || d._children ? 'end' : 'start'))
    .text(d => d.data.name)

  // UPDATE
  let nodeUpdate = nodeEnter.merge(node)

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')

  // Update the node attributes and style
  nodeUpdate
    .select('circle.node')
    .attr('r', imageRadius + 1)
    .attr('class', `node`)
    .style('fill', `rgba(0,0,0,0)`)
    .attr('cursor', 'pointer')

  nodeUpdate
    .select('circle.nodeIcon')
    .attr('r', imageRadius / 2 + 1)
    .style('fill', `rgba(0,0,0,0)`)
    .attr('cursor', 'pointer')

  nodeUpdate
    .select('image.pic')
    .attr('height', imageRadius * 2)
    .attr('width', imageRadius * 2)
    .attr('cursor', 'pointer')

  nodeUpdate
    .select('image.logo')
    .attr('height', imageRadius)
    .attr('width', imageRadius)
    .attr('cursor', 'pointer')

  nodeUpdate
    .select('image.expand')
    .attr('height', imageRadius)
    .attr('width', imageRadius)

  // Remove any exiting nodes
  let nodeExit = node.exit().remove()

  // On exit reduce the node circles size to 0
  nodeExit.select('circle').attr('r', 1e-6)

  // On exit reduce the opacity of text labels
  nodeExit.select('text').style('fill-opacity', 1e-6)
}

function updateLinks(source, link) {
  // Enter any new links at the parent's previous position.
  let linkEnter = link
    .enter()
    .insert('path', 'g')
    .attr('class', 'link')
    .attr('d', function(d) {
      var o = { x: source.x0, y: source.y0 }
      return diagonal({ source: o, target: o })
    })
  // .attr('d', function(d) {
  //   let o = { x: source.x0, y: source.y0 }
  //   return diagonal(o, o)
  // })

  // UPDATE
  let linkUpdate = linkEnter.merge(link)

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(duration)
    .attr('d', function(d) {
      return diagonal(d, d.parent)
    })

  // Remove any exiting links
  let linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr('d', function(d) {
      let o = { x: source.x, y: source.y }
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

function updateHeightDepth(current, depth) {
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

// ------------------- Click Events -------------------
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
}
function clickcancel() {
  var event = d3.dispatch('click', 'dblclick')

  function cc(selection) {
    var down,
      tolerance = 5,
      last,
      wait = null
    // euclidean distance
    function dist(a, b) {
      return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2))
    }
    selection.on('mousedown', function() {
      down = d3.mouse(document.body)
      last = +new Date()
    })
    selection.on('mouseup', function() {
      if (dist(down, d3.mouse(document.body)) > tolerance) {
        return
      } else {
        if (wait) {
          window.clearTimeout(wait)
          wait = null
          event.call('dblclick', d3.event)
        } else {
          wait = window.setTimeout(
            (function(e) {
              return function() {
                event.call('click', e)
                wait = null
              }
            })(d3.event),
            300
          )
        }
      }
    })
  }
  cc.on = function() {
    var value = event.on.apply(event, arguments)
    return value === event ? cc : value
  }
  return cc
}

// --------------------- Pinning ----------------------

function pin(node) {
  if (pinned != node) {
    pinned = node
    updateDisplay()
  } else {
    firstPin = true
    pinned = null
  }
}

function updatePinned() {
  //Display pin image next to pinned Node
  if (pinned) {
    if (firstPin) {
      firstPin = !firstPin
      pinImage
        .style('x', pinned.x)
        .style('y', pinned.y)
        .transition()
        .duration(duration)
        .style('opacity', '1')
    } else {
      pinImage
        .transition()
        .duration(duration)
        .style('x', pinned.x)
        .style('y', pinned.y)
    }
  } else {
    pinImage
      .transition()
      .duration(duration)
      .style('opacity', '0')
    updateDisplay()
  }
}

function parentOfPinned(selected, pinnedParent) {
  if (pinned == selected || !pinnedParent) return false
  else if (pinnedParent == selected) return true
  else return parentOfPinned(selected, pinnedParent.parent)
}

function checkParentOfPinned(selected) {
  if (pinned) return parentOfPinned(selected, pinned.parent)
  return false
}

function childOfPinned(selected) {
  if (!selected) return false
  else if (selected == pinned) return true
  else return childOfPinned(selected.parent)
}

// --------------------- Right Click Menu Items -----------------------
let menus = {
  unPinMenu: {
    title: 'UnPin Node',
    action: function(elm, d, i) {
      pin(d)
      updatePinned()
    }
  },
  pinMenu: {
    title: 'Pin Node',
    action: function(elm, d, i) {
      pin(d)
      updatePinned()
    }
  },
  displaySales: {
    title: 'Display Sales',
    action: function(elm, d, i) {
      updateTeamMember(d.data.values)
    }
  },
  collapseMenu: {
    title: 'Collapse Node',
    action: function(elm, d, i) {
      if (d.children) {
        d._children = d.children
        d.children = null
      }
      update(d)
    }
  },
  expandMenu: {
    title: 'Expand Node',
    action: function(elm, d, i) {
      if (d._children) {
        d.children = d._children
        d._children = null
      }
      update(d)
    }
  },
  loadChildrenMenu: {
    title: 'Load Children',
    action: function(elm, d, i) {
      if (d.depth < 4) {
        let newChild = fetchChild(d)
        let newNode = d3.hierarchy(newChild, d => d.children)
        newNode.depth = d.depth + 1
        newNode.height = d.height - 1
        newNode.parent = d

        d.children = []
        d.data.children = []

        //Push it to parent.children array
        d.children.push(newNode)
        d.data.children.push(newNode.data)

        updateHeightDepth(root, 0)

        d.children.forEach(collapse)
      } else {
        d.data.leaf = true
      }
      updatePinnedDisplay()
      update(d)
    }
  },
  exampleMenu: {
    title: 'Logo Menu',
    action(elm, d) {
      console.log('I done been clicked')
    }
  }
}
//This function will determine what menu items a given node will have
function menuFunc(data) {
  let menu = []
  if (childOfPinned(data)) menu.push(menus['displaySales'])

  if (!checkParentOfPinned(data)) {
    if (data.children) menu.push(menus['collapseMenu'])
    else if (data._children) menu.push(menus['expandMenu'])
    else if (!data.data.leaf) menu.push(menus['loadChildrenMenu'])
  }

  if (pinned == data) menu.push(menus['unPinMenu'])
  else menu.push(menus['pinMenu'])

  return menu
}

//This function will determine what menu items a given node will have
function logoMenu(data) {
  return [menus['exampleMenu']]
}
function fetchChild(d) {
  return {
    name: 'Fred',
    values: {
      title: 'Fred',
      information: '. . .',
      data: '2000',
      sales: [
        {
          id: '15+',
          date: '04/17/19',
          amount: '70'
        }
      ]
    },
    children: [
      {
        name: 'Jeremy',
        values: {
          title: 'Jeremy',
          information: 'First Child of Fred',
          data: '200',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '30'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      },
      {
        name: 'Jill',
        values: {
          title: 'Jill',
          information: 'First Child of Jeremy',
          data: '150',
          sales: [
            {
              id: '15+',
              date: '04/17/19',
              amount: '140'
            }
          ]
        }
      }
    ]
  }
}

// ------------------------- Display Functions ---------------------------
//Update display based on data given, usually will be for the pinned node
function updateDisplay() {
  console.log('Updating Pinned and TeamMember')
  updatePinnedDisplay()

  updateTeamMember()

  updateSalesTable()
}

function updateSalesTable() {
  //Update the selected Members Sales table
}

function updatePinnedDisplay() {
  //Update the Pinned member display, with up to date values
}

function updateTeamMember() {
  //Update the display for selected teamMember
  updateSalesTable()
}

// ---------------------- Fetch Data -----------------------
function fetchData() {
  return {
    name: 'Joe',
    values: {
      title: 'Joe',
      information: 'Found at the Root',
      data: '23000',
      sales: [
        {
          id: '1',
          date: '04/17/19',
          amount: '20'
        }
      ]
    },
    children: [
      {
        name: 'Fred',
        values: {
          title: 'Fred',
          information: 'First Child of Root',
          data: '2000',
          sales: [
            {
              id: '2',
              date: '04/17/19',
              amount: '50'
            },
            {
              id: '3',
              date: '04/17/19',
              amount: '40'
            }
          ]
        },
        children: [
          {
            name: 'Jeremy',
            values: {
              title: 'Jeremy',
              information: 'First Child of Fred',
              data: '200',
              sales: [
                {
                  id: '3',
                  date: '04/17/19',
                  amount: '50'
                }
              ]
            },
            children: [
              {
                name: 'Jill',
                values: {
                  title: 'Jill',
                  information: 'First Child of Jeremy',
                  data: '150',
                  sales: [
                    {
                      id: '5',
                      date: '04/17/19',
                      amount: '20'
                    },
                    {
                      id: '6',
                      date: '04/17/19',
                      amount: '70'
                    },
                    {
                      id: '7',
                      date: '04/17/19',
                      amount: '30'
                    }
                  ]
                }
              }
            ]
          },
          {
            name: 'Jenifer',
            values: {
              title: 'Jenifer',
              information: 'Second Child of Fred',
              data: '220',
              sales: [
                {
                  id: '8',
                  date: '04/17/19',
                  amount: '70'
                }
              ]
            }
          },
          {
            name: 'Jim',
            values: {
              title: 'Jim',
              information: 'Third Child of Fred',
              data: '180',
              sales: [
                {
                  id: '9',
                  date: '04/17/19',
                  amount: '75'
                },
                {
                  id: '10',
                  date: '04/17/19',
                  amount: '62'
                }
              ]
            }
          }
        ]
      },
      {
        name: 'Jerry',
        values: {
          title: 'Jerry',
          information: '2nd Child of Joe',
          data: '3000',
          sales: [
            {
              id: '11',
              date: '04/17/19',
              amount: '60'
            },
            {
              id: '12',
              date: '04/17/19',
              amount: '73'
            },
            {
              id: '13',
              date: '04/17/19',
              amount: '40'
            },
            {
              id: '14',
              date: '04/17/19',
              amount: '50'
            }
          ]
        }
      }
    ]
  }
}

function project(x, y) {
  var angle = ((x - 90) / 180) * Math.PI,
    radius = y
  return [radius * Math.cos(angle), radius * Math.sin(angle)]
}
