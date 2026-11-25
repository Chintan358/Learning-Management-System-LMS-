from typing import List, Dict, Any, Optional
from decimal import Decimal
from pydantic import BaseModel


class AdminDashboardKPIs(BaseModel):
    total_students: int
    total_instructors: int
    total_courses: int
    total_batches: int
    active_batches: int
    total_revenue: Decimal
    pending_revenue: Decimal
    total_enrollments: int
    recent_enrollments: List[Dict[str, Any]] = []
    enrollment_trends: List[Dict[str, Any]] = []
    course_distribution: List[Dict[str, Any]] = []


class InstructorDashboardKPIs(BaseModel):
    assigned_batches: int
    total_students: int
    pending_evaluations: int
    upcoming_lectures: int
    recent_submissions: List[Dict[str, Any]] = []


class StudentDashboardKPIs(BaseModel):
    enrolled_courses: int
    active_batches: int
    overall_progress_percentage: float
    completed_lectures: int
    total_lectures: int
    pending_assignments: int
    upcoming_quizzes: int
    attendance_percentage: float
