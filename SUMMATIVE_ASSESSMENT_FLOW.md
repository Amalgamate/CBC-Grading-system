# Summative Assessment Flow

This document outlines the complete end-to-end flow for the Summative Assessment module, including the recent optimizations for bulk grading.

## 1. Creation Phase 📝
**Actor:** Admin / Head Teacher / Teacher
**Interface:** `SummativeTests.jsx`

1.  **Create Test:**
    -   Click "Create New Test".
    -   Fill form: Title (e.g., "End of Term 1 Math"), Grade (e.g., "Grade 4"), Subject, Total Marks (e.g., 50).
    -   **Action:** `POST /api/assessments/tests`
    -   **Status:** Created as `DRAFT`.
2.  **Workflow (Approval):**
    -   Teacher clicks "Submit" -> `SUBMITTED`.
    -   Admin clicks "Approve" -> `APPROVED`.
    -   **Publish:** Admin clicks "Publish" -> `PUBLISHED`.
    -   *Only Published tests are available for grading.*

## 2. Assessment Phase (Grading) ✍️
**Actor:** Class Teacher
**Interface:** `SummativeAssessment.jsx`

1.  **Selection:**
    -   Select **Grade**, **Stream**, **Term**.
    -   Select a **Published Test** from the dropdown.
    -   Click "Assess".
2.  **Data Entry:**
    -   System loads the **Class List** (all active learners in that grade/stream).
    -   Teacher enters marks for each student in the table.
    -   System auto-calculates "Descriptor" (e.g., "Exceeding Expectation") based on the grading scale.
3.  **Saving (Optimized):**
    -   Teacher clicks "Save Results".
    -   **Action:** `POST /api/assessments/summative/results/bulk`
    -   **Optimization:** Single API call sends all marks at once (instead of 40+ calls).
    -   **Backend Process:**
        -   Validates data.
        -   Calculates Percentage & Grade (A, B, C...).
        -   Updates `summative_results` table.
        -   **Auto-Ranking:** Recalculates positions (1st, 2nd, 3rd...) for the entire class.

## 3. Reporting Phase 📊
**Actor:** Admin / Parent / Teacher
**Interface:** `SummativeReport.jsx` / `StudentProfile`

1.  **Class Analysis:**
    -   View performance trends for the whole class.
    -   See Grade Distribution (How many A's?).
2.  **Individual Report:**
    -   System generates report card.
    -   Includes: Marks, Percentage, Grade, Position (Rank), and Teacher Comments.

## Technical Implementation Details
-   **Bulk API:** `recordSummativeResultsBulk` handles transactional saving for data integrity.
-   **Auto-Scaling:** Supports dynamic grading scales (CBC 4-level or 8-4-4 style).
-   **Security:** Multi-tenant isolation ensures teachers only see their school's data.
