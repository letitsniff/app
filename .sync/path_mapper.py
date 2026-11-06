import re
from pathlib import Path

# Mapping of Drive Pillar Number (1..18) -> (Macro Dir Name, Local Pillar Dir Name, Local Pillar Number)
DRIVE_TO_LOCAL_PILLAR = {
    1: ("01 - Αστική Ζωή & Καθημερινότητα", "01 - Η Φιλοσοφία Let It Sniff & Αστική Βόλτα", 1),
    2: ("01 - Αστική Ζωή & Καθημερινότητα", "02 - Ζωή στην Πολυκατοικία & Διαχείριση Άγχους", 2),
    8: ("01 - Αστική Ζωή & Καθημερινότητα", "03 - Ταξίδια, Μετακινήσεις στην Αθήνα & Διακοπές", 3),
    17: ("01 - Αστική Ζωή & Καθημερινότητα", "04 - Πάρκα Σκύλων, Dog Walkers & Κοινωνική Ζωή στην Πόλη", 4),

    3: ("02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία", "01 - Αντιδραστικότητα, Φοβίες & Ερεθίσματα της Πόλης", 1),
    10: ("02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία", "02 - Παράξενες Συμπεριφορές & Καθημερινά Αινίγματα", 2),
    12: ("02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία", "03 - Πώς Εκφράζονται τα Σκυλιά (Γλώσσα Σώματος & Σήματα Ηρεμίας)", 3),
    13: ("02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία", "04 - Φωνητική Έκφραση & Επικοινωνία Μεταξύ Σκύλων", 4),
    18: ("02 - Συμπεριφορά, Επικοινωνία & Ψυχολογία", "05 - Η Ψυχολογία του Κηδεμόνα στην Πόλη", 5),

    4: ("03 - Στάδια Ζωής & Υιοθεσία", "01 - Κουτάβι στο Διαμέρισμα (Puppy Hub)", 1),
    9: ("03 - Στάδια Ζωής & Υιοθεσία", "02 - Φυλές, Ημίαιμα & Γενετικά Ένστικτα στο Διαμέρισμα", 2),
    11: ("03 - Στάδια Ζωής & Υιοθεσία", "03 - Ηλικία, Υγεία, Ορμόνες & Συμπεριφορά", 3),
    14: ("03 - Στάδια Ζωής & Υιοθεσία", "04 - Πριν την Υιοθεσία (Επιλογή Σκύλου & Προετοιμασία)", 4),
    15: ("03 - Στάδια Ζωής & Υιοθεσία", "05 - Η Μετάβαση μετά την Υιοθεσία (Αποσυμπίεση & Δέσιμο)", 5),

    5: ("04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός", "01 - Επιστήμη, Θετική Εκπαίδευση & Κατάρριψη Μύθων", 1),
    6: ("04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός", "02 - Συνεργατική Φροντίδα, Κτηνίατρος & Grooming", 2),
    7: ("04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός", "03 - Οικογένεια, Μωρά, Παιδιά & Πολλά Κατοικίδια", 3),
    16: ("04 - Εκπαίδευση, Φροντίδα & Εξοπλισμός", "04 - Εξοπλισμός, Λιχουδιές & Αισθητηριακός Πλούτος", 4),
}

LOCAL_TO_DRIVE_PILLAR = {}
for drive_num, (macro_dir, local_dir, _) in DRIVE_TO_LOCAL_PILLAR.items():
    suffix = local_dir.split(" - ", 1)[1]
    drive_dir = f"{drive_num:02d} - {suffix}"
    LOCAL_TO_DRIVE_PILLAR[(macro_dir, local_dir)] = (drive_dir, drive_num)

def map_drive_rel_to_local_rel(rel_path: str) -> str:
    """
    Maps Google Drive relative path (e.g. blog/08 - .../01. Article.md)
    to local Git repository relative path (e.g. blog/01 - .../03 - .../01. Article.md).
    """
    p = Path(str(rel_path).replace("\\", "/"))
    parts = list(p.parts)
    prefix = []
    if parts and parts[0] == "blog":
        prefix = ["blog"]
        parts = parts[1:]
    if parts:
        m = re.match(r"^(\d{1,2})\s+-", parts[0])
        if m:
            drive_num = int(m.group(1))
            if drive_num in DRIVE_TO_LOCAL_PILLAR:
                macro_dir, local_pillar_dir, local_num = DRIVE_TO_LOCAL_PILLAR[drive_num]
                rest = parts[1:]
                if rest and re.match(r"^00\..*?Πυλώνας\s+\d+", rest[0]):
                    rest = [f"00. Εισαγωγή & Πίνακας Περιεχομένων - Πυλώνας {local_num:02d}.md"] + rest[1:]
                return str(Path(*prefix) / macro_dir / local_pillar_dir / Path(*rest))
    return str(rel_path)

def map_local_rel_to_drive_rel(rel_path: str) -> str:
    """
    Maps local Git repository relative path (e.g. blog/01 - .../03 - .../01. Article.md)
    to Google Drive relative path (e.g. blog/08 - .../01. Article.md).
    Returns None for local-only files like index.md.
    """
    p = Path(str(rel_path).replace("\\", "/"))
    parts = list(p.parts)
    if parts and parts[0] == "blog":
        parts = parts[1:]
    if not parts:
        return None
    # Local-only index.md files
    if len(parts) == 1 and parts[0] == "index.md":
        return None
    if len(parts) == 2 and parts[1] == "index.md":
        return None
    if len(parts) >= 2:
        macro_dir = parts[0]
        local_dir = parts[1]
        key = (macro_dir, local_dir)
        if key in LOCAL_TO_DRIVE_PILLAR:
            drive_dir, drive_num = LOCAL_TO_DRIVE_PILLAR[key]
            rest = parts[2:]
            if rest and re.match(r"^00\..*?Πυλώνας\s+\d+", rest[0]):
                rest = [f"00. Εισαγωγή & Πίνακας Περιεχομένων - Πυλώνας {drive_num:02d}.md"] + rest[1:]
            return str(Path("blog") / drive_dir / Path(*rest))
    return str(rel_path)
