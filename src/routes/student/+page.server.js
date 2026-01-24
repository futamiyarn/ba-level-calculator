import { config } from '$lib/config';
import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';

/**
 * Handles the form submission for image analysis.
 * Reads the uploaded image, converts it to base64, and sends it to the OpenRouter AI.
 *
 * @type {import('./$types').Actions}
 */
export const actions = {
	scan: async ({ request }) => {
		// Get form data
		const formData = await request.formData();
		const image = formData.get('image');

		// Validate image
		if (!image || !(image instanceof File)) {
			return fail(400, { error: 'No image uploaded' });
		}

		// Check for API key from private environment
		const apiKey = env.OPENROUTER_API_KEY;
		const model = config.openrouter.model;

		if (!apiKey) {
			return fail(500, { error: 'OpenRouter API Key is not configured on the server' });
		}

		try {
			// Convert image to base64
			const arrayBuffer = await image.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const base64Image = buffer.toString('base64');
			const mimeType = image.type;

			// Instructions from instruction.txt adapted for the prompt
			// Note: Backticks in the prompt text are escaped (`) to avoid breaking the JS template literal.
			const promptText = `
## 📋 Instruksi Validasi Screenshot Level Up Student Blue Archive

Buatkan instruksi custom untuk AI lain agar dapat memvalidasi screenshot **level up/growth screen** game *Blue Archive* (support server EN, JP, KR):

### 🎯 Tujuan:
Validasi screenshot **growth/level up screen** student, ekstrak hanya **current level, EXP progress, total credit cost, dan activity reports**. Pastikan screenshot asli & akurat (UI Blue Archive, deteksi bahasa EN/JP/KR otomatis).

---


### 🔍 Ciri-Ciri Visual Screenshot Valid (Harus Ada Semua untuk Valid):
1. **Header Student**: Foto student (gadis anime-style), nama student (e.g., EN: "Sorasaki Hina", JP: "空崎ヒナ", KR: "소라사키 히나"), rarity stars (★★★), role badge (e.g., EN: "STRIKER" hijau / "SPECIAL" biru; JP/KR serupa atau diterjemahkan).
2. **Level Info**: "Lv. XX" besar di tengah atas (atau equiv. JP: "Lv. XX", KR: "Lv. XX"), progress bar EXP kuning (current EXP / max EXP terlihat jelas).
3. **Stats Growth**: 4 stat panel (Max HP, ATK, DEF, HEAL atau equiv. JP: 最大HP, 攻撃力, 防御力, 治癒力; KR: 최대 HP, 공격력, 방어력, 치유력) dengan arrow "→" antara before/after values.
4. **Activity Reports Section**: 4 slot ikon report berwarna berbeda:
   - Lowest (biru muda, x35+): EN: Novice, JP: 初級, KR: 초급
   - Medium (hijau muda, x50+): EN: Normal, JP: 一般, KR: 일반
   - Advanced (oranye, x0+): EN: Advanced, JP: 上級, KR: 상급
   - Highest (ungu/merah muda, x0+): EN: Superior, JP: 最上級, KR: 최상급
   - Setiap slot punya tombol "+" atau selected glow (1 slot aktif/selected).
5. **Credit Cost**: Ikon "c" kuning di kanan bawah + total number (e.g., "350").
6. **UI Background**: Gradasi biru-ungu khas Blue Archive, tombol "LEVEL UP" besar di bawah (atau equiv. JP: "レベルアップ", KR: "레벨 업").
7. **Teks Bahasa**: Deteksi EN ("Growth Info", "Activity Reports"), JP (e.g., "成長情報", "活動レポート"), KR (e.g., "성장 정보", "활동 보고서").

**Jika ciri-ciri tidak match 100% atau buram/tidak lengkap → Output error JSON.**

---


### 📤 Data yang Harus Diekstrak:


- **Language**: Deteksi bahasa (EN, JP, KR).


- **Current Level**: e.g., '60'


- **EXP Progress** (jika belum max level):


  - Current EXP / Max EXP: e.g., '15/40'


  - Next Level Target: e.g., '65'


- **Credit**: Total biaya: e.g., '350'


- **Activity Reports**: 4 item dengan 'type' (normalized ke EN: novice, normal, advanced, superior), 'count' (e.g., 35), 'selected' (1 jika aktif, 0 lain).





---





### 📤 Format Output:





#### 1. Jika valid → Output **JSON sederhana**:





{


  "status": "valid",


  "language": "EN",  // or "JP" or "KR"


  "current_level": 60,


  "exp": {


    "current": 15,


    "max": 40,


    "next_level": 65


  },


  "credit": {


    "total": 350,


    "reports": [


      { "type": "novice", "count": 35, "selected": 1 },


      { "type": "normal", "count": 50, "selected": 0 },


      { "type": "advanced", "count": 0, "selected": 0 },


      { "type": "superior", "count": 0, "selected": 0 }


    ]


  }


}








#### 2. Jika tidak valid/error → Output **JSON error**:





{


  "status": "error",


  "message": "Screenshot tidak valid: ciri-ciri UI Blue Archive tidak match, teks buram, bahasa tidak didukung, atau data tidak terbaca."


}








---





### ⚠️ Catatan Penting:


- **Deteksi Bahasa**: Analisis teks utama (e.g., stat labels, report names) untuk tentukan EN/JP/KR. Jika mixed atau tidak jelas → error.


- **Mapping Terms ke EN**:


  - **Reports Type** (fixed order: lowest to highest):


    - EN: novice, normal, advanced, superior


    - JP: 初級 → novice, 一般 → normal, 上級 → advanced, 最上級 → superior (full: 初級活動レポート dll.)


    - KR: 초급 → novice, 일반 → normal, 상급 → advanced, 최상급 → superior (full: 초급 활동 보고서 dll.)


  - **Stats** (abaikan ekstrak stats, tapi gunakan untuk validasi bahasa).


  - **Roles/Other**: Role mungkin tetap EN di semua server, tapi abaikan karena tidak diekstrak.


- Ekstrak teks akurat: Gunakan OCR presisi dengan dukungan multi-bahasa (EN, JP, KR) untuk angka/nama, simbol '→', '/' di EXP.


- Jika max level (no EXP bar/next): Set 'exp' to null.


- Gambar buram/tanpa ciri-ciri lengkap/bahasa lain selain EN/JP/KR → error langsung.


- Output selalu gunakan bahasa Inggris untuk keys JSON (type: "novice" dll.).

Output STRICT JSON ONLY. No markdown formatting.
`;

			// Prepare request to OpenRouter
			const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify({
					model: model,
					messages: [
						{
							role: 'user',
							content: [
								{
									type: 'text',
									text: promptText
								},
								{
									type: 'image_url',
									image_url: {
										url: `data:${mimeType};base64,${base64Image}`
									}
								}
							]
						}
					]
				})
			});

			// Handle API errors
			if (!response.ok) {
				const errText = await response.text();
				return fail(response.status, { error: `AI API Error: ${errText}` });
			}

			// Parse and return result
			const data = await response.json();
			const aiContent = data.choices?.[0]?.message?.content || 'No response from AI';

			// Parse AI Content to JSON
			try {
				// Find JSON substring if extra text exists
				const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
				const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
				const result = JSON.parse(jsonString);

				if (result.status === 'valid') {
					return { success: true, data: result };
				} else {
					return fail(400, { error: result.message || 'Invalid image' });
				}
			} catch (e) {
				console.error('Failed to parse AI JSON:', aiContent);
				return fail(500, { error: 'Failed to parse AI response', raw: aiContent });
			}
		} catch (err) {
			console.error('Upload error:', err);
			return fail(500, { error: 'Internal Server Error processing image' });
		}
	}
};
