const szak = document.getElementById("szak");
const lk = document.getElementById("leckekonyv");
promiseOnLoad = async loadable => new Promise(((resolve, reject) => (loadable.onload = ev => resolve(ev)) && (loadable.onerror = ev => reject(ev))));
parseExcel = async function (file) {
	try {
		if (!file || szak.value === "nope") return;
		grades = {};
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
				let id = row["Tárgykód"];
				const name = row["Tárgy címe, előadó neve"].replace(/,.*/, "");
				if (!id.startsWith("IB0"))
					id = id.replaceAll(/[‑-]\d{5}/g, "");
				id = id.replaceAll(/‑/g, "-");
				id = name.indexOf("tehetséggondozó") !== -1 ? id + "-TG" : id;
				let subject = subjects[id];
				if (!subject) {
					if (id.startsWith("X"))
						subject = new SubjectData(id, name, 0, [szabvalCat]);
					else {
						console.warn("Subject not found: " + id + " " + name);
						continue;
					}
				}
				let grade = /\((\d)\)(?!.*\(\d\))/.exec(row["Jegyek"]);
				if (grade == null) {
					const sign = row["Aláírás"];
					if (!sign)
						continue;
					grade = [, sign.startsWith("Aláírva") ? 5 : 1];
				}
				let semester = Semester.parse(row["Félév"]);
				subject.grade = +grade[1];
				subject.credit = +row["Kr."];
				subject.semester = semester;
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
			const print = (cat, name, total, needed) => specsSpan.innerHTML += name + ": " + total + "/" + (needed ?? cat.neededCredit) + "<br />";
			specsSpan.innerHTML = "";
			let kotvalTotal = 0;
			for (const spec of specs) {
				specsSpan.innerHTML += "<h3>" + spec.name + "</h3>";
				const kvs = {"Matekos tárgyak": spec.matcat, "Infós tárgyak": spec.infcat};
				let kextra = 0;
				const neededExtra = 52 - spec.matcat.neededCredit - spec.infcat.neededCredit;
				for (const key of Object.keys(kvs)) {
					const value = kvs[key];
					let tot = total[value.id];
					if (spec === kotvalSpec)
						kotvalTotal += tot;
					if (spec !== kotSpec && neededExtra !== 0) {
						if (tot > value.neededCredit) {
							kextra += tot - value.neededCredit;
							tot = value.neededCredit;
						}
					}
					print(value, key, tot);
				}
				if (spec !== kotSpec) {
					if (neededExtra !== 0) {
						print(kotvalEgyebCat, kotvalEgyebCat.name, kextra, neededExtra);
					}
					let szt = 0;
					if (spec !== kotvalSpec) {
						szt = kotvalTotal - total[spec.matcat.id] - total[spec.infcat.id];
						if (neededExtra !== 0)
							szt -= kextra;
					}
					print(szabvalCat, szabvalCat.name, (total[szabvalCat.id] ?? 0) + szt);
				} else {
					print(szakdogaCat, szakdogaCat.name, total[szakdogaCat.id] ?? 0);
					specsSpan.innerHTML += szakmaiCat.name + ": " + (Object.values(grades).find(cv => cv.categories.indexOf(szakmaiCat) !== -1 && cv.grade > 1) ? "Teljesitve" : "Nincs teljesitve") + "<br />";
					specsSpan.innerHTML += "Testnevelés: " + Object.values(grades).reduce((pv, cv) => cv.id.startsWith("XT") && cv.grade === 5 ? pv + 1 : pv, 0) + "/2 félév"; //TODO: Különböző félévben
				}
			}
			console.log("Current semester:");
			let semester = Semester.current();
			console.log(semester);
			let grds = [];
			for (const grade of Object.values(grades)) {
				console.log("gsfy: " + grade.semester.firstYear);
				console.log("gsn: " + grade.semester.num);
				console.log("sfy: " + semester.firstYear);
				console.log("sn: " + semester.num);
				if (grade.semester.firstYear === semester.firstYear && grade.semester.num === semester.num)
					grds.push(grade);
			}
			let totalCred = 0, passedCred = 0, totalNum = 0;
			for (const grade of grds) {
				if (grade.grade > 1) {
					passedCred += grade.credit;
					totalNum += grade.credit * grade.grade;
				}
				totalCred += grade.credit;
			}
			console.log("tc: " + totalCred + " pc: " + passedCred + " tn: " + totalNum);
			specsSpan.innerHTML += "<br />KKI (ösztöndijhoz): " + (totalNum / 30.0 * passedCred / totalCred);
		});
	} catch (ex) {
		console.log(ex);
	}
}
lk.onchange = async () => await parseExcel(lk.files[0]);
szak.onchange = async () => {
	if (szak.value === "nope") return;
	subjects = {};
	specs = [...specsDef];
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
			if (sdata[2].indexOf("specializáció") !== -1) {
				const spec = new Specialization(sdata[1], sdata[2],
					new SubjectCategory(sdata[1] + "‑MATSZT", sdata[2] + " matekos tárgyak", 0),
					new SubjectCategory(sdata[1] + "‑INF", sdata[2] + " infós tárgyak"), 0);
				specs.push(spec);
			}
			/*if (sdata[2].indexOf("Speciálkollégium") !== -1) {
				speck.push(sdata[1].replaceAll("TE‑", ""));
			}*/
			continue;
		}
		if (cat === undefined) {
			console.warn("No category found!");
			continue;
		}
		let id = sdata[1];
		if (!id.startsWith("IB0")) //IB0: speckol and such
			id = id.replaceAll(/[‑-]\d{5}/g, "");
		id = id.replaceAll(/‑/g, "-");
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
	if (lk.files[0])
		await lk.onchange(undefined);
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
let specs = [];
let specsDef = [
	kotSpec,
	kotvalSpec
];
let grades = {};
(async () => {
		await szak.onchange(undefined);
	}
)();
