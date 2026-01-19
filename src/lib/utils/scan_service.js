import { GoogleGenAI } from '@google/genai';
import { config } from '$lib/config';

/**
 * Mengirim gambar ke Gemini menggunakan SDK @google/genai
 * @param {string} base64Image - String base64 gambar (JPEG compressed)
 * @returns {Promise<{valid: boolean, lv: number, exp_current: number|string, exp_max?: number|string, error?: string}>}
 */
export async function analyzeScreenshot(base64Image) {
	// 1. Inisialisasi SDK
	const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

	// 2. Prompt Validasi (Dipertahankan dari versi sebelumnya yang sudah optimal)
	const systemPrompt = `
    Bertindaklah sebagai validasi sistem UI game Blue Archive.
        
    Langkah 1: Cek apakah gambar ini mengandung level bar Blue archive (ciri cirinya terdapat persegi panjang dengan ujung kanan miring dan berwarna biru yang isinya bertuliskan Lv yang dibawahnya ada angka dibawah, dan disamping ada nickname player, progess bar dari exp player, dan jumlah dan target exp (99/999)).
    
    Langkah 2:
    - JIKA gambar TIDAK valid, buram, atau teks Level tidak ditemukan:
      Kembalikan JSON: {"valid": false, "error": "Tampilan tidak sesuai / Data tidak terbaca"}
      
    - JIKA gambar valid:
      Ekstrak Level dan EXP.
      Kembalikan JSON: 
      {
        "valid": true, 
        "lv": (integer), 
        "exp_current": (integer/string "MAX"), 
        "exp_max": (integer/string "MAX")
      }
      
    PENTING: Hanya berikan output RAW JSON tanpa markdown.
  `;

	try {
		// 3. Setup Konten sesuai format SDK @google/genai
		const contents = [
			{ text: systemPrompt },
			{
				inlineData: {
					mimeType: 'image/jpeg',
					data: base64Image
				}
			}
		];

		// 4. Request ke Model
		const response = await ai.models.generateContent({
			model: config.gemini.model, // e.g., 'gemini-2.0-flash-exp'
			config: {
				responseMimeType: 'application/json',
				temperature: 0.1, // Rendah untuk akurasi data
				topP: 0.8,
				maxOutputTokens: 300 // Hemat token
			},
			contents: contents
		});

		// 5. Ekstraksi Hasil
		// SDK @google/genai biasanya mengembalikan hasil teks langsung di properti .text() atau .text
		const textOutput = response.text;

		console.log('AI Output:', textOutput);

		if (!textOutput) throw new Error('AI tidak memberikan respon teks.');

		// 6. Parsing JSON (Robust)
		const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
		if (!jsonMatch) throw new Error('Format respon AI tidak valid (Bukan JSON).');

		const cleanJson = jsonMatch[0];
		return JSON.parse(cleanJson);
	} catch (error) {
		console.error('Scan Service Error (@google/genai):', error);
		// Lempar error agar UI menampilkan pesan
		throw new Error(error.message || 'Gagal memproses gambar dengan AI.');
	}
}
