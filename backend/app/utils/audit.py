import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


async def log_audit_event(
    store,  # JsonStore for now, MongoDB later
    event_type: str,
    user_id: str,
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    status: str = "success",
    metadata: Optional[dict] = None,
):
    """Log an audit event for security compliance."""
    event = {
        "event_type": event_type,
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "status": status,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        await store.insert_one("audit_logs", event)
    except Exception as e:
        logger.error(f"Audit log failed: {e}")
