from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.knowledge_base import KnowledgeArticle

router = APIRouter(prefix="/knowledge", tags=["Fitness Knowledge Base"])

DEFAULT_ARTICLES = [
    {
        "slug": "exercise-volume-guidelines",
        "title": "Weekly Exercise Volume & Intensity: How Much & What Type?",
        "category": "Volume Guidelines",
        "summary": "Evidence-based guidelines on weekly set volume, rep ranges, and exercise selection for Muscle Growth (Hypertrophy), Strength, and Fat Loss.",
        "icon": "bar-chart",
        "read_time": "5 min read",
        "content": """
### 1. Optimal Weekly Sets per Muscle Group
According to sports science literature (Schoenfeld et al.):
- **Maintenance**: 6–8 hard sets per muscle group per week.
- **Hypertrophy (Muscle Growth)**: 10–20 hard sets per muscle group per week (split across 2–3 training sessions).
- **Maximum Recoverable Volume (MRV)**: 22–25 sets/week. Exceeding this often leads to overtraining without extra gains.

### 2. Rep Ranges & Goals
- **Hypertrophy (Muscle)**: 6 – 12 reps @ 70-85% 1RM (Rest: 90–120s).
- **Max Strength**: 1 – 5 reps @ 85-95% 1RM (Rest: 3–5 min).
- **Muscular Endurance / Fat Burn**: 15 – 25 reps @ 50-65% 1RM (Rest: 30–60s).

### 3. Exercise Selection (Compound vs Isolation)
- **Compound Exercises (60–70% of routine)**: Squats, Deadlifts, Bench Press, Overhead Press, Pull-ups, Rows. Recruits multiple joints & maximum muscle mass.
- **Isolation Exercises (30–40% of routine)**: Bicep Curls, Tricep Extensions, Lateral Raises, Leg Extensions. Direct targeted hypertrophy.
"""
    },
    {
        "slug": "progressive-overload-principles",
        "title": "Mastering Progressive Overload: Reps, Weight & Density",
        "category": "Training Principles",
        "summary": "Learn how to consistently stimulate muscle growth using load progression, double progression, and density density techniques.",
        "icon": "trending-up",
        "read_time": "4 min read",
        "content": """
### Progressive Overload Methods
1. **Load Overload**: Adding weight to the bar when target reps are hit (e.g. 60kg $\rightarrow$ 62.5kg).
2. **Rep Overload (Double Progression)**: Increasing reps with constant weight before increasing load (e.g. 3x8 $\rightarrow$ 3x9 $\rightarrow$ 3x10 $\rightarrow$ add weight).
3. **Set Density**: Decreasing rest intervals between sets while keeping weight and reps constant.
4. **Execution Quality**: Improving time-under-tension and controlled eccentric (negative) phase.
"""
    },
    {
        "slug": "recovery-sleep-nutrition",
        "title": "Recovery Science: Sleep, Hydration & Protein Timing",
        "category": "Recovery Science",
        "summary": "Maximize muscle protein synthesis (MPS) and Central Nervous System (CNS) recovery.",
        "icon": "shield",
        "read_time": "6 min read",
        "content": """
### Recovery Fundamentals
- **Protein Intake**: 1.6–2.2g of protein per kg of bodyweight daily.
- **Hydration Target**: 35ml of water per kg of bodyweight daily + 500ml per hour of intense exercise.
- **Sleep Quality**: 7–9 hours of deep sleep to maximize Growth Hormone (GH) release.
"""
    }
]


@router.get("/articles")
@router.get("/wiki")
def get_knowledge_articles(category: Optional[str] = None, db: Session = Depends(get_db)):
    articles = db.query(KnowledgeArticle).all()
    if not articles:
        for item in DEFAULT_ARTICLES:
            art = KnowledgeArticle(**item)
            db.add(art)
        db.commit()
        articles = db.query(KnowledgeArticle).all()

    if category:
        articles = [a for a in articles if a.category.lower() == category.lower()]
    
    return {"articles": articles}


@router.get("/articles/{slug}")
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.slug == slug).first()
    if not article:
        item = next((a for a in DEFAULT_ARTICLES if a["slug"] == slug), None)
        if item:
            return item
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/calculator/1rm")
def calculate_one_rep_max(weight: float, reps: int):
    if reps <= 0 or weight <= 0:
        return {"estimated_1rm": 0}
    if reps == 1:
        one_rm = weight
    else:
        one_rm = weight * (1 + reps / 30.0)
    
    return {
        "weight_lifted": weight,
        "reps": reps,
        "estimated_1rm": round(one_rm, 1),
        "percentages": {
            "95% (1-2 reps)": round(one_rm * 0.95, 1),
            "90% (3-4 reps)": round(one_rm * 0.90, 1),
            "85% (5-6 reps)": round(one_rm * 0.85, 1),
            "80% (7-8 reps)": round(one_rm * 0.80, 1),
            "75% (9-10 reps)": round(one_rm * 0.75, 1),
            "70% (11-12 reps)": round(one_rm * 0.70, 1)
        }
    }
