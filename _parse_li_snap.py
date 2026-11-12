import re
from pathlib import Path

p = Path(r"c:\Users\ELITEX21012G2\OneDrive\Documents\Projects\Big Projects\RoomSpa\li-asia-jobs.yml")
text = p.read_text(encoding="utf-8", errors="ignore")
print("len", len(text))
print("sample", text[:1500])
print("---")
for m in re.finditer(r'heading "([^"]{5,100})"', text):
    t = m.group(1)
    low = t.lower()
    if any(k in low for k in ["data", "analyst", "analytics", "engineer", "report", "bi ", "sql", "etl", "power bi"]):
        print("H:", t)
ids = set(re.findall(r"(?:currentJobId=|/jobs/view/|jobId=)(\d{10,})", text))
print("ids", sorted(ids)[:40])
