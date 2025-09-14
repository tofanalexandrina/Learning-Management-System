# Mentis - Learning Management System

 Mentis is a **web platform** designed to support university teaching and learning. The platform facilitates communication between admins, professors and students, offering role-specific functionalities for each user.

## Table of Contents
 - [General Overview](#general-overview)
 - [Admin Features](#admin-features)
   - [Inviting Users](#inviting-users)
   - [Course Management](#course-management)
- [Professor & Student Registration](#professor--student-registration)
- [User Features](#user-features)
- [Course Management](#course-management-1)
  - [Materials](#materials)
  - [Homeworks](#homeworks)
  - [Quizzes](#quizzes)


## General Overview
Mentis manages three main user types: **Administrator, Professor, and Student**. Each user has a dashboard tailored to their needs, offering an intuitive and user-friendly interface.

## Admin Features
Admin logs in with a pre-defined account and can access two main features: **inviting users** and **managing courses**.
<img width="1348" height="431" alt="Screenshot 2025-09-14 203819" src="https://github.com/user-attachments/assets/d2daf4b3-a099-4d9b-ae64-d3d697a2637d" />

### Inviting Users
Admins can register professors or students via an invitation system.
**Steps:**
1. Click the **Invite** button.  
2. Fill in the registration form:  
   - Personal email (for sending invitation)  
   - Institutional email (username)  
   - Group (students) or groups (professors)  
3. Click **Register** → saves the user in the database with an auto-generated password.  
4. Send invitation email via **Send Email Invite** (using SendGrid API).
<img width="1143" height="463" alt="Screenshot 2025-09-14 203837" src="https://github.com/user-attachments/assets/810585a4-b210-48fc-9d1b-410e0c81a0e7" />
<img width="897" height="427" alt="image" src="https://github.com/user-attachments/assets/a334b44d-9a0c-4ae7-8964-07f620684df4" />

### Course Management
Admins can view professors and assign courses.
**Steps:**
1. Click **Manage Courses** → view professor list (name, email, assigned groups, and courses).  
2. Click **Add Course** → fill in:  
   - Course name  
   - Academic year (e.g., 2024/2025)  
   - Assigned groups  
3. Each course gets a unique access code.  
4. Courses can also be deleted if needed.
<img width="773" height="505" alt="image" src="https://github.com/user-attachments/assets/7ef9354b-7442-4f9f-87b1-31c1705b945c" />
<img width="738" height="449" alt="image" src="https://github.com/user-attachments/assets/dfc00d44-d444-4968-b39c-57676836d39e" />

## Professor & Student Registration
Invited users receive an email with a **Complete Registration** link (includes a token).
**Steps:**
1. Open the link → redirected to registration form.  
2. Complete fields: full name, password, confirm password (institutional email auto-filled).  
3. Submit → account activated and redirected to login page.
<img width="863" height="393" alt="image" src="https://github.com/user-attachments/assets/9a1aee72-9975-42d4-9e02-1f3502acae5d" />
<img width="966" height="487" alt="image" src="https://github.com/user-attachments/assets/bb2b8609-83b7-4313-abd1-7868d92ef3cd" />

## User Features
After login, users see a personalized greeting and motivational quote on the homepage.
<img width="1093" height="531" alt="image" src="https://github.com/user-attachments/assets/bd1119e2-9819-464e-933d-811e8666638b" />
<img width="1100" height="428" alt="image" src="https://github.com/user-attachments/assets/dd5e7ebc-2489-487c-ae69-ac2469491f88" />

### Courses Section
- **Students:** see course name, academic year, and professor.  
- **Professors:** see course name, academic year, assigned groups, and access code.  
- Access course details via **View Course** button.
<img width="1826" height="806" alt="image" src="https://github.com/user-attachments/assets/6851aba0-87d1-4408-8307-f6a226193765" />


## Course Management
Each course contains three main sections: **Materials**, **Homeworks**, and **Quizzes**.

### Materials
- Professors can upload course materials (files).  
- Students can view/download materials, but cannot upload.
<img width="1636" height="775" alt="image" src="https://github.com/user-attachments/assets/14c04004-500e-4049-a23a-d5627e8154eb" />


### Homeworks
- Professors can create assignments including: title, description, files, and due date.  
- Students can view assignment details, download files, and upload solutions.  
- Submission date and time are saved automatically.  
- Professors can view submissions grouped by student groups and download files for evaluation.
<img width="1505" height="922" alt="image" src="https://github.com/user-attachments/assets/9ce8a127-d27b-4910-8401-49bae4a43b32" />

### Quizzes
- Professors can create quizzes with multiple-choice questions and time limits.  
- Each question includes: text, answer options, and correct answer.  
- Students complete quizzes within the time limit and receive automatic feedback (score and percentage).
<img width="1434" height="760" alt="image" src="https://github.com/user-attachments/assets/5ded5914-aaa2-4a94-9db8-318535e23944" />















