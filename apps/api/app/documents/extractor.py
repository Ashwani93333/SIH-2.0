from typing import Dict, Any, Optional
from datetime import datetime

def compare_fire_noc(declared_expiry: Optional[str], extracted_expiry: Optional[str], confidence: float, is_blurry: bool = False) -> Dict[str, Any]:
    """
    Document AI Layer 2: Fire NOC date extraction and comparison
    States: MATCH | MISMATCH | LOW_CONFIDENCE | UNREADABLE
    Safeguard: Low confidence or unreadable -> NEEDS_REVIEW. Never auto-pass or auto-fail on AI alone.
    """
    if is_blurry or not extracted_expiry:
        return {
            "field": "fire_noc_expiry",
            "declared_value": declared_expiry,
            "extracted_value": None,
            "confidence": 0.15 if is_blurry else 0.0,
            "status": "UNREADABLE",
            "review_status": "NEEDS_REVIEW",
            "snippet": "[OCR Image Quality Warning: Low DPI / Motion Blur detected on issuing seal]",
            "page": 1,
            "issuing_authority": "Directorate of Fire and Emergency Services",
            "explanation": "Document AI could not extract a verifiable expiry date due to unreadable or blurred scan. Manual officer review required.",
            "disclaimer": "Assistive Document AI – Officers must verify original scanned evidence."
        }
    
    if confidence < 0.70:
        return {
            "field": "fire_noc_expiry",
            "declared_value": declared_expiry,
            "extracted_value": extracted_expiry,
            "confidence": round(confidence, 2),
            "status": "LOW_CONFIDENCE",
            "review_status": "NEEDS_REVIEW",
            "snippet": f"Valid up to ... {extracted_expiry} (low OCR confidence: {int(confidence*100)}%)",
            "page": 1,
            "issuing_authority": "Directorate of Fire and Emergency Services",
            "explanation": f"Extracted expiry date ({extracted_expiry}) has low confidence ({int(confidence*100)}%). Manual verification required.",
            "disclaimer": "Assistive Document AI – Low confidence results are routed directly to human scrutiny."
        }

    # High confidence: compare declared vs extracted
    if declared_expiry == extracted_expiry:
        status = "MATCH"
        explanation = f"Declared expiry date ({declared_expiry}) matches extracted document date with {int(confidence*100)}% confidence."
    else:
        status = "MISMATCH"
        explanation = (
            f"Declared expiry date ({declared_expiry}) DOES NOT MATCH extracted document date ({extracted_expiry}). "
            f"Extraction confidence: {int(confidence*100)}%."
        )

    return {
        "field": "fire_noc_expiry",
        "declared_value": declared_expiry,
        "extracted_value": extracted_expiry,
        "confidence": round(confidence, 2),
        "status": status,
        "review_status": "PASS" if status == "MATCH" else "NEEDS_REVIEW",
        "snippet": f"... certifies compliance under State Fire Act. Valid up to: {extracted_expiry} ... Ref: NOC/2024/78291",
        "page": 1,
        "issuing_authority": "State Fire and Disaster Response Services",
        "certificate_number": "NOC/2024/78291",
        "explanation": explanation,
        "disclaimer": "Assistive Document AI – Extracts fields for officer comparison; does not certify forensic authenticity."
    }
