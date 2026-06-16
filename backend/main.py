from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from config import (
    CURRENT_WEEK,
    VOTING_WEEK,
    STAPLE_WEEK,
    TODAY,
    BASELINE_WASTE_KG,
    COST_PER_KG,
)
from database import Base, SessionLocal, engine, get_db
from seed import seed_data

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_data(db)

app = FastAPI(title="MenuMate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_PIN = "1234"
SM_ID_PREFIX = "SM"


def is_weekend(d: date) -> bool:
    return d.weekday() >= 5  # 5=Sat, 6=Sun


@app.get("/")
def health():
    return {"status": "ok", "service": "menumate-api"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@app.post("/api/auth/login", response_model=schemas.StudentOut)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    sid = payload.student_id.strip().upper()

    # Admin login: must provide pin
    if sid == "ADMIN":
        if payload.pin != ADMIN_PIN:
            raise HTTPException(status_code=401, detail="Invalid admin PIN.")
        student = db.get(models.Student, "ADMIN")
        if not student:
            raise HTTPException(status_code=404, detail="Admin account not found.")
        return student

    # Student login: must match SM... pattern
    if not sid.startswith(SM_ID_PREFIX) or len(sid) < 4:
        raise HTTPException(
            status_code=400,
            detail="Invalid ID. Student IDs must start with 'SM' (e.g. SM2024001)."
        )

    student = db.get(models.Student, sid)
    if not student:
        raise HTTPException(status_code=404, detail="Student ID not found. Please contact admin.")
    return student


@app.post("/api/auth/setup-profile", response_model=schemas.StudentOut)
def setup_profile(payload: schemas.ProfileSetupRequest, db: Session = Depends(get_db)):
    student = db.get(models.Student, payload.student_id.upper())
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if payload.dietary_pref not in ("veg", "non_veg"):
        raise HTTPException(status_code=400, detail="dietary_pref must be 'veg' or 'non_veg'")
    if payload.student_type not in ("hosteller", "day_scholar"):
        raise HTTPException(status_code=400, detail="student_type must be 'hosteller' or 'day_scholar'")
    student.dietary_pref = payload.dietary_pref
    student.student_type = payload.student_type
    db.commit()
    db.refresh(student)
    return student


# ---------------------------------------------------------------------------
# Menu
# ---------------------------------------------------------------------------
@app.get("/api/menu", response_model=List[schemas.MenuItemOut])
def get_menu(week: Optional[int] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.MenuItem)
    if week is not None:
        query = query.filter(models.MenuItem.week == week)
    if category is not None:
        query = query.filter(models.MenuItem.category == category)
    return query.order_by(models.MenuItem.category, models.MenuItem.name).all()


@app.get("/api/staples", response_model=List[schemas.MenuItemOut])
def get_staples(db: Session = Depends(get_db)):
    return (
        db.query(models.MenuItem)
        .filter(models.MenuItem.is_staple.is_(True))
        .order_by(models.MenuItem.name)
        .all()
    )


# ---------------------------------------------------------------------------
# Voting window
# ---------------------------------------------------------------------------
def _get_or_create_window(db: Session, week: int) -> models.VotingWindow:
    window = db.get(models.VotingWindow, 1)
    if not window:
        window = models.VotingWindow(id=1, week=week, closes_at=datetime.utcnow() + timedelta(hours=18))
        db.add(window)
        db.commit()
        db.refresh(window)
    return window


@app.get("/api/voting-window", response_model=schemas.VotingWindowOut)
def get_voting_window(week: int = VOTING_WEEK, db: Session = Depends(get_db)):
    window = _get_or_create_window(db, week)
    return schemas.VotingWindowOut(week=window.week, closes_at=window.closes_at)


@app.patch("/api/admin/voting-window", response_model=schemas.VotingWindowOut)
def update_voting_window(payload: schemas.VotingWindowUpdate, db: Session = Depends(get_db)):
    window = _get_or_create_window(db, VOTING_WEEK)
    if payload.close_now:
        window.closes_at = datetime.utcnow()
    elif payload.extend_hours is not None:
        base = window.closes_at if window.closes_at > datetime.utcnow() else datetime.utcnow()
        window.closes_at = base + timedelta(hours=payload.extend_hours)
    db.commit()
    db.refresh(window)
    return schemas.VotingWindowOut(week=window.week, closes_at=window.closes_at)


# ---------------------------------------------------------------------------
# Voting — ONE vote per student per week
# ---------------------------------------------------------------------------
@app.get("/api/votes/{student_id}", response_model=schemas.VoteStatusOut)
def get_vote_status(student_id: str, week: int = VOTING_WEEK, db: Session = Depends(get_db)):
    student = db.get(models.Student, student_id.upper())
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Day scholars cannot vote on weekends
    weekend_blocked = student.student_type == "day_scholar" and is_weekend(TODAY)

    items = (
        db.query(models.MenuItem)
        .filter(models.MenuItem.week == week)
        .order_by(models.MenuItem.category, models.MenuItem.name)
        .all()
    )

    staples = (
        db.query(models.MenuItem)
        .filter(models.MenuItem.is_staple.is_(True))
        .order_by(models.MenuItem.name)
        .all()
    )

    totals = dict(
        db.query(models.Vote.menu_item_id, func.count(models.Vote.id))
        .filter(models.Vote.week == week)
        .group_by(models.Vote.menu_item_id)
        .all()
    )

    # This student's single vote this week
    my_vote = (
        db.query(models.Vote)
        .filter(models.Vote.week == week, models.Vote.student_id == student.id)
        .first()
    )
    my_vote_item_id = my_vote.menu_item_id if my_vote else None

    total_participants = (
        db.query(func.count(func.distinct(models.Vote.student_id)))
        .filter(models.Vote.week == week)
        .scalar()
        or 0
    )
    total_students = (
        db.query(func.count(models.Student.id)).filter(models.Student.role == "student").scalar() or 0
    )

    out_items = [
        schemas.MenuItemWithVotes(
            id=item.id,
            name=item.name,
            description=item.description,
            category=item.category,
            dietary_tag=item.dietary_tag,
            cost_weight=item.cost_weight,
            week=item.week,
            status=item.status,
            is_locked=item.is_locked,
            is_staple=item.is_staple,
            total_votes=int(totals.get(item.id, 0)),
            voted_by_me=(item.id == my_vote_item_id),
        )
        for item in items
    ]

    window = _get_or_create_window(db, week)

    return schemas.VoteStatusOut(
        week=week,
        voting_closes_at=window.closes_at,
        total_participants=total_participants,
        total_students=total_students,
        items=out_items,
        staples=staples,
        my_vote_item_id=my_vote_item_id,
        weekend_blocked=weekend_blocked,
    )


@app.post("/api/votes/cast", response_model=schemas.VoteOut)
def cast_vote(payload: schemas.VoteRequest, db: Session = Depends(get_db)):
    student = db.get(models.Student, payload.student_id.upper())
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Block day scholars on weekends
    if student.student_type == "day_scholar" and is_weekend(TODAY):
        raise HTTPException(status_code=403, detail="Day scholars cannot vote on weekends (Sat/Sun).")

    item = db.get(models.MenuItem, payload.menu_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Check if already voted this week
    existing = (
        db.query(models.Vote)
        .filter(
            models.Vote.student_id == student.id,
            models.Vote.week == payload.week,
        )
        .first()
    )

    if existing:
        if existing.menu_item_id == payload.menu_item_id:
            # Remove vote (toggle off)
            db.delete(existing)
            db.commit()
            total_votes = (
                db.query(func.count(models.Vote.id))
                .filter(models.Vote.menu_item_id == item.id, models.Vote.week == payload.week)
                .scalar() or 0
            )
            return schemas.VoteOut(menu_item_id=item.id, total_votes=int(total_votes), voted_by_me=False)
        else:
            # Change vote to different item
            old_item_id = existing.menu_item_id
            existing.menu_item_id = payload.menu_item_id
            db.commit()
    else:
        db.add(models.Vote(student_id=student.id, menu_item_id=item.id, week=payload.week))
        db.commit()

    total_votes = (
        db.query(func.count(models.Vote.id))
        .filter(models.Vote.menu_item_id == item.id, models.Vote.week == payload.week)
        .scalar() or 0
    )

    return schemas.VoteOut(menu_item_id=item.id, total_votes=int(total_votes), voted_by_me=True)


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------
@app.get("/api/leaderboard", response_model=schemas.LeaderboardOut)
def leaderboard(week: int = VOTING_WEEK, db: Session = Depends(get_db)):
    items = (
        db.query(models.MenuItem)
        .filter(models.MenuItem.week == week, models.MenuItem.is_staple.is_(False))
        .all()
    )
    totals = dict(
        db.query(models.Vote.menu_item_id, func.count(models.Vote.id))
        .filter(models.Vote.week == week)
        .group_by(models.Vote.menu_item_id)
        .all()
    )

    entries = sorted(
        (
            schemas.LeaderboardEntry(
                id=item.id,
                name=item.name,
                category=item.category,
                dietary_tag=item.dietary_tag,
                total_votes=int(totals.get(item.id, 0)),
                is_locked=item.is_locked,
            )
            for item in items
        ),
        key=lambda e: e.total_votes,
        reverse=True,
    )

    return schemas.LeaderboardOut(week=week, entries=entries)


# ---------------------------------------------------------------------------
# Ratings (standalone — no check-in required)
# ---------------------------------------------------------------------------
@app.post("/api/rate", response_model=schemas.RatingOut)
def rate_meal(payload: schemas.RatingRequest, db: Session = Depends(get_db)):
    student = db.get(models.Student, payload.student_id.upper())
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    rating_date = payload.rating_date or TODAY

    record = (
        db.query(models.Rating)
        .filter(
            models.Rating.student_id == student.id,
            models.Rating.menu_item_id == payload.menu_item_id,
            models.Rating.date == rating_date,
        )
        .first()
    )

    if record:
        record.rating = payload.rating
    else:
        record = models.Rating(
            student_id=student.id,
            menu_item_id=payload.menu_item_id,
            date=rating_date,
            rating=payload.rating,
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


@app.get("/api/ratings/{student_id}", response_model=List[schemas.RatingOut])
def get_ratings(student_id: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Rating)
        .filter(models.Rating.student_id == student_id.upper())
        .all()
    )


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------
@app.post("/api/feedback", response_model=schemas.FeedbackOut)
def submit_feedback(payload: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    student = db.get(models.Student, payload.student_id.upper())
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Feedback text cannot be empty")

    record = models.Feedback(student_id=student.id, text=payload.text.strip(), created_at=datetime.utcnow())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.get("/api/admin/feedback", response_model=List[schemas.FeedbackOut])
def list_feedback(db: Session = Depends(get_db)):
    return db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).limit(20).all()


# ---------------------------------------------------------------------------
# Admin: menu management
# ---------------------------------------------------------------------------
@app.post("/api/admin/menu", response_model=schemas.MenuItemOut)
def create_menu_item(payload: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    item = models.MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.patch("/api/admin/menu/{item_id}", response_model=schemas.MenuItemOut)
def update_menu_item(item_id: int, payload: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    item = db.get(models.MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    if payload.is_locked is not None:
        item.is_locked = payload.is_locked
    if payload.status is not None:
        item.status = payload.status
    if payload.is_staple is not None:
        item.is_staple = payload.is_staple
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/admin/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(models.MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(item)
    db.commit()
    return {"deleted": item_id}


# ---------------------------------------------------------------------------
# Admin: waste tracking
# ---------------------------------------------------------------------------
@app.get("/api/admin/waste", response_model=List[schemas.WasteLogOut])
def list_waste(week: int = CURRENT_WEEK, db: Session = Depends(get_db)):
    return (
        db.query(models.WasteLog)
        .filter(models.WasteLog.week == week)
        .order_by(models.WasteLog.date.desc())
        .all()
    )


@app.post("/api/admin/waste", response_model=schemas.WasteLogOut)
def log_waste(payload: schemas.WasteLogCreate, db: Session = Depends(get_db)):
    record = models.WasteLog(
        date=payload.log_date or TODAY,
        week=payload.week or CURRENT_WEEK,
        amount_kg=payload.amount_kg,
        notes=payload.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def _sustainability(db: Session, week: int) -> schemas.SustainabilityOut:
    logs = (
        db.query(models.WasteLog)
        .filter(models.WasteLog.week == week)
        .order_by(models.WasteLog.date)
        .all()
    )
    total_waste_kg = sum(log.amount_kg for log in logs)
    reduction_pct = max(0.0, (BASELINE_WASTE_KG - total_waste_kg) / BASELINE_WASTE_KG * 100)
    estimated_savings = max(0.0, (BASELINE_WASTE_KG - total_waste_kg)) * COST_PER_KG

    return schemas.SustainabilityOut(
        week=week,
        total_waste_kg=round(total_waste_kg, 1),
        baseline_waste_kg=BASELINE_WASTE_KG,
        reduction_pct=round(reduction_pct, 1),
        estimated_savings=round(estimated_savings, 2),
        daily=logs,
    )


@app.get("/api/admin/sustainability", response_model=schemas.SustainabilityOut)
def sustainability(week: int = CURRENT_WEEK, db: Session = Depends(get_db)):
    return _sustainability(db, week)


# ---------------------------------------------------------------------------
# Admin: dashboard
# ---------------------------------------------------------------------------
@app.get("/api/admin/dashboard", response_model=schemas.DashboardOut)
def dashboard(
    current_week: int = CURRENT_WEEK,
    voting_week: int = VOTING_WEEK,
    db: Session = Depends(get_db),
):
    total_students = (
        db.query(func.count(models.Student.id))
        .filter(models.Student.role == "student")
        .scalar()
        or 0
    )

    # Avg ratings for satisfaction
    ratings = db.query(models.Rating).all()
    rated_vals = [r.rating for r in ratings]
    satisfaction_index = (sum(rated_vals) / len(rated_vals)) if rated_vals else 0.0

    total_votes_cast = (
        db.query(func.count(models.Vote.id)).filter(models.Vote.week == voting_week).scalar() or 0
    )
    total_participants = (
        db.query(func.count(func.distinct(models.Vote.student_id)))
        .filter(models.Vote.week == voting_week)
        .scalar()
        or 0
    )

    leaderboard_data = leaderboard(week=voting_week, db=db)
    entries = leaderboard_data.entries

    least_preferred = entries[-1] if entries else None
    most_preferred = entries[0] if entries else None

    recent_feedback = list_feedback(db=db)

    return schemas.DashboardOut(
        current_week=current_week,
        voting_week=voting_week,
        total_students=total_students,
        waste_pct=0.0,
        cost_per_plate=0.0,
        satisfaction_index=round(satisfaction_index, 2),
        total_votes_cast=int(total_votes_cast),
        total_participants=int(total_participants),
        leaderboard=entries[:5],
        recent_feedback=recent_feedback[:5],
        sustainability=_sustainability(db, current_week),
        least_preferred_item=least_preferred,
        most_preferred_item=most_preferred,
    )
