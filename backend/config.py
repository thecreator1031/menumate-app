from datetime import date

# The week currently being served (with check-ins/ratings already happening)
CURRENT_WEEK = 1

# The upcoming week students are voting on right now
VOTING_WEEK = 2

# Special "week" value for always-available daily staples
STAPLE_WEEK = 0

# Categories used across the menu and voting tabs
MEAL_CATEGORIES = ["breakfast", "lunch", "snacks", "dinner", "dessert"]

# Anchor date used for seeded check-ins / waste logs (today, for demo purposes)
TODAY = date.today()

# Assumed baseline weekly food waste (kg) before MenuMate, used for the
# sustainability report's "reduction" estimate.
BASELINE_WASTE_KG = 25.0

# Assumed cost per kg of food waste (in rupees), for cost-savings estimate.
COST_PER_KG = 40.0

# Default voting window length for the demo, in hours from seed time.
DEFAULT_VOTING_WINDOW_HOURS = 18
