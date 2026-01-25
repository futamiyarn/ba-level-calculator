import { fail } from '@sveltejs/kit';

export const actions = {
	scan: async ({ request, platform }) => {
		const formData = await request.formData();
		const image = formData.get('image');

		if (!image || !(image instanceof File)) {
			return fail(400, { error: 'No image uploaded' });
		}

		// Check if running on Cloudflare (platform.env.AI exists)
		if (!platform?.env?.AI) {
			return fail(500, {
				error:
					'Cloudflare AI binding not found. Ensure you are running in a Cloudflare Worker environment.'
			});
		}

		try {
			const arrayBuffer = await image.arrayBuffer();

			// ResNet-50 is an image classification model.

			// It does not take a prompt, only the raw image data.

			const response = await platform.env.AI.run('@cf/microsoft/resnet-50', {
				image: [...new Uint8Array(arrayBuffer)]
			});

			return {
				success: true,

				model_used: '@cf/microsoft/resnet-50',

				note: 'This model performs classification, not text extraction.',

				raw_response: response
			};
		} catch (err) {
			console.error('CF AI Error:', err);
			return fail(500, { error: err.message, stack: err.stack });
		}
	}
};
