from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


# ---------- Auth ----------
class LoginRequest(BaseModel):
    student_id: str
    pin: Optional[str] = None  # for admin login


class StudentOut(BaseModel):
    id: str
    name: str
    role: str
    dietary_pref: str
    student_type: str  # hosteller | day_scholar

    class Config:
        from_attributes = True


class ProfileSetupRequest(BaseModel):
    student_id: str
    dietary_pref: str   # veg | non_veg
    student_type: str   # hosteller | day_scholar


# ---------- Menu ----------
class MenuItemOut(BaseModel):
    id: int
    name: str
    description: str
    category: str
    dietary_tag: str
    cost_weight: float
    week: int
    status: str
    is_locked: bool
    is_staple: bool

    class Config:
        from_attributes = True


class MenuItemCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "lunch"
    dietary_tag: str = "veg"
    cost_weight: float = 1.0
    week: int
    status: str = "candidate"
    is_staple: bool = False


class MenuItemUpdate(BaseModel):
    is_locked: Optional[bool] = None
    status: Optional[str] = None
    is_staple: Optional[bool] = None


# ---------- Voting ----------
class MenuItemWithVotes(MenuItemOut):
    total_votes: int
    voted_by_me: bool = False


class VoteRequest(BaseModel):
    student_id: str
    menu_item_id: int
    week: int


class VoteOut(BaseModel):
    menu_item_id: int
    total_votes: int
    voted_by_me: bool


class VoteStatusOut(BaseModel):
    week: int
    voting_closes_at: datetime
    total_participants: int
    total_students: int
    items: List[MenuItemWithVotes]
    staples: List[MenuItemOut]
    my_vote_item_id: Optional[int]  # the single item the student voted for (or None)
    weekend_blocked: bool  # true if student is day_scholar and today is weekend


class LeaderboardEntry(BaseModel):
    id: int
    name: str
    category: str
    dietary_tag: str
    total_votes: int
    is_locked: bool


class LeaderboardOut(BaseModel):
    week: int
    entries: List[LeaderboardEntry]


class VotingWindowOut(BaseModel):
    week: int
    closes_at: datetime


class VotingWindowUpdate(BaseModel):
    extend_hours: Optional[float] = None
    close_now: bool = False


# ---------- Ratings ----------
class RatingRequest(BaseModel):
    student_id: str
    menu_item_id: int
    rating: int  # 1-5
    rating_date: Optional[date] = None


class RatingOut(BaseModel):
    id: int
    student_id: str
    menu_item_id: int
    date: date
    rating: int

    class Config:
        from_attributes = True


class CheckInOut(BaseModel):
    id: int
    student_id: str
    menu_item_id: int
    date: date

    class Config:
        from_attributes = True


# ---------- Feedback ----------
class FeedbackCreate(BaseModel):
    student_id: str
    text: str


class FeedbackOut(BaseModel):
    id: int
    student_id: str
    text: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Waste tracking & sustainability ----------
class WasteLogCreate(BaseModel):
    amount_kg: float
    notes: str = ""
    log_date: Optional[date] = None
    week: Optional[int] = None


class WasteLogOut(BaseModel):
    id: int
    date: date
    week: int
    amount_kg: float
    notes: str

    class Config:
        from_attributes = True


class SustainabilityOut(BaseModel):
    week: int
    total_waste_kg: float
    baseline_waste_kg: float
    reduction_pct: float
    estimated_savings: float
    daily: List[WasteLogOut]


# ---------- Admin dashboard ----------
class DashboardOut(BaseModel):
    current_week: int
    voting_week: int
    total_students: int
    waste_pct: float
    cost_per_plate: float
    satisfaction_index: float
    total_votes_cast: int
    total_participants: int
    leaderboard: List[LeaderboardEntry]
    recent_feedback: List[FeedbackOut]
    sustainability: SustainabilityOut
    least_preferred_item: Optional[LeaderboardEntry]
    most_preferred_item: Optional[LeaderboardEntry]
