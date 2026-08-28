
from __future__ import annotations

from typing import Any

import httpx


class SarvamAPIError(Exception):
    """Raised when the Sarvam Speech-to-Text API request fails."""

    def __init__(
        self,
        message: str,
        status_code: int | None = None,
    ):
        super().__init__(message)
        self.status_code = status_code


async def transcribe_audio(
    *,
    client: httpx.AsyncClient,
    api_key: str,
    audio_bytes: bytes,
    filename: str,
    content_type: str,
    base_url: str = "https://api.sarvam.ai",
    model: str = "saaras:v2",
    mode: str = "translit",
    language_code: str = "hi-IN",
) -> str:
    """
    Send a browser-recorded audio file to Sarvam Speech-to-Text.

    The caller supplies the httpx AsyncClient so the FastAPI endpoint
    can control the HTTP client's lifetime.
    """

    if not api_key:
        raise SarvamAPIError(
            "Sarvam API key is not configured."
        )

    if not audio_bytes:
        raise SarvamAPIError(
            "The uploaded audio recording is empty."
        )

    url = f"{base_url.rstrip('/')}/speech-to-text"

    headers = {
        "api-subscription-key": api_key,
    }

    files = {
        "file": (
            filename,
            audio_bytes,
            content_type or "audio/webm",
        )
    }

    data = {
        "model": model,
        "mode": mode,
        "language_code": language_code,
    }

    try:
        response = await client.post(
            url,
            headers=headers,
            files=files,
            data=data,
        )
    except httpx.HTTPError as exc:
        raise SarvamAPIError(
            f"Could not connect to Sarvam: {exc}"
        ) from exc

    if response.status_code >= 400:
        detail = _extract_error_message(response)

        raise SarvamAPIError(
            f"Sarvam API returned HTTP {response.status_code}: {detail}",
            status_code=response.status_code,
        )

    try:
        payload: dict[str, Any] = response.json()
    except ValueError as exc:
        raise SarvamAPIError(
            "Sarvam returned an invalid JSON response."
        ) from exc

    transcript = _extract_transcript(payload)

    if not transcript:
        raise SarvamAPIError(
            "Sarvam returned a response without a transcript."
        )

    return transcript


def _extract_transcript(payload: dict[str, Any]) -> str:
    """Extract transcript text from a Sarvam response."""

    transcript = payload.get("transcript")

    if isinstance(transcript, str):
        return transcript.strip()

    results = payload.get("results")

    if isinstance(results, list):
        parts: list[str] = []

        for result in results:
            if not isinstance(result, dict):
                continue

            text = result.get("transcript")

            if isinstance(text, str) and text.strip():
                parts.append(text.strip())

        if parts:
            return " ".join(parts)

    return ""


def _extract_error_message(
    response: httpx.Response,
) -> str:
    """Extract a useful API error without exposing credentials."""

    try:
        payload = response.json()
    except ValueError:
        text = response.text.strip()
        return (
            text[:500]
            if text
            else "Unknown Sarvam API error."
        )

    if isinstance(payload, dict):
        for key in ("error", "message", "detail"):
            value = payload.get(key)

            if isinstance(value, str) and value.strip():
                return value.strip()

            if isinstance(value, dict):
                nested_message = value.get("message")

                if (
                    isinstance(nested_message, str)
                    and nested_message.strip()
                ):
                    return nested_message.strip()

    return "Unknown Sarvam API error."
