from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class StudyMaterialBase(BaseModel):
    title: str
    file_url: str
    file_type: str
    file_size_kb: Optional[int] = None


class StudyMaterialCreate(StudyMaterialBase):
    pass


class StudyMaterialOut(StudyMaterialBase):
    id: int
    lecture_id: int

    model_config = ConfigDict(from_attributes=True)


class LectureBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_mins: Optional[int] = 0
    sequence: Optional[int] = 1


class LectureCreate(LectureBase):
    pass


class LectureUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_mins: Optional[int] = None
    sequence: Optional[int] = None


class LectureOut(LectureBase):
    id: int
    module_id: int
    materials: List[StudyMaterialOut] = []

    model_config = ConfigDict(from_attributes=True)


class CourseModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = 1


class ModuleCreate(CourseModuleBase):
    pass


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class CourseModuleOut(CourseModuleBase):
    id: int
    course_id: int
    lectures: List[LectureOut] = []

    model_config = ConfigDict(from_attributes=True)


class CourseBase(BaseModel):
    course_code: str
    title: str
    description: Optional[str] = None
    category: str
    duration_weeks: Optional[int] = 4
    fee: Optional[Decimal] = Decimal("0.00")
    thumbnail_url: Optional[str] = None
    status: Optional[str] = "draft"


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    course_code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    duration_weeks: Optional[int] = None
    fee: Optional[Decimal] = None
    thumbnail_url: Optional[str] = None
    status: Optional[str] = None


class CourseOut(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseDetailOut(CourseOut):
    modules: List[CourseModuleOut] = []

    model_config = ConfigDict(from_attributes=True)
