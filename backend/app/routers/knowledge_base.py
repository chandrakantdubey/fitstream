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
- **Isolation Exercises (30–40% of routine)**: Bicep Curls, Lateral Raises, Leg Extensions, Tricep Extensions. Targets weak points directly.
        """
    },
    {
        "slug": "progressive-overload-principles",
        "title": "The Golden Rule: Progressive Overload Explained",
        "category": "Exercise Science",
        "summary": "How to consistently build strength and muscle over time without hitting training plateaus.",
        "icon": "trending-up",
        "read_time": "4 min read",
        "content": """
### What is Progressive Overload?
Progressive overload involves gradually increasing the stress placed upon the musculoskeletal system during workout routines.

### 4 Ways to Progressively Overload:
1. **Increase Resistance (Weight)**: Adding 1.25kg - 2.5kg once you hit the top of your rep target.
2. **Increase Volume (Reps / Sets)**: Going from 3 sets of 8 to 3 sets of 12 before increasing load.
3. **Improve Execution & Tempo**: Slowing down eccentric (lowering) phases to 3 seconds for increased time under tension.
4. **Decrease Rest Intervals**: Moving from 2 minutes to 90 seconds rest while maintaining weight and reps.
        """
    },
    {
        "slug": "rpe-and-rir-scale",
        "title": "RPE (Rate of Perceived Exertion) & Reps in Reserve (RIR)",
        "category": "Intensity Management",
        "summary": "Master workout intensity auto-regulation using RPE 1-10 and RIR scales.",
        "icon": "gauge",
        "read_time": "3 min read",
        "content": """
### Understanding RPE and RIR
- **RPE 10 (0 RIR)**: Maximum effort. Could not complete another rep.
- **RPE 9 (1 RIR)**: 1 rep left in the tank before failure.
- **RPE 8 (2 RIR)**: 2 reps left in the tank. (Ideal sweet spot for hyperbolic strength & hypertrophy).
- **RPE 7 (3 RIR)**: 3 reps remaining. Good for warmup sets or dynamic speed work.

### Recommended RPE Target
For most working sets, target **RPE 7.5 to 9** (1 to 3 reps in reserve) to maximize stimulus while minimizing CNS fatigue.
        """
    },
    {
        "slug": "warmup-and-mobility-routine",
        "title": "Essential Warm-up & Injury Prevention Routine",
        "category": "Form & Recovery",
        "summary": "A 5-minute dynamic warm-up protocol to prime joints and increase blood flow before heavy lifting.",
        "icon": "shield-check",
        "read_time": "4 min read",
        "content": """
### Never Skip Dynamic Warm-ups!
Static stretching before lifting decreases peak power output. Use **Dynamic Warm-ups** instead:

1. **Arm Circles & Cat-Cow**: 1 minute (upper body mobility).
2. **Leg Swings & Bodyweight Squats**: 1 minute (hips & glute activation).
3. **World's Greatest Stretch**: 5 reps per side (thoracic spine & hamstrings).
4. **Pyramid Warmup Sets**: Perform 50% 1RM x 5, then 75% 1RM x 2 before your main working set.
        """
    }
]

@router.get("/articles")
def get_knowledge_articles(category: Optional[str] = None, db: Session = Depends(get_db)):
    articles = db.query(KnowledgeArticle).all()
    if not articles:
        # Seed default articles if empty
        for item in DEFAULT_ARTICLES:
            art = KnowledgeArticle(**item)
            db.add(art)
        db.commit()
        articles = db.query(KnowledgeArticle).all()

    if category:
        articles = [a for a in articles if a.category.lower() == category.lower()]
    
    return articles

@router.get("/articles/{slug}")
def get_article_by_slug(slug: str, db: Session = Depends(get_db)):
    article = db.query(KnowledgeArticle).filter(KnowledgeArticle.slug == slug).first()
    if not article:
        # Check default articles list fallback
        item = next((a for a in DEFAULT_ARTICLES if a["slug"] == slug), None)
        if item:
            return item
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.get("/calculator/1rm")
def calculate_one_rep_max(weight: float, reps: int):
    """Epley formula for 1RM estimation"""
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
