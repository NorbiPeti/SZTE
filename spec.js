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
			const rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			for (const row of rows) {
				let id = row["Tárgykód"].replaceAll(/[‑-]\d{5}/g, "").replaceAll(/‑/g, "-");
				id = row["Tárgy címe, előadó neve"].indexOf("tehetséggondozó") !== -1 ? id + "-TG" : id;
				const subject = subjects[id];
				if (!subject) {
					console.warn("Subject not found: " + id + " " + row["Tárgy címe, előadó neve"]);
					continue;
				}
				let grade = /\((\d)\)(?!.*\(\d\))/.exec(row["Jegyek"]);
				if (grade == null)
					continue;
				subject.grade = +grade[1];
				subject.credit = +row["Kr."];
				grades[id] = subject;
			}
			const specsSpan = document.getElementById("specs");
			const total = {};
			for (const sub of Object.values(grades)) {
				for (const category of sub.categories) {
					if (sub.grade <= 1) continue;
					if (total[category.id] === undefined)
						total[category.id] = sub.credit;
					else
						total[category.id] += sub.credit;
				}
			}
			specsSpan.innerHTML = "";
			for (const tk of Object.keys(total)) {
				const cat = tryGetCat(tk);
				specsSpan.innerHTML += cat.name + ": " + total[tk] + "/" + cat.neededCredit + "<br />";
			}
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
			if (tempcat !== undefined) {
				cat = tempcat;
				if (cat.spec && cat.spec !== kotSpec && cat.spec !== kotvalSpec)
					cat.neededCredit = +sdata[9];
			}
			if (sdata[2].indexOf("specializáció") === -1)
				continue;
			const spec = new Specialization(sdata[1], sdata[2],
				new SubjectCategory(sdata[1] + "‑MATSZT", sdata[2] + " matekos tárgyak", 0),
				new SubjectCategory(sdata[1] + "‑INF", sdata[2] + " infós tárgyak"), 0);
			specs.push(spec);
			continue;
		}
		if (cat === undefined) {
			console.warn("No category found!");
			continue;
		}
		let id = sdata[1].replaceAll(/[‑-]\d{5}/g, "").replaceAll(/‑/g, "-");
		id = sdata[2].indexOf("tehetséggondozó") !== -1 ? id + "-TG" : id;
		if (!subjects[id])
			subjects[id] = new SubjectData(id, sdata[2], sdata[8], [cat]);
		else {
			subjects[id].categories.push(cat);
			/*if (subjects[id].credit !== sdata[8]) - Több különböző kredit-eloszlású verzió is lehet egy tárgyból
				console.warn("Credit amount differs for " + sdata[2] + ": " + subjects[id].credit + " " + sdata[8]);*/
		}
	}
	for (const spec of specs) {
		const count = Object.values(subjects).reduce((pv, cv) => cv.categories.reduce((pcv, ccv) => pcv || ccv.spec === spec, false) ? pv + 1 : pv, 0);
		console.log(spec.name + ": " + count);
	}
	const count = Object.values(subjects).reduce((pv, cv) => cv.categories.reduce((pcv, ccv) => pcv || ccv.spec === null, false) ? pv + 1 : pv, 0);
	console.log("Egyéb tárgyak: " + count);
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

let subjects = {};
let specs = [
	kotSpec,
	kotvalSpec
];
let grades = {};
(async () => {
		await szak.onchange(undefined);
		await lk.onchange(undefined);
	}
)();
