import { updateDisplay } from './displayData.js'
import { duration, pinImage } from './index.js'

let pinned, firstPin = true

function pin(node) {

	if (pinned != node) {
		pinned = node
		updateDisplay(pinned.data.values, pinned)
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
			pinImage.style('x', `${pinned.y - 42}px`)
				.style('y', `${pinned.x - 42}px`)
				.transition()
				.duration(duration)
				.style('opacity', '1')

		} else {
			pinImage.transition()
				.duration(duration)
				.style('x', `${pinned.y - 42}px`)
				.style('y', `${pinned.x - 42}px`)
		}
	} else {
		pinImage.transition()
			.duration(duration)
			.style('opacity', '0')
		updateDisplay({}, pinned)
	}
}

function parentOfPinned(selected, pinnedParent) {
	if (pinned == selected || !pinnedParent)
		return false
	else if (pinnedParent == selected)
		return true
	else
		return parentOfPinned(selected, pinnedParent.parent)
}

function checkParentOfPinned(selected) {
	if (pinned)
		return parentOfPinned(selected, pinned.parent)
	return false
}

function childOfPinned(selected) {
	if (!selected)
		return false
	else if (selected == pinned)
		return true
	else
		return childOfPinned(selected.parent)

}

export {
	updatePinned,
	firstPin,
	pin,
	checkParentOfPinned,
	pinned,
	childOfPinned
}