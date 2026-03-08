"""
Migration script: Upload all local images to S3 and update JSON data files.

Usage:
    cd backend
    python migrate_to_s3.py

What it does:
1. Uploads all files from uploads/ directory to the S3 bucket
2. Replaces all http://localhost:8000/uploads/... URLs in JSON data files
   with the corresponding S3 URLs
"""

import json
import os
import mimetypes

import boto3
from dotenv import load_dotenv

load_dotenv()

# ── Config ──────────────────────────────────────────────────────────────────
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "aws-hackathon-fitview")

UPLOADS_DIR = "uploads"
DATA_DIR = "data"
OLD_BASE = "http://localhost:8000/uploads"
S3_BASE = f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com"

# JSON data files that may contain image URLs
DATA_FILES = [
    "products.json",
    "models.json",
    "tryon_sessions.json",
    "style_variations.json",
]

# ── S3 Client ───────────────────────────────────────────────────────────────
s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)


def get_content_type(filepath: str) -> str:
    ct, _ = mimetypes.guess_type(filepath)
    return ct or "application/octet-stream"


# ── Step 1: Upload all files from uploads/ to S3 ───────────────────────────
def upload_all_to_s3():
    if not os.path.isdir(UPLOADS_DIR):
        print(f"No '{UPLOADS_DIR}' directory found. Skipping upload.")
        return

    uploaded = 0
    for root, _, files in os.walk(UPLOADS_DIR):
        for filename in files:
            local_path = os.path.join(root, filename)
            # S3 key = relative path from uploads/ e.g. "products/prod_001_web.png"
            s3_key = os.path.relpath(local_path, UPLOADS_DIR)

            content_type = get_content_type(local_path)

            print(f"  Uploading: {s3_key} ({content_type})")
            with open(local_path, "rb") as f:
                s3.put_object(
                    Bucket=AWS_S3_BUCKET,
                    Key=s3_key,
                    Body=f.read(),
                    ContentType=content_type,
                )
            uploaded += 1

    print(f"\n  {uploaded} files uploaded to s3://{AWS_S3_BUCKET}/\n")


# ── Step 2: Update JSON data files ─────────────────────────────────────────
def update_json_files():
    updated_files = 0

    for fname in DATA_FILES:
        fpath = os.path.join(DATA_DIR, fname)
        if not os.path.exists(fpath):
            print(f"  Skipping {fname} (not found)")
            continue

        with open(fpath, "r") as f:
            raw = f.read()

        if OLD_BASE not in raw:
            print(f"  {fname}: no localhost URLs found, skipping")
            continue

        count = raw.count(OLD_BASE)
        new_raw = raw.replace(OLD_BASE, S3_BASE)

        with open(fpath, "w") as f:
            f.write(new_raw)

        print(f"  {fname}: replaced {count} URLs")
        updated_files += 1

    print(f"\n  {updated_files} data files updated\n")


# ── Main ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\nS3 Bucket : {AWS_S3_BUCKET}")
    print(f"S3 Region : {AWS_REGION}")
    print(f"S3 Base   : {S3_BASE}")
    print(f"Old Base  : {OLD_BASE}\n")

    print("=" * 60)
    print("STEP 1: Uploading local files to S3...")
    print("=" * 60)
    upload_all_to_s3()

    print("=" * 60)
    print("STEP 2: Updating JSON data files...")
    print("=" * 60)
    update_json_files()

    print("=" * 60)
    print("DONE! All images are now served from S3.")
    print(f"Image URLs now point to: {S3_BASE}/...")
    print("=" * 60)
