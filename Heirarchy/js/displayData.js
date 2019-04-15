export function updateDisplay({title, information, data}){
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