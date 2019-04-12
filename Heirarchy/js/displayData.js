export function updateDisplay(values){
	let display = d3.select(`#display`)

	display.select(`h1`).text(values.title)
	display.select(`p.info`).text(values.information)
	display.select(`p.numbers`).text(d3.format(`$,`)(values.data))
}