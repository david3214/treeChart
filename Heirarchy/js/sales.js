import { pinned } from './pin.js'

function myTotalValue(node) {
	if (!node)
		return 0
	let mySalesValue = 0
	if (node.data.values.sales)
		mySalesValue = node.data.values.sales.reduce((total, sale) => total + ~~sale.amount, 0)

	let myTrickleValue = 0
	if (node.children || node._children) {
		let children = node.children || node._children
		children.forEach(child => {
			myTrickleValue += salesTotalTrickle(child)
		})
	}
	return mySalesValue + myTrickleValue
}

function salesTotalTrickle(node) {

	let trickleTotal = 0
	if (!node)
		return trickleTotal

	if (node.data.values.sales) {
		let tricklePercent = pinned == node ? 0 : .1 / (node.depth - pinned.depth)
		trickleTotal += node.data.values.sales.reduce((total, sale) => total + ~~sale.amount * tricklePercent, 0)
	}
	if (node.children || node._children) {
		let children = node.children || node._children
		children.forEach(child => {
			trickleTotal += salesTotalTrickle(child)
		})
	}

	return trickleTotal
}

export {
	myTotalValue
}