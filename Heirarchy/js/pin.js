function pin(node) {

	if (pinned != node) {
		pinned = node
		updateDisplay(pinned.data.values)
	} else {
		firstPin = true
		pinned = false
	}
}

function parentOfPinned(selected, pinnedParent) {
	console.log({ selected, pinnedParent, pinned })
	if (pinned == selected || !pinnedParent || pinned == root)
		return false
	else if (pinnedParent == selected)
		return true
	else
		return parentOfPinned(selected, pinnedParent.parent)
}