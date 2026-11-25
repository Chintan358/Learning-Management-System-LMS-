# Known Issues, Environmental Constraints & Future Roadmap

**Document Version:** `1.0.0`  
**Application:** Enterprise Learning Management System (LMS)

---

## 1. Environmental Constraints & Workarounds

### 1.1 Cloudinary API Fallback Mode
* **Constraint:** In offline, CI/CD, or development environments where active Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`) are not provided in `.env`, attempting direct cloud upload will throw authentication errors.
* **Architecture Solution:** The LMS implements an automated fallback in `app/services/cloudinary_service.py`. When cloud credentials are empty or contain placeholder values, the service gracefully switches to local file system storage (`/uploads/media/`) while returning formatted web URLs, preventing application crashes.

### 1.2 Razorpay Webhook & Signature Verification
* **Constraint:** Razorpay live webhooks require a publicly addressable HTTPS domain. During local testing behind `localhost:8000`, Razorpay cannot reach local endpoints directly without an ngrok/cloudflared tunnel.
* **Architecture Solution:** The LMS provides client-side checkout signature verification via `POST /api/v1/payments/verify`. For test suites, mock signatures verify against the test key secret using constant-time `hmac.compare_digest` to ensure complete code coverage without relying on third-party network pings.

### 1.3 SQLite vs MySQL Timestamp Dialects
* **Constraint:** SQLite defaults to string/text representation for datetime values, whereas Render's MySQL 8.0 uses native `DATETIME(6)`.
* **Architecture Solution:** SQLAlchemy models standardize on Python `datetime.datetime.now(datetime.timezone.utc)` for default column values to ensure consistent cross-database serialization.

---

## 2. Handled Edge Cases

1. **Email Domain Formatting:**
   - *Behavior:* Pydantic's `email-validator` rejects `.local` domain suffixes as reserved test domains.
   - *Resolution:* All seed users, institutional credentials, and test fixtures are standardized to institutional `.edu` domains (`admin@lms.edu`).

2. **Quiz Retake Prevention:**
   - *Behavior:* Students attempting to retake non-retake quizzes receive `400 Bad Request`.
   - *Resolution:* Pre-exam view inspects student attempt history and disables the "Start Exam" button, displaying the prior scorecard instead.

3. **Batch Overfill Prevention:**
   - *Behavior:* Concurrent enrollment requests could exceed capacity if not checked transactionally.
   - *Resolution:* `POST /batches/{id}/students` executes a count query with transactional locking before creating the student enrollment record.

---

## 3. Future Roadmap Enhancements

1. **Live Video Conferencing Integration:** Native WebRTC or Zoom / Google Meet API integration for real-time virtual classroom sessions.
2. **AI-Powered Assessment Authoring:** LLM-assisted question bank generation with automatic difficulty calibration.
3. **Multi-Tenant White-Labeling:** Multi-institution database partitioning for SaaS commercialization.
