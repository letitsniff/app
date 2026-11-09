#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate 104 post folders in docs/posts/<title>/ containing:
- scenario.md (Complete video script, IG/FB caption, tweet, CTA)
- prompt.md (Exact Gemini Veo prompt in Portrait 9:16)
- video.mp4 (for completed videos)
"""

import os
import glob
import re
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
BLOG_DIR = os.path.join(DOCS_DIR, "blog")
POSTS_DIR = os.path.join(DOCS_DIR, "posts")

os.makedirs(POSTS_DIR, exist_ok=True)

# Pillar hashtag mapping
PILLAR_TAGS = {
    "01": ["#βολτασκυλου", "#οσφρηση", "#σαμαρακι", "#letitsniff"],
    "02": ["#πολυκατοικια", "#αγχοςαποχωρισμου", "#γαβγισμα", "#cratetraining"],
    "03": ["#διακοπεςμεσκυλο", "#ταξιδιμεσκυλο", "#αυτοκινητοσκυλος", "#παραλιασκυλος"],
    "04": ["#παρκοσκυλων", "#dogwalker", "#κοινωνικοποιηση", "#αστικηζωη"],
    "05": ["#θετικηεκπαιδευση", "#μυθοιεκπαιδευσης", "#επιστημησκυλων", "#χωριςβια"],
    "06": ["#συνεργατικηφροντιδα", "#κτηνιατρος", "#grooming", "#νυχιασφαιρα"],
    "07": ["#παιδιακαισκυλος", "#μωροκαισκυλος", "#γατακαισκυλος", "#οικογενεια"],
    "08": ["#αντιδραστικοςσκυλος", "#φοβιεςσκυλου", "#λουρι", "#υπερδιεγερση"],
    "09": ["#ρατσεςσκυλων", "#ημιαιμο", "#γενετικαενστικτα", "#διαμερισμα"],
    "10": ["#περιεργησυμπεριφορα", "#zoomies", "#γλωσσασωματος", "#ψυχολογιασφων"],
    "11": ["#ηλικιωμενοςσκυλος", "#στειρωσησκυλου", "#υγειασκυλου", "#αρθριτιδα"],
    "12": ["#γλωσσασωματοςσκυλου", "#σηματαηρεμιας", "#ουρασκυλου", "#στρεςσκυλου"],
    "13": ["#γαβγισμασκυλου", "#κλαμασκυλου", "#επικοινωνιασφων", "#γρυλισμα"],
    "14": ["#υιοθεσιασκυλου", "#καταφυγιο", "#πρινηνυιοθεσια", "#αδεσποτα"],
    "15": ["#νεοσκυλι", "#κανονας333", "#αποσυμπιεση", "#προσαρμογη"],
    "16": ["#εξοπλισμοςσκυλου", "#λιχουδιες", "#snufflemats", "#kong"],
    "17": ["#κοινωνικηζωη", "#παιχνιδισκυλων", "#χαιρετισμος", "#βολτα"],
    "18": ["#κηδεμοναςσκυλου", "#ψυχολογιακηδεμονα", "#ενοχεςκηδεμονα", "#support"]
}

def clean_md(text):
    if not text:
        return ""
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)
    text = re.sub(r"[*_`#>]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def sanitize_folder_name(name):
    clean = re.sub(r'[\\/*?:"<>|]', '', name)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean[:85]

def get_articles():
    files = sorted(glob.glob(os.path.join(BLOG_DIR, "**", "*.md"), recursive=True))
    articles = []
    for f in files:
        if f.endswith("index.md") or "/00." in f or "images/" in f:
            continue
        articles.append(f)
    return articles

def parse_article(path):
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()

    # Title
    title_m = re.search(r"^# \*\*.*?\d+\\\.\s*(.*?)\*\*", text, re.M)
    if not title_m:
        title_m = re.search(r"^# \*\*(.*?)\*\*", text, re.M)
    title = title_m.group(1).strip() if title_m else os.path.basename(path).replace(".md", "")

    # URL
    url_m = re.search(r"\*\*Προτεινόμενο URL:\*\*\s*(.*)", text)
    url = url_m.group(1).strip() if url_m else ""

    # Category / Pillar
    cat_m = re.search(r"\*\*Κατηγορία:\*\*\s*(.*)", text)
    cat = cat_m.group(1).strip() if cat_m else os.path.dirname(path)

    # Reading time
    time_m = re.search(r"\*\*Χρόνος ανάγνωσης:\*\*\s*(.*)", text)
    reading_time = time_m.group(1).strip() if time_m else "3 λεπτά"

    # TLDR
    tldr_m = re.search(r"\*\*Με μια ματιά \(TL;DR\)\*\*\s*\n+((?:> \* .*\n?)+)", text)
    tldr_lines = []
    if tldr_m:
        tldr_lines = [clean_md(re.sub(r"^>\s*\*\s*", "", line).strip()) for line in tldr_m.group(1).splitlines() if line.strip()]

    # Practical steps
    steps = []
    step_matches = re.findall(r"(?:>|\d+\.)\s*\d*\.?\s*\*\*(.*?)\*\*[:\s]*(.*?)(?=\n(?:>|\d+\.)|\n\n|\Z)", text, re.S)
    for head, body in step_matches:
        h = clean_md(head).rstrip(":")
        b = clean_md(body)
        if h and b and len(h) < 70 and not h.lower().startswith("ναι") and not h.lower().startswith("όχι"):
            steps.append((h, b))

    # Do and Donts
    dos = re.findall(r">\s*\*\s*\*\*Ναι:\*\*\s*(.*)", text)
    donts = re.findall(r">\s*\*\s*\*\*Όχι:\*\*\s*(.*)", text)
    dos = [clean_md(d) for d in dos if clean_md(d)]
    donts = [clean_md(d) for d in donts if clean_md(d)]

    # Pro tip
    protip_m = re.search(r"## \*\*Μικρή Συμβουλή \(Pro Tip\)\*\*\s*\n+(.*?)(?=\n##|\n\*\*|\Z)", text, re.S)
    protip = clean_md(protip_m.group(1)) if protip_m else ""

    return {
        "path": path,
        "title": title,
        "url": url,
        "cat": cat,
        "reading_time": reading_time,
        "tldr": tldr_lines,
        "steps": steps,
        "dos": dos,
        "donts": donts,
        "protip": protip
    }

def generate_prompt_for_article(item):
    title = item["title"]
    cat = item["cat"]
    
    # Context-specific scene description
    lower = title.lower()
    if "sniffari" in lower or "όσφρηση" in lower:
        scene = "A joyful curious dog wearing a comfortable sage green Y-harness walks calmly on a loose curved leash with its caring guardian along a warm Athenian pedestrian street. The dog gently lowers its nose to peacefully sniff blooming wildflowers and the base of an olive tree. Fluid organic motion: sniffing with curiosity, tail wagging slowly in contentment."
    elif "τράβηγμα" in lower or "λουρί" in lower:
        scene = "A guardian and dog walking together in harmony down a sunlit neoclassical street in Athens. The leash hangs in a relaxed J-shaped loose curve without any tension. The dog walks with relaxed loose body language, turning happily towards the guardian who offers a friendly smile and gentle praise."
    elif "σαμαράκι" in lower or "κολάρο" in lower or "εξοπλισμός" in lower:
        scene = "A friendly dog sitting calmly in an Athenian apartment or sunlit balcony, wearing an ergonomic Y-harness that allows full shoulder freedom. The guardian gently clips a soft multi-meter leash to the back ring with care and mutual trust. Gentle vector movement with soft warm breeze."
    elif "καφετέρια" in lower or "εστιατόριο" in lower:
        scene = "A peaceful dog resting comfortably on a soft travel mat beneath an outdoor table at a charming Athenian cafe under sunlit awnings. The guardian sips coffee calmly while the dog rests its chin on its paws, observing the city with complete relaxation."
    elif "γαβγίζει" in lower or "πολυκατοικία" in lower or "κουδούνι" in lower or "άγχος" in lower:
        scene = "Inside a cozy Athens apartment living room with warm wooden floors. A calm dog is happily occupied licking a filled enrichment puzzle toy on its soft dog bed, completely unbothered by the apartment front door, showing absolute peace and security."
    elif "κουτάβι" in lower or "τουαλέτα" in lower:
        scene = "A playful, adorable puppy in a bright Athens apartment, enthusiastically wagging its tail and celebrating with its guardian on a soft rug after an easy, positive training session. Clean organic lines, warm inviting atmosphere."
    elif "παιχνίδι" in lower or "κονγκ" in lower or "παζλ" in lower or "όσφρησης" in lower:
        scene = "A happy dog in a modern apartment energetically and focusedly exploring a colorful snuffle mat and food puzzle on the floor, snuffling peacefully for hidden healthy treats with high mental engagement."
    elif "παραλία" in lower or "θάλασσα" in lower or "ταξίδι" in lower or "διακοπές" in lower:
        scene = "A dog enjoying the sea breeze under the shade of a beach umbrella on a Greek coastal shore, resting near a bowl of fresh water with clear Aegean blue tones in the distance, calm and hydrated."
    elif "αντιδραστικ" in lower or "φοβία" in lower or "ερέθισμα" in lower:
        scene = "A guardian creating safe distance for their dog in a spacious Athens park like Pedion tou Areos. The dog stays below threshold, calmly observing another dog far in the distance while eating a treat from guardian hand, relaxed body language."
    elif "γλώσσα σώματος" in lower or "σήματα" in lower or "ουρά" in lower or "αυτιά" in lower:
        scene = "A close portrait and full body view of an expressive dog communicating subtle calming signals: soft blinks, gentle head turn, and loose curved tail, surrounded by subtle minimalist visual aura of peace."
    elif "υιοθεσία" in lower or "καταφύγιο" in lower or "αδέσποτο" in lower:
        scene = "An emotional heartwarming moment between a newly adopted shelter dog and its guardian in a welcoming home, the dog taking a deep sigh of relief on a comfortable cushion, building trust step by step."
    else:
        scene = f"A calm, happy dog and guardian interacting positively in Athens, illustrating {title[:40].lower()}. The dog displays relaxed posture and soft eyes in a warm, welcoming Mediterranean urban environment."

    prompt_text = f"""A modern minimalist 2D vector animation in clean flat graphic design editorial style. {scene} Warm Mediterranean sunset golden lighting. Color palette: warm cream (#FAF7F2) background, warm golden amber (#C4852A), soft terracotta (#C4522A), sage green (#5A7A54), and dark slate charcoal outlines (#2B2D42). Fluid 2D animation, smooth vector motion, magazine editorial aesthetic, completely textless with no typography, letters, words or watermarks, no photorealism, no 3D. Audio direction: Completely silent video, no voice, no talking, no human speech, no dialogue, no narration, no vocal sounds, mute audio."""

    return prompt_text

def build_post_data(item, index_num):
    title = item["title"]
    url = f"https://letitsniff.gr{item['url']}" if item["url"].startswith("/") else f"https://letitsniff.gr/blog/{item['url']}"
    cat = item["cat"]
    tldr = item["tldr"]
    steps = item["steps"]
    dos = item["dos"]
    donts = item["donts"]
    protip = item["protip"]

    pillar_code = "01"
    m = re.search(r"\b(\d{2})\b", cat)
    if m:
        pillar_code = m.group(1)

    extra_tags = PILLAR_TAGS.get(pillar_code, ["#εκπαιδευσησκυλων", "#letitsniff"])
    all_hashtags = ["#letitsniff", "#εκπαιδευσησκυλων", "#σκυλος", "#θετικηεκπαιδευση", "#αθηνα"] + extra_tags
    hashtag_str = " ".join(dict.fromkeys(all_hashtags))

    # Video script hooks
    hook_phrases = [
        f"Σταμάτα να κάνεις αυτό το λάθος με τον σκύλο σου!",
        f"Ήξερες ότι ο σκύλος σου προσπαθεί να σου πει κάτι πολύ συγκεκριμένο;",
        f"3 πράγματα που αλλάζουν τα πάντα στο θέμα: {title.lower()}",
        f"Αν ο σκύλος σου δυσκολεύεται σε αυτό, δοκίμασε αυτό το απλό βήμα!",
        f"Η νούμερο ένα αλλαγή που θα κάνει τη ζωή σας στην πόλη 10 φορές πιο εύκολη!"
    ]
    hook_spoken = hook_phrases[(index_num - 1) % len(hook_phrases)]
    hook_overlay = f"🚨 {title[:45]}..." if len(title) > 45 else f"🚨 {title}"

    # Visual directions
    visual_dir = f"Οπτικό πλάνο vector animation στο στυλ του Let It Sniff: σκύλος και κηδεμόνας στην Αθήνα, εστίαση στην ήρεμη συμπεριφορά, ανατομικό εξοπλισμό και θετική αλληλεπίδραση."

    # Script body (15-30s spoken Greek)
    script_parts = [f"«{hook_spoken}»"]
    if steps and len(steps) >= 2:
        for idx, (st_h, st_b) in enumerate(steps[:2], 1):
            short_b = st_b.split(".")[0] if "." in st_b else st_b[:80]
            script_parts.append(f"«{idx}ον: {st_h}. {short_b}.»")
    elif tldr:
        for t in tldr[:2]:
            clean_t = t.split(".")[0] if "." in t else t
            script_parts.append(f"«Θυμήσου: {clean_t}.»")
    else:
        script_parts.append("«Δίνουμε στον σκύλο καθαρές επιλογές, χρόνο να επεξεργαστεί τα ερεθίσματα και χτίζουμε ασφάλεια χωρίς πίεση.»")

    if donts:
        clean_dont = donts[0].split(".")[0]
        script_parts.append(f"«Και προσοχή: {clean_dont}.»")

    script_parts.append("«Σώσε αυτό το βίντεο και μπες στο letitsniff.gr να διαβάσεις τον πλήρη οδηγό!»")
    spoken_script = "\n\n".join(script_parts)

    # Overlays
    o1 = f"1️⃣ {steps[0][0] if steps else 'Κατανόηση συμπεριφοράς'}"
    o2 = f"2️⃣ {steps[1][0] if len(steps) > 1 else 'Ήρεμη καθοδήγηση'}"
    o3 = "🐾 letitsniff.gr (Link in bio)"

    # Post caption
    cap_parts = [
        f"🐾 **{title}**\n",
        "Όταν ζούμε στην πόλη με έναν σκύλο, η κατανόηση των αναγκών του κάνει όλη τη διαφορά στη συμβίωση.\n"
    ]
    if tldr:
        cap_parts.append("📌 **Συνοπτικά:**")
        for t in tldr[:3]:
            cap_parts.append(f"• {t}")
        cap_parts.append("")

    if steps:
        cap_parts.append("🛠️ **Πρακτικά βήματα:**")
        for idx, (st_h, st_b) in enumerate(steps[:3], 1):
            cap_parts.append(f"{idx}. **{st_h}:** {st_b[:140]}...")
        cap_parts.append("")

    if donts:
        cap_parts.append(f"⚠️ **Τι αποφεύγουμε:** {donts[0]}")
        cap_parts.append("")

    if protip:
        cap_parts.append(f"💡 **Pro Tip:** {protip}")
        cap_parts.append("")

    cap_parts.append("💬 Εσείς πώς το διαχειρίζεστε με τον δικό σας σκύλο; Γράψτε μου στα σχόλια!\n")
    cap_parts.append(f"🔗 Διαβάστε τον πλήρη αναλυτικό οδηγό: {url}\n")
    cap_parts.append(hashtag_str)

    ig_caption = "\n".join(cap_parts)

    # Tweet
    tw_summary = tldr[0][:110] if tldr else steps[0][1][:110] if steps else "Πρακτικές συμβουλές σύγχρονης εκπαίδευσης για την πόλη."
    tweet = f"🐕 {title[:75]}...\n\n👉 {tw_summary}...\n\n🔗 Οδηγός: {url} #letitsniff #σκυλος"

    # Gemini prompt
    veo_prompt = generate_prompt_for_article(item)

    return {
        "index": index_num,
        "title": title,
        "cat": cat,
        "url": url,
        "hook_spoken": hook_spoken,
        "hook_overlay": hook_overlay,
        "visual_dir": visual_dir,
        "spoken_script": spoken_script,
        "overlays": [o1, o2, o3],
        "ig_caption": ig_caption,
        "tweet": tweet,
        "veo_prompt": veo_prompt
    }

def main():
    articles = get_articles()
    print(f"Generating scenarios & prompts for {len(articles)} articles...")

    master_list = []

    for idx, path in enumerate(articles, 1):
        parsed = parse_article(path)
        data = build_post_data(parsed, idx)
        master_list.append(data)

        # Folder name: e.g. "001 - Τι είναι το Sniffari και πώς η όσφρηση εμπλουτίζει τη βόλτα"
        folder_title = sanitize_folder_name(f"{idx:03d} - {data['title']}")
        folder_path = os.path.join(POSTS_DIR, folder_title)
        os.makedirs(folder_path, exist_ok=True)

        # 1. scenario.md
        scenario_file = os.path.join(folder_path, "scenario.md")
        scenario_content = f"""# 🐾 {data['title']}

**Κατηγορία / Πυλώνας:** {data['cat']}  
**Link Άρθρου:** [{data['url']}]({data['url']})  
**Format:** 9:16 Vertical Video (TikTok / Reels / Shorts / FB Reels) + Social Posts

---

## 🎬 1. Σενάριο Βίντεο για τον Αλέξανδρο (15-30")

### 🎯 Hook (Πρώτα 0-3 δευτερόλεπτα)
* **Προφορικό Hook:** «{data['hook_spoken']}»
* **Τίτλος στην Οθόνη (Overlay):** `{data['hook_overlay']}`

### 🎥 Σκηνοθεσία / Οπτικό Πλάνο (Visual / Animation)
> {data['visual_dir']}

### 🗣️ Προφορικό Κείμενο (Spoken Script / Voiceover)
{data['spoken_script']}

### 📝 Υπότιτλοι Οθόνης (Timed Overlays)
1. `{data['overlays'][0]}`
2. `{data['overlays'][1]}`
3. `{data['overlays'][2]}`

---

## 📸 2. Κείμενο Post (Instagram & Facebook Caption)

```text
{data['ig_caption']}
```

---

## 🐦 3. Post για Twitter / X (< 280 χαρακτήρες)

```text
{data['tweet']}
```
"""
        with open(scenario_file, "w", encoding="utf-8") as f:
            f.write(scenario_content)

        # 2. prompt.md
        prompt_file = os.path.join(folder_path, "prompt.md")
        prompt_content = f"""# 🎬 Gemini Video Prompt: {data['title']}

* **Εργαλείο:** Google Gemini (Veo Video Generation)
* **Αναλογία:** Portrait (9:16)
* **Μορφή:** 2D Minimalist Vector Animation (Editorial Flat Design)
* **Χρωματική Παλέτα:** Warm Cream (`#FAF7F2`), Warm Golden Amber (`#C4852A`), Soft Terracotta (`#C4522A`), Sage Green (`#5A7A54`), Slate Charcoal (`#2B2D42`).

---

## 📋 Prompt για Αντιγραφή & Επικόλληση:

```text
{data['veo_prompt']}
```
"""
        with open(prompt_file, "w", encoding="utf-8") as f:
            f.write(prompt_content)

        # For post 001, if sniffari_pilot_video.mp4 exists in root, copy as video.mp4
        if idx == 1:
            pilot_src = os.path.join(BASE_DIR, "sniffari_pilot_video.mp4")
            if os.path.exists(pilot_src):
                shutil.copy2(pilot_src, os.path.join(folder_path, "video.mp4"))
                print(f"Copied pilot video into {folder_path}/video.mp4")

    # Generate master README.md in docs/posts/
    readme_path = os.path.join(POSTS_DIR, "README.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(f"""# 🐾 Let It Sniff — Social Media Master Hub ({len(master_list)} Θέματα)

Ολοκληρωμένη βιβλιοθήκη σεναρίων και video prompts για τον **Αλέξανδρο (Let It Sniff)**, οργανωμένη ανά θέμα σε αυτόνομους φακέλους.

Κάθε φάκελος περιέχει:
* `scenario.md`: Σενάριο βίντεο, κείμενο ομιλίας, υπότιτλοι, αναλυτικό post caption για Instagram/Facebook, σύντομο Tweet.
* `prompt.md`: Το ακριβές prompt για τη δημιουργία του 9:16 Portrait βίντεο στο Gemini.
* `video.mp4`: Το παραγόμενο αρχείο βίντεο.

---

## 📋 Πίνακας Θεμάτων ({len(master_list)} Posts)

| # | Τίτλος Άρθρου | Πυλώνας | Φάκελος | Video Status |
|---|---------------|---------|---------|:------------:|
""")
        for d in master_list:
            folder_title = sanitize_folder_name(f"{d['index']:03d} - {d['title']}")
            has_vid = os.path.exists(os.path.join(POSTS_DIR, folder_title, "video.mp4"))
            status_str = "✅ Έτοιμο" if has_vid else "⏳ Εκκρεμεί"
            f.write(f"| {d['index']:03d} | [{d['title']}](./{folder_title}/scenario.md) | {d['cat']} | [`./{folder_title}`](./{folder_title}/) | {status_str} |\n")

    print(f"All {len(master_list)} posts created in {POSTS_DIR}")

if __name__ == "__main__":
    main()
