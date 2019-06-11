import { pinned, checkParentOfPinned, childOfPinned } from "./pin.js"
import { unPinMenu, pinMenu, collapseMenu, expandMenu, loadChildrenMenu, displaySales } from "./menuItems.js"
import { myTotalValue } from './sales.js'

//This function will determine what menu items a given node will have
function menuFunc(data) {
	let menu = []
	if (childOfPinned(data))
		menu.push(displaySales)

	if (checkParentOfPinned(data))
		return menu
	else if (data.children)
		menu.push(collapseMenu)
	else if (data._children)
		menu.push(expandMenu)
	else if (!data.data.leaf)
		menu.push(loadChildrenMenu)

	if (pinned == data)
		menu.push(unPinMenu)
	else
		menu.push(pinMenu)

	return menu
}

//Update display based on data given, usually will be for the pinned node
function updateDisplay(teamMember, node) {
	updatePinnedDisplay()

	updateTeamMember(teamMember)

	updateSalesTable(node, teamMember.sales)
}

function updateSalesTable(node, sales) {
	let tricklePercent
	if (pinned && node)
		tricklePercent = pinned == node ? 0 : .1 / (node.depth - pinned.depth)

	sales = sales ? [{}, ...sales] : []

	let salesContainer = d3.select("#salesDisplay .sales").selectAll("tr")
		.data(sales)

	salesContainer.exit().remove()

	let salesEnter = salesContainer.enter()
		.append("tr")

	salesEnter.append('th')
		.attr('class', "saleId")
	salesEnter.append('th')
		.attr('class', 'saleDate')
	salesEnter.append('th')
		.attr('class', 'saleAmount')
	salesEnter.append('th')
		.attr('class', 'saleTrickle')

	let salesUpdate = salesEnter.merge(salesContainer)

	salesUpdate.select('.saleId')
		.text((d, i) => i > 0 ? d.id : "Id")

	salesUpdate.select('.saleDate')
		.text((d, i) => i > 0 ? d.date : "Date")

	salesUpdate.select('.saleAmount')
		.text((d, i) => i > 0 ? d3.format(`$,`)(d.amount) : "Amount")

	salesUpdate.select('.saleTrickle')
		.text((d, i) => i > 0 ? d3.format(`$,.2f`)(tricklePercent ? ~~d.amount * tricklePercent : 0) : "Trickle")

}

function updatePinnedDisplay() {
	let pinnedDisplay = d3.select('#pinned')

	pinnedDisplay.select('h1').text(`Pinned: ${pinned ? pinned.data.values.title : ''}`)

	let salesTotal = 0
	if (pinned)
		salesTotal = myTotalValue(pinned)

	pinnedDisplay.select('p').text(`Current Month Total: ${d3.format(`$,.2f`)(salesTotal)}`)
}

function updateTeamMember({ title, information, data }) {
	let values = {
		title: `${title || ''}`,
		information: `Information: ${information || ''}`,
		data: `${data || ''}`
	}

	let display = d3.select(`#salesDisplay`)

	display.select(`h2`).text(values.title)
	display.select(`p.info`).text(values.information)
	display.select(`p.numbers`).text("Data: " + d3.format(`$,`)(values.data))
}
export {
	updateDisplay,
	updatePinnedDisplay,
	updateSalesTable,
	updateTeamMember,
	menuFunc
}