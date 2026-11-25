# Module Specification: Lectures & Study Materials
**Document Version:** 1.0  
**Date:** November 25, 2026  
**Author:** Senior Full-Stack Engineer  

---

## 1. Module Purpose & Roles Involved
Delivers structured lesson media, Cloudinary-hosted lecture notes, and per-student completion tracking:
- **Instructor / Admin:** Authors lectures, uploads PDF/slides to Cloudinary, and structures the curriculum.
- **Student:** Streams lesson videos, downloads materials, and marks lectures completed to advance course progress.

---

## 2. Database Entities Involved
- `lectures` (Lesson metadata, video URL, duration, sequence)
- `study_materials` (File attachments, Cloudinary URL, file type, file size in KB)
- `lecture_progress` (Student lecture completion log with composite uniqueness on `student_id + lecture_id`)

---

## 3. Implemented REST API Endpoints

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/lectures/{id}` | Lecture details, materials list, student completion flag | Any Authenticated |
| `POST` | `/api/v1/lectures/{id}/progress` | Toggle lecture completion, compute course progress % | `student` |
| `POST` | `/api/v1/lectures/{id}/materials`| Multipart upload of study material to Cloudinary | `admin`, `instructor` |

---

## 4. Business Rules & Technical Formulas
$$\text{Course Progress Percentage} = \left( \frac{\sum \text{Completed Lectures by Student}}{\text{Total Published Lectures in Course}} \right) \times 100$$
- Progress is updated in real time upon calling the progress endpoint.
- File uploads are streamed securely to Cloudinary with metadata recorded in MySQL.
