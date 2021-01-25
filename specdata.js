class SubjectData {
	constructor(id, name, credit, categories) {
		this.id = id;
		this.name = name;
		this.credit = credit;
		this.categories = categories;
		this.grade = 0;
		this.semester = 0;
	}
}

class SubjectCategory {
	constructor(id, name, neededCredit) {
		this.id = id;
		this.name = name;
		this.spec = null;
		this.neededCredit = neededCredit;
	}
}

class Specialization {
	constructor(id, name, matcat, infcat) {
		this.id = id;
		this.name = name;
		this.matcat = matcat;
		matcat.spec = this;
		this.infcat = infcat;
		infcat.spec = this;
	}
}

class Semester {
	constructor(firstYear, num) {
		this.firstYear = firstYear;
		this.num = num;
	}

	static parse(str) {
		const regex = /(\d{4})\/\d{2}\/(\d)/g.exec(str);
		return new Semester(+regex[1], +regex[2]);
	}

	static current() {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth();
		const s = new Semester(year, 1);
		console.log("Month: " + month);
		if (month === 0)
			s.firstYear--;
		else if (month < 8) {
			s.firstYear--;
			s.num++;
		}
		return s;
	}
}

const kotMatCat = new SubjectCategory("MK‑ALA", "Kötelező matekos tárgyak", 46);
const kotInfCat = new SubjectCategory("MK‑SZT", "Kötelező infós tárgyak", 52);
kotSpec = new Specialization("KOT", "Kötelező tárgyak", kotMatCat, kotInfCat);
const kotvalMatCat = new SubjectCategory("MK‑DIF‑MATSZT", "Kötvál matekos tárgyak", 14);
const kotvalInfCat = new SubjectCategory("MK‑DIF‑INF", "Kötvál infós tárgyak", 23);
kotvalSpec = new Specialization("MK-DIF", "Specializáció nélkül", kotvalMatCat, kotvalInfCat);
kotvalEgyebCat = new SubjectCategory("MK‑DIFF‑EGYEB", "Kötvál egyéb tárgyak");
szakdogaCat = new SubjectCategory("MK‑SZD", "Szakdolgozat", 20);
szakmaiCat = new SubjectCategory("MK‑SZG", "Szakmai gyakorlat", 0);
szabvalCat = new SubjectCategory("MK‑SZV", "Szabadon választható tárgyak", 10);
