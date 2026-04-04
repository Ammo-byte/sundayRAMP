from __future__ import annotations

from backend import title_generation


def test_generate_transcript_title_uses_model_output(monkeypatch):
    monkeypatch.setattr(
        title_generation,
        "_generate_title_with_model",
        lambda transcript: "Plan Dinner With Aryan Tonight",
    )

    title = title_generation.generate_transcript_title(
        "we should plan dinner with Aryan tonight around seven"
    )

    assert title == "Plan Dinner With Aryan Tonight"


def test_generate_transcript_title_falls_back_when_model_fails(monkeypatch):
    def fail(_: str) -> str:
        raise RuntimeError("boom")

    monkeypatch.setattr(title_generation, "_generate_title_with_model", fail)

    title = title_generation.generate_transcript_title(
        "need to pick up groceries after class"
    )

    assert title == "Need Pick Up Groceries After"
