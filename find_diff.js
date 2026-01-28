import { SchaleDBClient } from 'blue-archive-mcp';
import fs from 'fs';

async function run() {
	const client = new SchaleDBClient();
	const students = await client.getStudents({ language: 'en', limit: 1000 });
	const apiIds = new Set(students.filter((s) => s.School === 'Millennium').map((s) => s.Id));

	const fileData = JSON.parse(
		fs.readFileSync('src/lib/data/students/Millennium/batch_1.json', 'utf8')
	);
	const fileIds = new Set(fileData.map((s) => s.id));

	console.log('API count:', apiIds.size);
	console.log('File count:', fileIds.size);

	const onlyInFile = [...fileIds].filter((id) => !apiIds.has(id));
	const onlyInApi = [...apiIds].filter((id) => !fileIds.has(id));

	console.log('Only in File:', onlyInFile);
	console.log('Only in API:', onlyInApi);

	if (onlyInFile.length > 0) {
		console.log('Names in File only:');
		fileData.filter((s) => onlyInFile.includes(s.id)).forEach((s) => console.log(s.name, s.id));
	}
}

run();
