import { json } from '@sveltejs/kit';

export async function POST({ request, platform }) {
	try {
		const formData = await request.formData();
		const agree = formData.get('agree');

		if (!platform || !platform.env || !platform.env.AI) {
			return json({ error: 'Cloudflare AI binding not available' }, { status: 500 });
		}

		if (agree === 'true') {
			const response = await platform.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
				prompt: 'agree'
			});
			return json({ success: true, message: 'License agreed', response });
		}

		const image = formData.get('image');

		if (!image || !(image instanceof File)) {
			return json({ error: 'No image uploaded' }, { status: 400 });
		}

		const arrayBuffer = await image.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		const imageArray = [...uint8Array];

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
   - Highest (ungu/merah muda, x0+): EN: Superior, JP: 最上級, KR: 最上級
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
  "language": "EN",
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
- **Deteksi Bahasa**: Analisis teks utama untuk tentukan EN/JP/KR.
- **Mapping Terms ke EN**: novice, normal, advanced, superior.
- Jika max level (no EXP bar/next): Set 'exp' to null.
- Output STRICT JSON ONLY. No markdown formatting.
`;

		const inputs = {
			image: imageArray,
			prompt: promptText
		};

		const response = await platform.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', inputs);

		// Cloudflare AI returns { response: "text" }
		const aiContent = response.response || '';

		try {
			// Find JSON substring if extra text exists
			const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
			const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
			const result = JSON.parse(jsonString);
			return json(result);
		} catch (e) {
			return json(
				{ error: 'Failed to parse AI response as JSON', raw: aiContent },
				{ status: 500 }
			);
		}
	} catch (err) {
		console.error('AI Scan Error:', err);
		return json({ error: err.message }, { status: 500 });
	}
}
