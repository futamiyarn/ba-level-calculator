import { SchaleDBClient } from 'blue-archive-mcp';

async function run() {
	const client = new SchaleDBClient();
	const students = await client.getStudents({ language: 'en', limit: 1000 });

	const schools = {};
	students.forEach((s) => {
		if (!schools[s.School]) schools[s.School] = 0;
		schools[s.School]++;
	});

	console.log('Schools found:', schools);

	const etc = students.filter((s) => s.School === 'ETC' || s.School === 'Sakugawa');
	console.log(
		'ETC/Sakugawa:',
		etc.map((s) => `${s.Name} (${s.School})`)
	);
}

run();
