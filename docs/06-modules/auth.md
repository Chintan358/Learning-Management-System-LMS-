# Module Specification: Authentication & User Management
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
The Authentication & User Management module governs identity, credentials, role enforcement, and user administration across all 3 roles:
- **Admin:** Full governance over all accounts; create users, toggle active status, filter by role/status.
- **Instructor:** Authenticate via JWT, view and update personal profile, change password.
- **Student:** Self-register as student, authenticate via JWT, update profile, change password.

---

## 2. Database Entities Involved
- `roles` (Lookup: `admin`, `instructor`, `student`)
- `users` (Credentials, names, email, status, timestamps)
- `instructors` (Profile extension: bio, qualifications, specialization, years of experience)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/login` | Authenticate user, issue signed JWT token | Public |
| `POST` | `/api/v1/auth/register` | Self-register as student | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & permissions | Any Authenticated |
| `POST` | `/api/v1/auth/change-password` | Update current account password | Any Authenticated |
| `GET` | `/api/v1/users` | List users with role, active status, search filters | `admin` |
| `POST` | `/api/v1/users` | Create user account with assigned role | `admin` |
| `GET` | `/api/v1/users/{id}` | Retrieve specific user account | `admin` or self |
| `PUT` | `/api/v1/users/{id}` | Update account details or instructor profile | `admin` or self |
| `DELETE`| `/api/v1/users/{id}` | Soft-deactivate user account (`is_active = false`)| `admin` |

---

## 4. Security & Business Rules Implemented
1. **Password Hashing:** Hashes stored using `passlib[bcrypt]` with 12 rounds.
2. **JWT Payload:** Contains minimal standard claims (`sub` as string user ID, `role`, `exp` set to 24 hours).
3. **Deactivation Policy:** Deactivated accounts (`is_active == False`) are rejected at login and during every token validation request.
4. **Email Validation:** RFC-compliant email validation via `email-validator` and database unique constraints.
5. **Self-Service Restrictions:** Non-administrators cannot modify roles or active status.
