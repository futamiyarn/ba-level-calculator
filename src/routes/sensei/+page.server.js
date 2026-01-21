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
									text: `Image analysis as a screenshot of the LOBBY/HOME SCREEN or PROFILE/ACCOUNT SCREEN from Blue Archive (mobile gacha RPG NAT Games/Nexon). Detect the screen type FIRST via visual layout (not specific text), then OCR extract the level/EXP if there is a 100% match with the visual characteristics below. Output STRICT JSON ONLY: if valid {"level": int, "exp_current": int} (exp_current=0 if MAX/full bar/Lv>=90); else {"error": "Not BA lobby/profile"}. Use multi-language OCR (JP/KR/EN/ID/TH/TW). ONLY 2 OUTPUT EXAMPLES: Valid {"level":56,"exp_current":1048}; Invalid {"error":"Not BA lobby/profile"}.

**MANDATORY VISUAL CRITERIA FOR LOBBY/HOME SCREEN (all MUST match layout/position/icons/colors, 5-10% shift tolerance):**
1. **TOP-LEFT (15-25% width x 5-15% height, purple/blue/white gradient bar):**
   - Bold glow text: "Lv." (EN/JP/ID/TH) OR "레벨" (KR) + 2-3 digit level (white/purple font, shadow).
   - Immediately right: Thin progress bar (cyan/green fill, empty gray) + text pattern "[3-5 digits]/[4-6 digits]" (slash "/", semi-bold font) FOR EXP (0 if "MAX" or full bar or level>=90).
   - Right again: Stamina "[2-3]/[2-3]" yellow/orange + "+" regen icon (heart/arrow).
   - Yellow/gold coin stack icon + 6-9 digits (comma/thousand sep).
   - Blue/cyan crystal icon (hexagon gem) + 3-5 digits.
2. **TOP-RIGHT (75-95% width x 5% height):**
   - Chibi circle avatar (pink/purple glow border).
   - Envelope mail icon (1-3 unread badges red).
   - Hamburger menu (3 horizontal lines) or 3 dots.
3. **NOTIF BAR (below top bar, 10% height, pink/purple bubbles/icons):**
   - Megaphone/bell icon + "[x/y]" badge (y<=9) for Notice (optional text: "お知らせ"/"공지"/"Notice"/"Pemberitahuan").
   - Pink chat bubble icon + num badge for MomoTalk ("モモトーク"/"모모톡"/"MomoTalk").
   - Checklist/quest icon for Tasks.
   - Blue shopping bag icon for Buy Pyroxene ("ピロキシ"/"피록시"/"Pyroxene").
4. **CENTER (30-70% width x 30-70% height, full-bleed background):**
   - **Large anime-style 2D/Live2D illustration** (1-3 female characters, school/military uniform, big eyes, long hair, halo/glow ring on head, gun/weapon optional, expressive pose) + white/transparent speech bubble (optional text).
   - Gradient/particles themed background: office desk (SCHALE), sunset beach, starry space, fantasy fire/wolf, bokeh/sparkles/flowers (dominant pink/purple/blue).
5. **BOTTOM NAV BAR (full width x 8-12% bottom height, 7-8 horizontal tabs, rounded icons white/glow):**
   - **EXACT ICON ORDER REQUIRED** (universal for all servers):
     1. Pink heart cup (Cafe/カフェ/카페).
     2. Stacked books/open book (Lesson/授業/수업).
     3. Student silhouette list (Students/生徒/학생).
     4. Blue shield/team formation (Formation/編成/편성).
     5. Building/chat bubble (Club/Social/部活/클럽).
     6. Hammer/anvil (Crafting/工房/제작).
     7. Shopping bag (Shop/ショップ/상점).
     8. Glowing orb/crystal (Recruit/募集/모집).
   - 1 tab active: yellow/orange glow underline.
6. **RIGHT SIDE (70-95% width x 20-40% height):**
   - Red/orange horizontal banner "EVENT!" (Kanji/Hangul/Latin) + dynamic art (wolf fire, characters action) + "OPEN!" badge.
   - Pink calendar icon + "days remaining".
   - Recap book + "Campaign" (glow select).
7. **BOTTOM-RIGHT: Digital clock "XX:XX AM/PM" (white pixel font, 24h optional).**
8. **GLOBAL VISUAL SIGNATURES (anti-false positive):**
   - Portrait mobile res (aspect 9:16-19.5:9), anime cel-shading, heavy glow/bloom effects, no realistic graphics.
   - Fonts: Gothic bold for UI, handwritten for dialog.
   - Colors: Pastel pink/purple dominant, no dark mode.
   - No ads/watermarks other than small BA logo (halo+book).

**MANDATORY VISUAL CRITERIA FOR PROFILE/ACCOUNT SCREEN:**
1. **TOP (full width x 5-10% height): "Account Info" (or JP "アカウント情報", KR "계정 정보", ID "Info Akun") + left back arrow.**
2. **TOP BAR same as lobby** (stamina/coins/crystals).
3. **CENTER (50% image): Large chibi avatar of player/student + editable fields (dropdown icons):**
   - Name line + variable text.
   - Yellow title badge + student name (Favor Rank XX).
   - Student Rep: Small chibi image + name.
   - Greeting: Text box 10-30 chars.
4. **BOTTOM-LEFT: Gold badge "Lv. [VariableName] [2-3 digits] MAX" (or non-MAX, exp_current from progress if any, else 0 if MAX).**
5. **BOTTOM TABS: "Player Info" (stats) + "ID Card" (photo card).**
6. **UID: "UID: [6-7 digits]" + download icon.**
7. **Background: Simple blue gradient, no heavy art.**

**EXTRACTION PROCESS (OCR Digits Priority):**
- OCR top-left/badge: Level = digits after "Lv./레벨"; exp_current = digits left of "/" OR 0 if bar is full/"MAX"/Lv>=90/no progress.
- OCR tolerance: 90%+ accurate digits/numbers; ignore non-essential text.
- Edge cases: Cropped? No. Landscape? No. Edited? Check icons/layout first.

EXAMPLE OF VALID OUTPUT: {"level":56,"exp_current":1048}
EXAMPLE OF INVALID OUTPUT: {"error":"Not BA lobby/profile"}`
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
				return { success: true, data: result };
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
