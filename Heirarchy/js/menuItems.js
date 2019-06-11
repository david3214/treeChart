import { pin, updatePinned } from "./pin.js"
import { update, updateHeightDepth } from './treeUpdate.js'
import { root, collapse } from './index.js'
import { updatePinnedDisplay, updateSalesTable, updateTeamMember } from "./displayData.js"

let unPinMenu = {
	title: 'UnPin Node',
	action: function (elm, d, i) {
		pin(d)
		updatePinned()
	}
}

let pinMenu = {
	title: 'Pin Node',
	action: function (elm, d, i) {
		pin(d)
		updatePinned()
	}
}

let displaySales = {
	title: 'Display Sales',
	action: function (elm, d, i) {
		updateTeamMember(d.data.values)
		updateSalesTable(d, d.data.values.sales)
	}
}

let collapseMenu = {
	title: 'Collapse Node',
	action: function (elm, d, i) {
		if (d.children) {
			d._children = d.children
			d.children = null
		}
		update(d)
	}
}

let expandMenu = {
	title: 'Expand Node',
	action: function (elm, d, i) {
		if (d._children) {
			d.children = d._children
			d._children = null
		}
		update(d)
	}
}

let loadChildrenMenu = {
	title: 'Load Children',
	action: function (elm, d, i) {
		if (d.depth < 4) {
			let newChild = {
				name: "Fred",
				values: {
					title: "Fred",
					information: ". . .",
					data: "2000",
					sales: [{
						id: "15+",
						date: "04/17/19",
						amount: "70"
					}]
				},
				children: [
					{
						name: "Jeremy",
						values: {
							title: "Jeremy",
							information: "First Child of Fred",
							data: "200",
							sales: [{
								id: "15+",
								date: "04/17/19",
								amount: "30"
							}]
						},
					},
					{
						name: "Jill",
						values: {
							title: "Jill",
							information: "First Child of Jeremy",
							data: "150",
							sales: [{
								id: "15+",
								date: "04/17/19",
								amount: "140"
							}]
						},
					},
				]
			}
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
}

export {
	collapseMenu,
	expandMenu,
	pinMenu,
	unPinMenu,
	loadChildrenMenu,
	displaySales
}