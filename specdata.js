class SubjectData {
	constructor(id, name, credit, categories) {
		this.id = id;
		this.name = name;
		this.credit = credit;
		this.categories = categories;
		this.grade = 0;
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
