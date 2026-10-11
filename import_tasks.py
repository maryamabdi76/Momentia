"""
Create draft items in a GitHub Project from night-sky-tasks.csv using the GitHub CLI.

Setup (once):
    gh auth login
    gh auth refresh -s project

Run (from the folder that contains the CSV):
    python import_tasks.py --dry-run     # only prints what it would create
    python import_tasks.py               # creates the items
"""
import csv
import subprocess
import sys
import time

OWNER = "maryamabdi76"
PROJECT_NUMBER = "4"
CSV_FILE = "night-sky-tasks.csv"

dry_run = "--dry-run" in sys.argv

with open(CSV_FILE, encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

for row in rows:
    title = f'{int(row["Order"]):02d} - {row["Title"]}'
    body = (
        f'{row["Description"]}\n\n'
        f'Phase: {row["Phase"]}\n'
        f'Estimate: {row["Hours"]}h\n'
        f'Labels: {row["Labels"]}'
    )
    cmd = [
        "gh", "project", "item-create", PROJECT_NUMBER,
        "--owner", OWNER,
        "--title", title,
        "--body", body,
    ]
    if dry_run:
        print("DRY RUN:", title)
        continue
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("FAILED:", title)
        print(result.stderr)
        sys.exit(1)
    print("created:", title)
    time.sleep(0.5)  # be gentle with the API

print("done" if not dry_run else "dry run finished")
