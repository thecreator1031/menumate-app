from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True)  # e.g. "SM2024001" or "ADMIN"
    name = Column(String, nullable=False)
    role = Column(String, default="student")  # "student" | "admin"
    dietary_pref = Column(String, default="veg")  # veg | non_veg
    student_type = Column(String, default="hosteller")  # hosteller | day_scholar

    votes = relationship("Vote", back_populates="student")
    checkins = relationship("CheckIn", back_populates="student")
    feedback = relationship("Feedback", back_populates="feedback_student")
    ratings = relationship("Rating", back_populates="student")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    category = Column(String, default="lunch")  # breakfast | lunch | snacks | dinner | dessert | staple
    dietary_tag = Column(String, default="veg")  # veg | non_veg
    cost_weight = Column(Float, default=1.0)
    week = Column(Integer, nullable=False)
    status = Column(String, default="candidate")  # candidate | scheduled | served
    is_locked = Column(Boolean, default=False)
    is_staple = Column(Boolean, default=False)
    skipped_week = Column(Integer, nullable=True)  # week when this item was least preferred (postponed)

    votes = relationship("Vote", back_populates="menu_item")
    checkins = relationship("CheckIn", back_populates="menu_item")
    ratings = relationship("Rating", back_populates="menu_item")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("student_id", "week", name="uq_one_vote_per_week"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    week = Column(Integer, nullable=False)

    student = relationship("Student", back_populates="votes")
    menu_item = relationship("MenuItem", back_populates="votes")


class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    date = Column(Date, nullable=False)

    student = relationship("Student", back_populates="checkins")
    menu_item = relationship("MenuItem", back_populates="checkins")


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("student_id", "menu_item_id", "date", name="uq_rating_once"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    date = Column(Date, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5

    student = relationship("Student", back_populates="ratings")
    menu_item = relationship("MenuItem", back_populates="ratings")


class WasteLog(Base):
    __tablename__ = "waste_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    week = Column(Integer, nullable=False)
    amount_kg = Column(Float, nullable=False)
    notes = Column(String, default="")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    text = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)

    feedback_student = relationship("Student", back_populates="feedback")


class VotingWindow(Base):
    """Singleton row (id=1) controlling when voting closes."""

    __tablename__ = "voting_window"

    id = Column(Integer, primary_key=True)
    week = Column(Integer, nullable=False)
    closes_at = Column(DateTime, nullable=False)
