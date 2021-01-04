const szak = document.getElementById("szak");
const lk = document.getElementById("leckekonyv");
promiseOnLoad = async loadable => new Promise(((resolve, reject) => (loadable.onload = ev => resolve(ev)) && (loadable.onerror = ev => reject(ev))));
parseExcel = async function (file) {
	try {
		const reader = new FileReader();
		const evpr = promiseOnLoad(reader);
		reader.readAsBinaryString(file);
		const ev = await evpr;
		const data = ev.target.result;

		const workbook = XLSX.read(data, {
			type: 'binary'
		});

		workbook.SheetNames.forEach(function (sheetName) {
			const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			const json_object = JSON.stringify(XL_row_object);
			console.log(json_object);
			console.log(XL_row_object[0]["Tárgykód"]);
		});
	} catch
		(ex) {
		console.log(ex);
	}
}
lk.onchange = async () => await parseExcel(lk.files[0]);
szak.onchange = async () => {
	if (szak.value === "nope") return;
	let response = await fetch(document.URL.substr(0, document.URL.lastIndexOf('/')) + '/data/' + szak.value + "_bsc.csv");
	let data = await response.text();
	let obj = Papa.parse(data);
	const szakError = document.getElementById("szakError");
	szakError.innerText = "";
	if (obj.errors.length > 0) {
		for (const error of obj.errors)
			szakError.innerHTML += error.type + " - " + error.code + ": " + error.message + "<br />";
		return;
	}
	console.log(obj.data);
	let cat;
	for (let i = 2; i < obj.data.length; i++) { //2: Skip header
		const sdata = obj.data[i];
		if (sdata.length < 10)
			continue;
		if (sdata[5].length === 0) { //Course type, only present at leaf nodes
			let tempcat = tryGetCat(sdata[1]);
			if (tempcat !== undefined)
				cat = tempcat;
			if (sdata[2].indexOf("specializáció") === -1)
				continue;
			const spec = new Specialization(sdata[1], sdata[2],
				new SubjectCategory(sdata[1] + "‑MATSZT‑A", sdata[2] + " matekos tárgyak"),
				new SubjectCategory(sdata[1] + "‑INF‑A", sdata[2] + " infós tárgyak"));
			specs.push(spec);
			continue;
		}
		if (cat === undefined) {
			console.warn("No category found!");
			continue;
		}
		subjects.push(new SubjectData(sdata[1], sdata[2], sdata[8], cat));
	}
	const specsSpan = document.getElementById("specs");
	specsSpan.innerHTML = "";
	for (const spec of specs) {
		const count = subjects.reduce((pv, cv) => cv.category.spec === spec ? pv + 1 : pv, 0);
		specsSpan.innerHTML += spec.name + ": " + count + "<br />";
	}
};

function tryGetCat(categoryID) {
	const spec = specs.find(spec => spec.matcat.id === categoryID || spec.infcat.id === categoryID)
	return (spec && (spec.matcat.id === categoryID ? spec.matcat : spec.infcat)) || [
		kotvalEgyebCat,
		szakdogaCat,
		szakmaiCat,
		szabvalCat
	].find(cat => cat.id === categoryID);
}

let subjects = [];
let specs = [
	kotSpec,
	kotvalSpec
];
(async () => {
		await szak.onchange(undefined);
		await lk.onchange(undefined);
	}
)();
