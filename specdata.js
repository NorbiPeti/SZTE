class SubjectData {
	constructor(id, name, credit, category) {
		this.id = id;
		this.name = name;
		this.credit = credit;
		this.category = category;
		this.grade = 0;
	}
}

class SubjectCategory {
	constructor(id, name) {
		this.id = id;
		this.name = name;
		this.spec = null;
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

const kotMatCat = new SubjectCategory("MK‑ALA", "Kötelező matekos tárgyak");
const kotInfCat = new SubjectCategory("MK‑SZT", "Kötelező infós tárgyak")
kotSpec = new Specialization("KOT", "Kötelező tárgyak", kotMatCat, kotInfCat);
const kotvalMatCat = new SubjectCategory("MK‑DIF‑MATSZT", "Kötvál matekos tárgyak");
const kotvalInfCat = new SubjectCategory("MK‑DIF‑INF", "Kötvál infós tárgyak");
kotvalSpec = new Specialization("MK-DIF", "Specializáció nélkül", kotvalMatCat, kotvalInfCat);
kotvalEgyebCat = new SubjectCategory("MK‑DIFF‑EGYEB", "Kötvál egyéb tárgyak");
szakdogaCat = new SubjectCategory("MK‑SZD", "Szakdolgozat");
szakmaiCat = new SubjectCategory("MK‑SZG", "Szakmai gyakorlat");
szabvalCat = new SubjectCategory("MK‑SZV", "Szabadon választható tárgyak");
