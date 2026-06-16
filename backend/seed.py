from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from config import (
    CURRENT_WEEK,
    VOTING_WEEK,
    STAPLE_WEEK,
    TODAY,
    DEFAULT_VOTING_WINDOW_HOURS,
)
from models import Student, MenuItem, Vote, WasteLog, Feedback, VotingWindow


def seed_data(db: Session) -> None:
    """Populate the database with demo data if it's empty."""
    if db.query(Student).first():
        return  # already seeded

    # ---------------- Students (SM... IDs) ----------------
    students = [
        Student(id="SM2024001", name="Aanya Sharma", role="student", dietary_pref="veg", student_type="hosteller"),
        Student(id="SM2024002", name="Rohan Mehta", role="student", dietary_pref="non_veg", student_type="hosteller"),
        Student(id="SM2024003", name="Kabir Singh", role="student", dietary_pref="veg", student_type="day_scholar"),
        Student(id="SM2024004", name="Priya Nair", role="student", dietary_pref="veg", student_type="day_scholar"),
        Student(id="SM2024005", name="Arjun Rao", role="student", dietary_pref="non_veg", student_type="hosteller"),
        Student(id="SM2024006", name="Diya Patel", role="student", dietary_pref="veg", student_type="hosteller"),
        Student(id="ADMIN", name="Mess Admin", role="admin", dietary_pref="veg", student_type="hosteller"),
    ]
    db.add_all(students)
    db.commit()

    # ---------------- Daily staples (always available) ----------------
    staples = [
        MenuItem(name="Steamed Rice", description="Soft steamed white rice", category="staple", dietary_tag="veg", cost_weight=0.4, week=STAPLE_WEEK, status="served", is_staple=True),
        MenuItem(name="Pulka / Roti", description="Whole-wheat flatbread, made fresh", category="staple", dietary_tag="veg", cost_weight=0.3, week=STAPLE_WEEK, status="served", is_staple=True),
        MenuItem(name="Plain Dal", description="Everyday yellow lentil dal", category="staple", dietary_tag="veg", cost_weight=0.5, week=STAPLE_WEEK, status="served", is_staple=True),
        MenuItem(name="Curd", description="Fresh set curd / dahi", category="staple", dietary_tag="veg", cost_weight=0.3, week=STAPLE_WEEK, status="served", is_staple=True),
    ]
    db.add_all(staples)
    db.commit()

    # ---------------- Week 1 (being served) ----------------
    served_items = [
        MenuItem(name="Masala Khichdi", description="Comfort rice and lentil porridge", category="breakfast", dietary_tag="veg", cost_weight=0.6, week=CURRENT_WEEK, status="served"),
        MenuItem(name="Paneer Butter Masala", description="Creamy tomato paneer curry", category="lunch", dietary_tag="veg", cost_weight=1.2, week=CURRENT_WEEK, status="served", is_locked=True),
        MenuItem(name="Chicken Curry", description="Classic spiced chicken curry", category="lunch", dietary_tag="non_veg", cost_weight=1.8, week=CURRENT_WEEK, status="served"),
        MenuItem(name="Vegetable Cutlet", description="Crisp pan-fried veggie patties", category="snacks", dietary_tag="veg", cost_weight=0.5, week=CURRENT_WEEK, status="served"),
        MenuItem(name="Veg Pulao", description="Fragrant rice with mixed vegetables", category="dinner", dietary_tag="veg", cost_weight=1.0, week=CURRENT_WEEK, status="served"),
        MenuItem(name="Egg Curry", description="Boiled eggs in a spiced gravy", category="dinner", dietary_tag="non_veg", cost_weight=1.3, week=CURRENT_WEEK, status="served"),
        MenuItem(name="Semiya Payasam", description="Sweet vermicelli milk pudding", category="dessert", dietary_tag="veg", cost_weight=0.6, week=CURRENT_WEEK, status="served"),
    ]
    db.add_all(served_items)
    db.commit()

    # ---------------- Week 2 (voting now) ----------------
    candidate_items = [
        MenuItem(name="Masala Dosa", description="Crisp rice crepe with potato filling", category="breakfast", dietary_tag="veg", cost_weight=0.9, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Poha", description="Flattened rice with peanuts and curry leaves", category="breakfast", dietary_tag="veg", cost_weight=0.6, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Upma", description="Semolina porridge with vegetables", category="breakfast", dietary_tag="veg", cost_weight=0.5, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Rajma Chawal", description="Kidney bean curry with steamed rice", category="lunch", dietary_tag="veg", cost_weight=1.0, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Mutton Curry", description="Slow-cooked mutton in rich masala", category="lunch", dietary_tag="non_veg", cost_weight=2.2, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Palak Paneer", description="Spinach and cottage cheese curry", category="lunch", dietary_tag="veg", cost_weight=1.1, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Samosa", description="Crispy fried pastry with spiced potato filling", category="snacks", dietary_tag="veg", cost_weight=0.5, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Bread Pakora", description="Stuffed bread fritters", category="snacks", dietary_tag="veg", cost_weight=0.4, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Fish Curry", description="Coastal-style fish in coconut gravy", category="dinner", dietary_tag="non_veg", cost_weight=1.9, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Paneer Tikka", description="Char-grilled marinated paneer skewers", category="dinner", dietary_tag="veg", cost_weight=1.4, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Aloo Gobi", description="Potato and cauliflower stir-fry", category="dinner", dietary_tag="veg", cost_weight=0.7, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Gulab Jamun", description="Warm syrup-soaked milk dumplings", category="dessert", dietary_tag="veg", cost_weight=0.6, week=VOTING_WEEK, status="candidate"),
        MenuItem(name="Fruit Custard", description="Chilled custard with seasonal fruit", category="dessert", dietary_tag="veg", cost_weight=0.5, week=VOTING_WEEK, status="candidate"),
    ]
    db.add_all(candidate_items)
    db.commit()

    # ---------------- Seed a few votes ----------------
    candidates_by_name = {item.name: item for item in candidate_items}

    seed_votes = [
        ("SM2024002", "Masala Dosa"),
        ("SM2024003", "Rajma Chawal"),
        ("SM2024004", "Palak Paneer"),
        ("SM2024005", "Mutton Curry"),
        ("SM2024006", "Gulab Jamun"),
    ]

    for sid, dish in seed_votes:
        item = candidates_by_name.get(dish)
        if item:
            db.add(Vote(student_id=sid, menu_item_id=item.id, week=VOTING_WEEK))
    db.commit()

    # ---------------- Voting window ----------------
    window = VotingWindow(
        id=1,
        week=VOTING_WEEK,
        closes_at=datetime.utcnow() + timedelta(hours=DEFAULT_VOTING_WINDOW_HOURS),
    )
    db.add(window)
    db.commit()
