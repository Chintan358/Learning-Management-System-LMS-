import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import (
    Role,
    User,
    InstructorProfile,
    Course,
    CourseModule,
    Lecture,
    StudyMaterial,
    Batch,
    BatchStudent,
    Enrollment,
    Assignment,
    Quiz,
    Question,
    QuizOption,
    Attendance,
    Payment,
    Notification,
    Announcement,
)
from app.utils.security import get_password_hash
from app.config import settings


def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Seed Roles
        roles_data = [
            {"name": "admin", "description": "System and institute administrator with full platform control"},
            {"name": "instructor", "description": "Course faculty member managing lectures, assignments, and grading"},
            {"name": "student", "description": "Learner consuming course content, submitting assignments, and taking quizzes"},
        ]

        roles = {}
        for r in roles_data:
            existing = db.query(Role).filter_by(name=r["name"]).first()
            if not existing:
                role_obj = Role(name=r["name"], description=r["description"])
                db.add(role_obj)
                db.flush()
                roles[r["name"]] = role_obj
            else:
                roles[r["name"]] = existing
        db.commit()
        print("Roles seeded.")

        # 2. Seed Users
        # Admin
        admin_user = db.query(User).filter_by(email=settings.FIRST_ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                role_id=roles["admin"].id,
                first_name=settings.FIRST_ADMIN_FIRST_NAME,
                last_name=settings.FIRST_ADMIN_LAST_NAME,
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                phone="+91 9876543210",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                is_active=True,
            )
            db.add(admin_user)
            db.flush()
            print(f"Admin user seeded: {settings.FIRST_ADMIN_EMAIL}")

        # Instructor
        instructor_email = "instructor@lms.local"
        instructor_user = db.query(User).filter_by(email=instructor_email).first()
        if not instructor_user:
            instructor_user = User(
                role_id=roles["instructor"].id,
                first_name="Dr. Alan",
                last_name="Turing",
                email=instructor_email,
                hashed_password=get_password_hash("Instructor@Secure2026!"),
                phone="+91 9876543211",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                is_active=True,
            )
            db.add(instructor_user)
            db.flush()

            # Profile
            inst_profile = InstructorProfile(
                user_id=instructor_user.id,
                bio="Senior Full-Stack Architect & Computing Pioneer with 12+ years teaching experience.",
                qualification="Ph.D. in Computer Science",
                specialization="Distributed Systems & Modern Web Applications",
                experience_years=12,
            )
            db.add(inst_profile)
            db.flush()
            print("Instructor user & profile seeded.")

        # Student 1
        student_email = "student@lms.local"
        student_user = db.query(User).filter_by(email=student_email).first()
        if not student_user:
            student_user = User(
                role_id=roles["student"].id,
                first_name="Alex",
                last_name="Johnson",
                email=student_email,
                hashed_password=get_password_hash("Student@Secure2026!"),
                phone="+91 9876543212",
                avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
                is_active=True,
            )
            db.add(student_user)
            db.flush()
            print("Student 1 user seeded.")

        # Student 2
        student2_email = "jane@lms.local"
        student2_user = db.query(User).filter_by(email=student2_email).first()
        if not student2_user:
            student2_user = User(
                role_id=roles["student"].id,
                first_name="Jane",
                last_name="Smith",
                email=student2_email,
                hashed_password=get_password_hash("Student@Secure2026!"),
                phone="+91 9876543213",
                avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                is_active=True,
            )
            db.add(student2_user)
            db.flush()
            print("Student 2 user seeded.")

        db.commit()

        # 3. Seed Course, Modules & Lectures
        course_code = "CS-FSW101"
        course = db.query(Course).filter_by(course_code=course_code).first()
        if not course:
            course = Course(
                course_code=course_code,
                title="Full-Stack Web Development with React & FastAPI",
                description="Comprehensive masterclass covering React.js, Tailwind CSS, Python FastAPI, SQLAlchemy, MySQL, and production deployment.",
                category="Software Engineering",
                duration_weeks=12,
                fee=14999.00,
                thumbnail_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
                status="published",
            )
            db.add(course)
            db.flush()

            # Modules
            m1 = CourseModule(course_id=course.id, title="Module 1: Modern Web Foundations & React", description="Fundamentals of React 18, JSX, Components, and Hooks", order_index=1)
            m2 = CourseModule(course_id=course.id, title="Module 2: High Performance FastAPI Backend", description="REST architecture, Pydantic validation, and dependency injection", order_index=2)
            m3 = CourseModule(course_id=course.id, title="Module 3: Database & Production Deployment", description="SQLAlchemy ORM, Alembic migrations, Vercel & Render deployment", order_index=3)
            db.add_all([m1, m2, m3])
            db.flush()

            # Lectures for Module 1
            l1 = Lecture(module_id=m1.id, title="1.1 Introduction to Modern React & Component Architecture", description="Understanding virtual DOM, JSX syntax, and building pure UI components.", video_url="https://www.youtube.com/watch?v=bMknfKXIFA8", duration_mins=45, sequence=1)
            l2 = Lecture(module_id=m1.id, title="1.2 React State Management & Custom Hooks", description="Deep dive into useState, useEffect, useCallback, and building reusable logic.", video_url="https://www.youtube.com/watch?v=0ZJgIjIuY7U", duration_mins=55, sequence=2)
            db.add_all([l1, l2])
            db.flush()

            # Study Material for Lecture 1
            sm1 = StudyMaterial(lecture_id=l1.id, title="React Core Architecture Cheatsheet (PDF)", file_url="https://res.cloudinary.com/demo/image/upload/sample.pdf", file_type="pdf", file_size_kb=1024)
            db.add(sm1)

            # Lectures for Module 2
            l3 = Lecture(module_id=m2.id, title="2.1 Building Robust APIs with FastAPI & Pydantic", description="Type annotations, automatic OpenAPI documentation, and request schemas.", video_url="https://www.youtube.com/watch?v=SORiTsvnU28", duration_mins=60, sequence=1)
            db.add(l3)
            db.flush()
            print("Course, modules, and lectures seeded.")

        # 4. Seed Batch
        batch_code = "BATCH-2026-WD01"
        batch = db.query(Batch).filter_by(batch_code=batch_code).first()
        if not batch:
            today = datetime.date.today()
            batch = Batch(
                batch_code=batch_code,
                name="Full-Stack Cohort Alpha 2026",
                course_id=course.id,
                instructor_id=instructor_user.id,
                start_date=today,
                end_date=today + datetime.timedelta(days=90),
                schedule_timing="Mon-Wed-Fri 10:00 AM - 12:00 PM IST",
                capacity=30,
                status="active",
            )
            db.add(batch)
            db.flush()

            # Allocate Students to Batch
            bs1 = BatchStudent(batch_id=batch.id, student_id=student_user.id)
            bs2 = BatchStudent(batch_id=batch.id, student_id=student2_user.id)
            db.add_all([bs1, bs2])

            # Enrollments
            e1 = Enrollment(student_id=student_user.id, course_id=course.id, batch_id=batch.id, status="active")
            e2 = Enrollment(student_id=student2_user.id, course_id=course.id, batch_id=batch.id, status="active")
            db.add_all([e1, e2])

            # Payment record for student 1
            pay1 = Payment(
                receipt_number="REC-2026-0001",
                student_id=student_user.id,
                course_id=course.id,
                amount=14999.00,
                currency="INR",
                payment_method="razorpay",
                razorpay_order_id="order_mock_001",
                razorpay_payment_id="pay_mock_001",
                status="paid",
                payment_date=datetime.datetime.utcnow(),
            )
            db.add(pay1)
            print("Batch, students roster, enrollments, and initial payment record seeded.")

        # 5. Seed Assignment
        asg = db.query(Assignment).filter_by(batch_id=batch.id).first()
        if not asg:
            asg = Assignment(
                batch_id=batch.id,
                title="Assignment 1: Responsive Dashboard UI with Tailwind CSS",
                description="Develop a fully responsive admin sidebar layout with Tailwind CSS adhering to mobile-first standards.",
                attachment_url="https://res.cloudinary.com/demo/image/upload/brief.pdf",
                max_marks=100,
                due_date=datetime.datetime.utcnow() + datetime.timedelta(days=7),
                created_by=instructor_user.id,
            )
            db.add(asg)
            print("Assignment seeded.")

        # 6. Seed Quiz with Questions & Options
        quiz = db.query(Quiz).filter_by(batch_id=batch.id).first()
        if not quiz:
            quiz = Quiz(
                batch_id=batch.id,
                title="Quiz 1: Fundamentals of React & FastAPI",
                description="Timed multiple choice evaluation assessing knowledge of component lifecycle and REST principles.",
                duration_mins=20,
                total_marks=20,
                passing_marks=12,
                window_start=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                window_end=datetime.datetime.utcnow() + datetime.timedelta(days=14),
                allow_retake=False,
            )
            db.add(quiz)
            db.flush()

            # Question 1
            q1 = Question(quiz_id=quiz.id, question_text="Which hook in React is used to manage side-effects such as data fetching?", marks=10)
            db.add(q1)
            db.flush()
            db.add_all([
                QuizOption(question_id=q1.id, option_text="useState", is_correct=False),
                QuizOption(question_id=q1.id, option_text="useEffect", is_correct=True),
                QuizOption(question_id=q1.id, option_text="useContext", is_correct=False),
                QuizOption(question_id=q1.id, option_text="useReducer", is_correct=False),
            ])

            # Question 2
            q2 = Question(quiz_id=quiz.id, question_text="In FastAPI, which library provides automated data parsing and schema validation?", marks=10)
            db.add(q2)
            db.flush()
            db.add_all([
                QuizOption(question_id=q2.id, option_text="Marshmallow", is_correct=False),
                QuizOption(question_id=q2.id, option_text="Pydantic", is_correct=True),
                QuizOption(question_id=q2.id, option_text="Django ORM", is_correct=False),
                QuizOption(question_id=q2.id, option_text="Cerberus", is_correct=False),
            ])
            print("Quiz with questions and options seeded.")

        # 7. Seed Attendance record
        att_exists = db.query(Attendance).filter_by(batch_id=batch.id, student_id=student_user.id, class_date=datetime.date.today()).first()
        if not att_exists:
            att1 = Attendance(
                batch_id=batch.id,
                student_id=student_user.id,
                class_date=datetime.date.today(),
                status="present",
                marked_by=instructor_user.id,
            )
            att2 = Attendance(
                batch_id=batch.id,
                student_id=student2_user.id,
                class_date=datetime.date.today(),
                status="present",
                marked_by=instructor_user.id,
            )
            db.add_all([att1, att2])
            print("Daily attendance seeded.")

        # 8. Announcements & Notifications
        ann = db.query(Announcement).first()
        if not ann:
            ann = Announcement(
                title="Welcome to Full-Stack Cohort Alpha 2026!",
                content="Orientation commences this Wednesday at 10:00 AM IST. Please verify your course materials and tools setup.",
                target_role=None,
                batch_id=batch.id,
                created_by=admin_user.id,
            )
            db.add(ann)

        notif = db.query(Notification).filter_by(user_id=student_user.id).first()
        if notif is None:
            notif = Notification(
                user_id=student_user.id,
                title="Enrollment Confirmed",
                message="Welcome to Full-Stack Web Development! Your batch BATCH-2026-WD01 is now active.",
                type="info",
                action_url="/student/dashboard",
                is_read=False,
            )
            db.add(notif)
            print("Announcement and initial student notification seeded.")

        db.commit()
        print("Database seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error during database seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
