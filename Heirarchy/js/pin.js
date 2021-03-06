import {updateDisplay} from './displayData.js'
import {duration, pinImage} from './index.js'

let pinned, firstPin = true

function pin(node) {

	if (pinned != node) {
		pinned = node
		updateDisplay(pinned.data.values)
	} else {
		firstPin = true
		pinned = false
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
	} else{
		pinImage.transition()
			.duration(duration)
			.style('opacity', '0')
		updateDisplay({})	
	}
}

function parentOfPinned(selected, pinnedParent) {
	if (pinned == selected || !pinnedParent)
		return false
	else if (pinnedParent == selected){
		console.log("Can't collapse parent of pinned element")
		return true
	}else
		return parentOfPinned(selected, pinnedParent.parent)
}

export {
	updatePinned,
	firstPin,
	pin,
	parentOfPinned,
	pinned
}