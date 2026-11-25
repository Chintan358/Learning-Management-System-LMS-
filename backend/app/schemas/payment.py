from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserProfileOut


class CreateOrderRequest(BaseModel):
    course_id: int


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    key_id: str
    course_id: int
    course_title: str


class VerifyPaymentRequest(BaseModel):
    course_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    id: int
    receipt_number: str
    student_id: int
    course_id: int
    amount: Decimal
    currency: str
    payment_method: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str
    payment_date: Optional[datetime] = None
    created_at: datetime
    student: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)


class FeeSummaryOut(BaseModel):
    total_fee: Decimal
    paid_amount: Decimal
    pending_amount: Decimal
    status: str
