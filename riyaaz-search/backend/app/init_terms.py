from .database import SessionLocal, init_db
from .models import KathakTerm, TermVariation
from .kathak_terms_seed import KATHAK_TERMS


def seed_terms():
    init_db()
    db = SessionLocal()
    try:
        existing = {t.canonical for t in db.query(KathakTerm).all()}
        for canonical, data in KATHAK_TERMS.items():
            if canonical in existing:
                continue
            term = KathakTerm(canonical=canonical, category=data.get("category"))
            db.add(term)
            db.flush()
            for v in data["variations"]:
                db.add(TermVariation(term_id=term.id, variation=v.lower()))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_terms()
