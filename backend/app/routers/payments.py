import datetime
import uuid
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.payment import Payment
from app.models.course import Course
from app.models.batch import Enrollment
from app.models.user import User
from app.models.notification import Notification
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    PaymentOut,
    FeeSummaryOut,
)
from app.dependencies.auth import get_current_user, require_role
from app.services.razorpay_service import (
    create_razorpay_order,
    verify_razorpay_payment_signature,
)

router = APIRouter(prefix="/payments", tags=["Payment & Fee Management"])


@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(
    req: CreateOrderRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Check if already paid
    existing_paid = db.query(Payment).filter(
        Payment.student_id == current_user.id,
        Payment.course_id == req.course_id,
        Payment.status == "paid",
    ).first()
    if existing_paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tuition fee for this course has already been paid.",
        )

    receipt_no = f"REC-{datetime.date.today().year}-{uuid.uuid4().hex[:6].upper()}"
    order_data = create_razorpay_order(
        amount_in_inr=float(course.fee),
        receipt=receipt_no,
        notes={"student_id": current_user.id, "course_id": course.id},
    )

    # Record pending payment entry in database
    payment = Payment(
        receipt_number=receipt_no,
        student_id=current_user.id,
        course_id=course.id,
        amount=course.fee,
        currency="INR",
        payment_method="razorpay",
        razorpay_order_id=order_data["order_id"],
        status="pending",
    )
    db.add(payment)
    db.commit()

    return CreateOrderResponse(
        order_id=order_data["order_id"],
        amount=order_data["amount"],
        currency="INR",
        key_id=order_data["key_id"],
        course_id=course.id,
        course_title=course.title,
    )


@router.post("/verify", response_model=PaymentOut)
def verify_payment(
    req: VerifyPaymentRequest,
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    # Verify cryptographic signature
    is_valid = verify_razorpay_payment_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature,
    )
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature. Transaction could not be verified.",
        )

    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == req.razorpay_order_id,
        Payment.student_id == current_user.id,
    ).first()

    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    payment.razorpay_payment_id = req.razorpay_payment_id
    payment.razorpay_signature = req.razorpay_signature
    payment.status = "paid"
    payment.payment_date = now

    # Activate student enrollment
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == req.course_id,
    ).first()

    if enrollment:
        enrollment.status = "active"
    else:
        enrollment = Enrollment(
            student_id=current_user.id,
            course_id=req.course_id,
            status="active",
        )
        db.add(enrollment)

    # Issue in-app payment confirmation notification
    course = db.query(Course).filter(Course.id == req.course_id).first()
    notif = Notification(
        user_id=current_user.id,
        title="Payment Successful",
        message=f"Your payment of ₹{payment.amount} for {course.title if course else 'Course'} was confirmed (Receipt: {payment.receipt_number}).",
        type="payment",
        action_url="/student/payments",
    )
    db.add(notif)

    db.commit()
    db.refresh(payment)
    return payment


@router.get("", response_model=List[PaymentOut])
def list_payments(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Payment)
    if current_user.role.name == "student":
        query = query.filter(Payment.student_id == current_user.id)
    if status_filter:
        query = query.filter(Payment.status == status_filter)

    return query.order_by(Payment.created_at.desc()).all()


@router.get("/my-fees", response_model=FeeSummaryOut)
def get_student_fee_summary(
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    # Sum tuition across enrolled courses
    enrolled_courses = db.query(Course).join(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    total_fee = sum([c.fee for c in enrolled_courses]) if enrolled_courses else Decimal("0.00")

    # Sum paid payments
    paid_records = db.query(Payment).filter(
        Payment.student_id == current_user.id,
        Payment.status == "paid",
    ).all()
    total_paid = sum([p.amount for p in paid_records]) if paid_records else Decimal("0.00")
    pending = max(Decimal("0.00"), total_fee - total_paid)

    fee_status = "paid" if pending == 0 and total_fee > 0 else ("pending" if total_paid == 0 else "partially_paid")

    return FeeSummaryOut(
        total_fee=total_fee,
        paid_amount=total_paid,
        pending_amount=pending,
        status=fee_status,
    )
