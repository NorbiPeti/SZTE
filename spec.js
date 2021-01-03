const szak = document.getElementById("szak");
const lk = document.getElementById("leckekonyv");
parseExcel = function (file) {
	const reader = new FileReader();

	reader.onload = function (e) {
		const data = e.target.result;
		const workbook = XLSX.read(data, {
			type: 'binary'
		});


		workbook.SheetNames.forEach(function (sheetName) {
			const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			const json_object = JSON.stringify(XL_row_object);
			console.log(json_object);
			console.log(XL_row_object[0]["Tárgykód"]);

		})

	};

	reader.onerror = function (ex) {
		console.log(ex);
	};

	reader.readAsBinaryString(file);
};
lk.onchange = ev => parseExcel(lk.files[0]);
szak.onchange = async ev => {
	if (szak.value === "nope") return;
	let response = await fetch(document.URL.substr(0, document.URL.lastIndexOf('/')) + '/data/' + szak.value + "_bsc.csv");
	let data = await response.text();
	let obj = Papa.parse(data);
	console.log(obj);
};
