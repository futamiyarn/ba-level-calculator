import { json } from '@sveltejs/kit';

export async function POST({ request, platform }) {
	try {
		const formData = await request.formData();
		const image = formData.get('image');

		if (!image || !(image instanceof File)) {
			return json({ error: 'No image uploaded' }, { status: 400 });
		}

		if (!platform || !platform.env || !platform.env.AI) {
			return json({ error: 'Cloudflare AI binding not available' }, { status: 500 });
		}

		const arrayBuffer = await image.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		const imageArray = [...uint8Array];

		const inputs = {
			image: imageArray,
			prompt: "Analyze this image. If it is a character profile or status screen (like from a game), extract the text and describe the character, level, and stats. Otherwise, describe the image."
		};

		const response = await platform.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', inputs);

		return json(response);
	} catch (err) {
		console.error('AI Scan Error:', err);
		return json({ error: err.message }, { status: 500 });
	}
}
