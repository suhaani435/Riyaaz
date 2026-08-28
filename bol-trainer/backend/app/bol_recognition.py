
from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from difflib import SequenceMatcher
from typing import Iterable


# ---------------------------------------------------------------------------
# Recognition configuration
# ---------------------------------------------------------------------------

DEFAULT_BOL_VOCABULARY = (
    "dha",
    "ta",
    "ka",
    "thunga",
    "thai",
    "tat",
    "dig",
    "tin",
    "na",
    "dhin",
    "dhi",
    "ge",
    "ke",
    "te",
    "tete",
    "dhage",
    "dhina",
    "taka",
    "tak",
)


# Small transcription variations that are common enough to normalize
# before fuzzy matching.
NORMALIZATION_ALIASES = {
    "dhaa": "dha",
    "dhha": "dha",
    "taa": "ta",
    "kaa": "ka",
    "tungaa": "thunga",
    "tunga": "thunga",
    "thung": "thunga",
    "thaai": "thai",
    "tatt": "tat",
    "deeg": "dig",
    "dhin": "dhin",
}


@dataclass(frozen=True)
class RecognizedBolToken:
    """
    One token from the speech-to-text transcript and the bol it was
    matched to.

    matched_bol is None when the transcript token could not be matched
    to the supplied Kathak vocabulary.
    """

    text: str
    matched_bol: str | None
    confidence: float
    match_type: str


# ---------------------------------------------------------------------------
# Text normalization
# ---------------------------------------------------------------------------


def normalize_token(token: str) -> str:
    """
    Normalize a single transcript token for comparison.

    This is intentionally conservative. We are not trying to rewrite
    arbitrary speech into a bol. We are only handling casing,
    punctuation, whitespace, and a small number of known transcription
    variants.
    """
    normalized = token.strip().lower()

    # Keep letters/numbers and remove punctuation.
    normalized = re.sub(r"[^a-z0-9]", "", normalized)

    if not normalized:
        return ""

    return NORMALIZATION_ALIASES.get(normalized, normalized)


def tokenize_transcript(transcript: str) -> list[str]:
    """
    Split a Sarvam transcript into normalized tokens.
    """
    if not transcript:
        return []

    raw_tokens = re.findall(r"[A-Za-z0-9]+", transcript)

    return [
        normalized
        for normalized in (normalize_token(token) for token in raw_tokens)
        if normalized
    ]


# ---------------------------------------------------------------------------
# Vocabulary
# ---------------------------------------------------------------------------


def normalize_vocabulary(vocabulary: Iterable[str]) -> list[str]:
    """
    Normalize and de-duplicate a bol vocabulary while preserving order.
    """
    result: list[str] = []
    seen: set[str] = set()

    for bol in vocabulary:
        normalized = normalize_token(bol)

        if normalized and normalized not in seen:
            result.append(normalized)
            seen.add(normalized)

    return result


def get_default_vocabulary() -> list[str]:
    """
    Return the built-in fallback vocabulary.

    The production endpoint should preferably provide the vocabulary
    derived from the application's composition data.
    """
    return list(DEFAULT_BOL_VOCABULARY)


# ---------------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------------


def similarity(a: str, b: str) -> float:
    """
    Return a 0.0–1.0 similarity ratio using SequenceMatcher.
    """
    if not a or not b:
        return 0.0

    return SequenceMatcher(None, a, b).ratio()


def fuzzy_match_bol(
    token: str,
    vocabulary: Iterable[str],
    threshold: float = 0.72,
) -> tuple[str | None, float, str]:
    """
    Match one transcript token against a bol vocabulary.

    Returns:
        (matched_bol, confidence, match_type)

    match_type is one of:
        exact
        fuzzy
        unmatched
    """
    normalized_token = normalize_token(token)
    normalized_vocabulary = normalize_vocabulary(vocabulary)

    if not normalized_token:
        return None, 0.0, "unmatched"

    # Exact match gets maximum confidence.
    if normalized_token in normalized_vocabulary:
        return normalized_token, 1.0, "exact"

    if not normalized_vocabulary:
        return None, 0.0, "unmatched"

    best_match: str | None = None
    best_score = 0.0

    for bol in normalized_vocabulary:
        score = similarity(normalized_token, bol)

        if score > best_score:
            best_score = score
            best_match = bol

    if best_match is None or best_score < threshold:
        return None, round(best_score, 3), "unmatched"

    return best_match, round(best_score, 3), "fuzzy"


# ---------------------------------------------------------------------------
# Main recognition function
# ---------------------------------------------------------------------------


def recognize_bols(
    transcript: str,
    vocabulary: Iterable[str] | None = None,
    threshold: float = 0.72,
) -> list[dict]:
    """
    Recognize Kathak bols from a speech-to-text transcript.

    Parameters
    ----------
    transcript:
        Text returned by the speech-to-text system.

    vocabulary:
        Known Kathak bols. If omitted, a small fallback vocabulary is used.

    threshold:
        Minimum fuzzy similarity required for a match.

    Returns
    -------
    list[dict]
        A list of recognized transcript tokens.

    Example:

        recognize_bols(
            "dha ta ka thunga",
            ["dha", "ta", "ka", "thunga"],
        )

    returns approximately:

        [
            {
                "text": "dha",
                "matched_bol": "dha",
                "confidence": 1.0,
                "match_type": "exact",
            },
            ...
        ]
    """
    if vocabulary is None:
        vocabulary = get_default_vocabulary()

    tokens = tokenize_transcript(transcript)

    results: list[dict] = []

    for token in tokens:
        matched_bol, confidence, match_type = fuzzy_match_bol(
            token,
            vocabulary,
            threshold=threshold,
        )

        result = RecognizedBolToken(
            text=token,
            matched_bol=matched_bol,
            confidence=confidence,
            match_type=match_type,
        )

        results.append(asdict(result))

    return results


# ---------------------------------------------------------------------------
# Convenience helpers
# ---------------------------------------------------------------------------


def recognized_bol_names(
    transcript: str,
    vocabulary: Iterable[str] | None = None,
    threshold: float = 0.72,
) -> list[str]:
    """
    Return only successfully matched bol names.

    Useful when later phases need a simple sequence of recognized bols.
    """
    results = recognize_bols(
        transcript,
        vocabulary=vocabulary,
        threshold=threshold,
    )

    return [
        result["matched_bol"]
        for result in results
        if result["matched_bol"] is not None
    ]


def all_bols_recognized(
    transcript: str,
    vocabulary: Iterable[str] | None = None,
    threshold: float = 0.72,
) -> bool:
    """
    Return True only when every transcript token can be matched
    to the supplied bol vocabulary.

    This is recognition only. It is NOT a performance score.
    """
    results = recognize_bols(
        transcript,
        vocabulary=vocabulary,
        threshold=threshold,
    )

    return bool(results) and all(
        result["matched_bol"] is not None
        for result in results
    )
