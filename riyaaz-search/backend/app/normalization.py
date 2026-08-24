from dataclasses import dataclass
from typing import List, Optional

from rapidfuzz import fuzz
from sqlalchemy.orm import Session

from .models import KathakTerm, TermVariation


@dataclass
class NormalizedTerm:
    canonical: str
    matched_variations: List[str]
    confidence: float  # 0-100


def normalize_query_term(db: Session, raw_query: str) -> Optional[NormalizedTerm]:
    """
    Map free-text input to a canonical Kathak term.
    1. Exact match against known variations.
    2. Fuzzy match, to catch typos not yet in the dictionary.
    3. Fall back to the raw query itself, so un-seeded terms still search.
    """
    query = raw_query.strip().lower()
    if not query:
        return None

    variations = db.query(TermVariation).all()

    for v in variations:
        if v.variation == query:
            term = db.query(KathakTerm).get(v.term_id)
            return NormalizedTerm(canonical=term.canonical, matched_variations=[v.variation], confidence=100.0)

    best_score = 0.0
    best_term_id = None
    best_variation = None
    for v in variations:
        score = fuzz.ratio(query, v.variation)
        if score > best_score:
            best_score = score
            best_term_id = v.term_id
            best_variation = v.variation

    if best_term_id is not None and best_score >= 70:
        term = db.query(KathakTerm).get(best_term_id)
        return NormalizedTerm(canonical=term.canonical, matched_variations=[best_variation], confidence=best_score)

    return NormalizedTerm(canonical=query, matched_variations=[query], confidence=0.0)


def all_variations_for(db: Session, canonical: str) -> List[str]:
    term = db.query(KathakTerm).filter(KathakTerm.canonical == canonical).first()
    if not term or not term.variations:
        return [canonical]
    return [v.variation for v in term.variations]


def text_matches_term(text: str, variations: List[str], fuzzy_threshold: int = 85) -> Optional[float]:
    """Return a match score (0-100) if `text` plausibly contains one of the
    given variations, else None. Cheap substring match first (captions are
    usually clean), falling back to fuzzy partial matching for ASR noise."""
    lowered = text.lower()
    for v in variations:
        if v in lowered:
            return 100.0
    best = 0.0
    for v in variations:
        score = fuzz.partial_ratio(v, lowered)
        best = max(best, score)
    return best if best >= fuzzy_threshold else None


def all_known_terms(db: Session):
    return db.query(KathakTerm).all()
