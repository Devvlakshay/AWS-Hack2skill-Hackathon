"""
JSON file-based store replacing MongoDB and Redis.
Data lives in-memory for fast reads and persists to JSON files on disk.
"""

import asyncio
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


class JsonStore:
    """In-memory data store backed by JSON files on disk."""

    def __init__(self, data_dir: str = "data"):
        self._data_dir = Path(data_dir)
        self._collections: dict[str, list[dict]] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    def _get_lock(self, collection: str) -> asyncio.Lock:
        if collection not in self._locks:
            self._locks[collection] = asyncio.Lock()
        return self._locks[collection]

    def _file_path(self, collection: str) -> Path:
        return self._data_dir / f"{collection}.json"

    def load(self) -> None:
        """Load all JSON files from data directory into memory."""
        self._data_dir.mkdir(parents=True, exist_ok=True)
        for fp in self._data_dir.glob("*.json"):
            collection = fp.stem
            try:
                with open(fp, "r") as f:
                    self._collections[collection] = json.load(f)
            except (json.JSONDecodeError, IOError):
                self._collections[collection] = []
            self._locks[collection] = asyncio.Lock()

    def _persist(self, collection: str) -> None:
        """Write a collection to its JSON file."""
        self._data_dir.mkdir(parents=True, exist_ok=True)
        fp = self._file_path(collection)
        with open(fp, "w") as f:
            json.dump(self._collections.get(collection, []), f, indent=2, default=_json_default)

    def _ensure_collection(self, collection: str) -> list[dict]:
        if collection not in self._collections:
            self._collections[collection] = []
        return self._collections[collection]

    # ------------------------------------------------------------------
    # Query helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _match(doc: dict, query: dict) -> bool:
        """Check if a document matches a query (supports equality, $gte, $lte, $text)."""
        for key, value in query.items():
            if key == "$text":
                search_terms = value.get("$search", "").lower().split()
                searchable = " ".join(
                    str(doc.get(f, "")) for f in ("name", "description", "tags")
                ).lower()
                if not all(term in searchable for term in search_terms):
                    return False
                continue

            doc_val = doc.get(key)

            if isinstance(value, dict):
                # Range operators
                if "$gte" in value and (doc_val is None or doc_val < value["$gte"]):
                    return False
                if "$lte" in value and (doc_val is None or doc_val > value["$lte"]):
                    return False
            else:
                if doc_val != value:
                    return False
        return True

    # ------------------------------------------------------------------
    # CRUD operations (all async for drop-in replacement)
    # ------------------------------------------------------------------

    async def find_one(self, collection: str, query: dict) -> Optional[dict]:
        docs = self._ensure_collection(collection)
        for doc in docs:
            if self._match(doc, query):
                return _copy(doc)
        return None

    async def find_many(
        self,
        collection: str,
        query: dict,
        sort_field: Optional[str] = None,
        sort_order: int = -1,
        skip: int = 0,
        limit: int = 0,
    ) -> list[dict]:
        docs = self._ensure_collection(collection)
        results = [_copy(d) for d in docs if self._match(d, query)]

        if sort_field:
            reverse = sort_order == -1
            results.sort(key=lambda d: d.get(sort_field, ""), reverse=reverse)

        if skip:
            results = results[skip:]
        if limit:
            results = results[:limit]
        return results

    async def count(self, collection: str, query: dict) -> int:
        docs = self._ensure_collection(collection)
        return sum(1 for d in docs if self._match(d, query))

    async def insert_one(self, collection: str, document: dict) -> str:
        async with self._get_lock(collection):
            docs = self._ensure_collection(collection)
            doc_id = uuid.uuid4().hex
            document = _copy(document)
            document["_id"] = doc_id
            docs.append(document)
            self._persist(collection)
            return doc_id

    async def update_one(self, collection: str, query: dict, update: dict) -> int:
        """Update first matching doc. Returns number of modified documents (0 or 1)."""
        async with self._get_lock(collection):
            docs = self._ensure_collection(collection)
            for doc in docs:
                if self._match(doc, query):
                    if "$set" in update:
                        doc.update(update["$set"])
                    if "$inc" in update:
                        for k, v in update["$inc"].items():
                            doc[k] = doc.get(k, 0) + v
                    self._persist(collection)
                    return 1
            return 0

    async def find_one_and_update(
        self, collection: str, query: dict, update: dict
    ) -> Optional[dict]:
        """Update first matching doc and return the updated document."""
        async with self._get_lock(collection):
            docs = self._ensure_collection(collection)
            for doc in docs:
                if self._match(doc, query):
                    if "$set" in update:
                        doc.update(update["$set"])
                    if "$inc" in update:
                        for k, v in update["$inc"].items():
                            doc[k] = doc.get(k, 0) + v
                    self._persist(collection)
                    return _copy(doc)
            return None


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _json_default(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def _copy(d: dict) -> dict:
    """Shallow copy a dict to prevent mutation of internal data."""
    return dict(d)
