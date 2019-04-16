import {pinned, parentOfPinned} from "./pin.js";
import {unPinMenu, pinMenu, collapseMenu, expandMenu, loadChildrenMenu} from "./menuItems.js"

//This function will determine what menu items a given node will have
function menuFunc(data){
	let menu = []
	if (pinned == data)
		menu.push(unPinMenu)
	else 
		menu.push(pinMenu)

	//If it is the parent of a pinned node, it's already expanded,
	// we don't want to collapse it,
	// and we don't need to load its children data
	if(parentOfPinned(data, pinned.parent))
		return menu
	else if(data.children)
		menu.push(collapseMenu)
	else if(data._children)
		menu.push(expandMenu)
	else if(!data.data.leaf)
		menu.push(loadChildrenMenu)
	return menu
}

//Update display based on data given, usually will be for the pinned node
function updateDisplay({title, information, data}){
	let values = {
		title: `Title: ${title || ''}`,
		information: `Information: ${information || ''}`,
		data: `${data || ''}`,
	}
	let display = d3.select(`#display`)

	display.select(`h1`).text(values.title)
	display.select(`p.info`).text(values.information)
	display.select(`p.numbers`).text("Data: " + d3.format(`$,`)(values.data))
}

export {
	updateDisplay,
	menuFunc
}