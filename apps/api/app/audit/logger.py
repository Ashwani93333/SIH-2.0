import hashlib
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

def compute_entry_hash(entry: Dict[str, Any], prev_hash: str) -> str:
    payload = {
        "id": entry.get("id"),
        "ts": entry.get("ts"),
        "actor": entry.get("actor"),
        "role": entry.get("role"),
        "action": entry.get("action"),
        "entity": entry.get("entity"),
        "entity_id": entry.get("entity_id"),
        "details": entry.get("details"),
        "prev_hash": prev_hash
    }
    dumped = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(dumped.encode("utf-8")).hexdigest()

class AuditChain:
    def __init__(self):
        self.chain: List[Dict[str, Any]] = []
        self._genesis()

    def _genesis(self):
        genesis_entry = {
            "id": 1,
            "ts": "2026-10-24T00:00:00Z",
            "actor": "System Genesis",
            "role": "SYSTEM",
            "action": "INIT_AUDIT_LOG",
            "entity": "SYSTEM",
            "entity_id": "0",
            "details": "Immutable regulatory governance ledger initialized.",
            "prev_hash": "0" * 64
        }
        genesis_entry["hash"] = compute_entry_hash(genesis_entry, "0" * 64)
        self.chain.append(genesis_entry)

    def log(self, actor: str, role: str, action: str, entity: str, entity_id: str, details: Any) -> Dict[str, Any]:
        prev_hash = self.chain[-1]["hash"]
        entry = {
            "id": len(self.chain) + 1,
            "ts": datetime.utcnow().isoformat() + "Z",
            "actor": actor,
            "role": role,
            "action": action,
            "entity": entity,
            "entity_id": str(entity_id),
            "details": details,
            "prev_hash": prev_hash
        }
        entry["hash"] = compute_entry_hash(entry, prev_hash)
        self.chain.append(entry)
        return entry

    def verify(self) -> Dict[str, Any]:
        """
        Validates hash integrity across every link in the ledger.
        """
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]

            if curr["prev_hash"] != prev["hash"]:
                return {
                    "valid": False,
                    "error_at_index": i,
                    "message": f"Hash chain broken at index {i}: prev_hash mismatch.",
                    "total_entries": len(self.chain)
                }

            recalculated = compute_entry_hash(curr, curr["prev_hash"])
            if recalculated != curr["hash"]:
                return {
                    "valid": False,
                    "error_at_index": i,
                    "message": f"Tampering detected at index {i}: record content does not match hash signature.",
                    "total_entries": len(self.chain)
                }

        return {
            "valid": True,
            "total_entries": len(self.chain),
            "latest_block_hash": self.chain[-1]["hash"],
            "verified_at": datetime.utcnow().isoformat() + "Z",
            "message": "Cryptographic ledger verified. All blocks match immutable hash signatures."
        }

audit_store = AuditChain()
