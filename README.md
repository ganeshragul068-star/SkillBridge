# SkillBridge — Youth Employability Platform

> **College Full Stack Web Development Project**  
> **Phase 1: Project Setup, Design System & Frontend UI (Completed)**  
> **Phase 2: Backend Development & MongoDB Atlas Integration (Completed)**  
> **Phase 3: Authentication and Role-Based Access Control (Completed)**  
> **Phase 4: Student Profile and Skills Management (Completed)**  
> **Phase 5: Jobs, Internships & Application Management (Completed)**  
> **Phase 6: Smart Job Matching, Skill-Gap Analysis and Course Recommendations (Completed)**

SkillBridge is an end-to-end full-stack platform designed to bridge the gap between college curricula and real-world software engineering job expectations. It enables college students to identify technical skill gaps, access curated roadmaps, discover verified entry-level jobs and internships, and build recruiter-ready resumes.

---

## 🚀 Technology Stack

| Layer | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | v8.3 / v19.3 | Responsive single-page client, fast HMR |
| **Routing** | React Router | v7.18 | Declarative routing across 20 views |
| **Styling** | Modern CSS | Native | Navy blue & white design system |
| **Icons** | Lucide React | v1.65 | Vector UI iconography |
| **Backend** | Node.js + Express.js | Node 18+ / Exp 4.21 | Modular RESTful API architecture |
| **Database** | MongoDB Atlas + Mongoose | Mongoose 8.9 | Schemas, compound indexes, validations |
| **Security** | bcryptjs + JWT | JWT 9.0 | Hashing & role-based access control (RBAC) |
| **Language** | JavaScript (ES6+ CommonJS) | Standard | Clean, maintainable JavaScript |

---

## 📁 Repository Structure

```text
skillbridge/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # 15+ Reusable UI components
│   │   ├── layouts/            # PublicLayout, DashboardLayout, Sidebar
│   │   ├── pages/              # 20 Complete Platform Pages
│   │   ├── services/           # api.js, authService, jobService, skillService
│   │   ├── context/            # AuthContext.jsx, ToastContext.jsx
│   │   ├── hooks/              # useToast.js, useAuth
│   │   ├── data/               # mockData.js (UI preview dataset)
│   │   ├── styles/             # theme.css (CSS variables), global.css
│   │   ├── App.jsx             # React Router orchestration
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client env template
│   ├── .env                    # Local client config (VITE_API_URL)
│   └── package.json            # Client dependencies
│
├── server/                     # Backend API (Node.js + Express.js + Mongoose)
│   ├── config/
│   │   └── db.js               # Safe MongoDB Atlas Mongoose connection
│   ├── controllers/            # Controller business logic
│   │   ├── authController.js   # Register, Login, GetMe
│   │   ├── profileController.js# GetMe, UpdateMe, GetProfileById
│   │   ├── skillController.js  # Add, Get, Update, Delete skills
│   │   ├── jobController.js    # Job listings, filters & admin CRUD
│   │   ├── applicationController.js # Apply, My Applications, Withdraw
│   │   ├── savedJobController.js    # Save/Bookmark, Remove, List
│   │   ├── courseController.js      # Course listings & admin CRUD
│   │   ├── assessmentController.js  # Assessments (answers sanitized), grading
│   │   ├── progressController.js    # Learning progress tracking
│   │   └── adminController.js       # Admin metrics, user list, app review
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect & authorize(RBAC)
│   │   ├── errorMiddleware.js  # Centralized error handler
│   │   └── notFoundMiddleware.js # 404 handler
│   ├── models/                 # 9 Complete Mongoose Models
│   │   ├── User.js             # User auth (student/admin), bcrypt pre-save
│   │   ├── Profile.js          # Student academic portfolio & skills subschema
│   │   ├── Job.js              # Job/internship postings with text indexes
│   │   ├── Application.js      # Job applications with unique compound index
│   │   ├── SavedJob.js         # Saved bookmarks with unique compound index
│   │   ├── Course.js           # Curated skill courses
│   │   ├── Assessment.js       # Diagnostic assessments with questions
│   │   ├── AssessmentResult.js # Graded test results
│   │   └── LearningProgress.js # Milestone tracking with unique skill index
│   ├── routes/                 # Express REST API routes
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── profileRoutes.js    # /api/profiles
│   │   ├── skillRoutes.js      # /api/skills
│   │   ├── jobRoutes.js        # /api/jobs
│   │   ├── applicationRoutes.js# /api/applications
│   │   ├── savedJobRoutes.js   # /api/saved-jobs
│   │   ├── courseRoutes.js     # /api/courses
│   │   ├── assessmentRoutes.js # /api/assessments
│   │   ├── progressRoutes.js   # /api/progress
│   │   └── adminRoutes.js      # /api/admin
│   ├── scripts/
│   │   └── seed.js             # Seed script (10+ jobs, 10+ courses, 5 tests, admin)
│   ├── test/
│   │   └── apiTest.js          # Automated 13-point Phase 2 verification suite
│   ├── app.js                  # Express app, CORS, body parsers, routes
│   ├── server.js               # Safe listener & startup
│   ├── .env.example            # Backend env template
│   ├── .env                    # Local backend environment
│   └── package.json            # Server dependencies & scripts
│
├── .gitignore                  # Ignores node_modules, dist, and .env files
├── package.json                # Root orchestration scripts
└── README.md                   # Full documentation
```

---

## ⚙️ Environment Configuration

### Server (`server/.env`)
Create `server/.env` by copying `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas connection URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/skillbridge?retryWrites=true&w=majority

# JWT Token Secret & Expiration
JWT_SECRET=skillbridge_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=30d

# Initial Admin User Seeding Configuration
ADMIN_NAME=SkillBridge Administrator
ADMIN_EMAIL=admin@skillbridge.edu
ADMIN_INITIAL_PASSWORD=Admin@Pass2026!
```

---

## 💻 How to Run the Project

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm --prefix client install

# Install backend dependencies
npm --prefix server install
```

### 2. Seed Initial Database Data
Once your MongoDB Atlas URI is placed in `server/.env`:
```bash
npm --prefix server run seed
```
This populates:
- **Admin account** (`admin@skillbridge.edu`)
- **Student demo account** (`alex.johnson@college.edu`)
- **11 Verified jobs & internships** (React, Node, Java Spring Boot, Python Data, DevOps, Mobile, QA)
- **10 Curated courses** (MongoDB, Docker, ES6+, Spring Boot, Testing, SQL)
- **5 Diagnostic assessments** with multiple-choice questions & answer explanations

### 3. Run Backend API Server
```bash
npm --prefix server run dev
# or in production:
npm --prefix server start
```
- API Health Check: `http://localhost:5000/api/health`

### 4. Run Automated Test Suites
```bash
# Run all Phase 2 API verification tests (13 tests)
npm test

# Run all Phase 3 Authentication & RBAC tests (12 tests)
npm run test:auth

# Run all Phase 4 Student Profile & Skills tests (12 tests)
npm run test:profile

# Run all Phase 5 Jobs, Internships & Applications tests (17 tests)
npm run test:jobs
```

### 5. Run Frontend Client
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173/`

### 🔑 Demo Accounts
For rapid testing, the seed script (`npm run seed`) or the Login page quick-fill buttons can be used:
- **Student Account**: `alex.johnson@college.edu` / `Student@123`
- **Admin Account**: `admin@skillbridge.edu` / `Admin@Pass2026!`

---

## 📡 REST API Endpoint Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student (auto-creates profile document) |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT in HTTP-only cookie + body |
| `GET` | `/api/auth/me` | Private | Get currently logged-in user details & profile session |
| `POST` | `/api/auth/logout` | Public/Private | Clear authentication session cookie |

### Student Profiles & Portfolio (`/api/profiles`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profiles/me` | Private | Get current student's portfolio & dynamic completion score |
| `PUT` | `/api/profiles/me` | Private | Update student bio, college, phone, location (blocks email/role changes) |
| `GET` | `/api/profiles/stats` | Private | Aggregated student stats for dashboard (skills, projects, certs, activity) |
| `POST` | `/api/profiles/education` | Private | Add education qualification |
| `PUT` | `/api/profiles/education/:eduId` | Private | Update education record |
| `DELETE` | `/api/profiles/education/:eduId` | Private | Delete education record |
| `POST` | `/api/profiles/projects` | Private | Add portfolio project with URLs & tech stack |
| `PUT` | `/api/profiles/projects/:projId` | Private | Update portfolio project |
| `DELETE` | `/api/profiles/projects/:projId` | Private | Delete portfolio project |
| `POST` | `/api/profiles/certifications` | Private | Add professional certification |
| `PUT` | `/api/profiles/certifications/:certId`| Private | Update certification |
| `DELETE` | `/api/profiles/certifications/:certId`| Private | Delete certification |
| `GET` | `/api/profiles/:id` | Public | View student public profile by ID |

### Skills Inventory (`/api/skills`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/skills` | Private | List student skills (filter by 9 categories & search term) |
| `POST` | `/api/skills` | Private | Add skill with proficiency (prevents case-insensitive duplicates) |
| `PUT` | `/api/skills/:id` | Private | Update skill level, years of experience, or category |
| `DELETE` | `/api/skills/:id` | Private | Remove skill from profile |

### Jobs & Internships (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | List & search jobs (filter: workMode, jobType, query) |
| `GET` | `/api/jobs/:id` | Public | Get single job details |
| `POST` | `/api/jobs` | Admin | Create new job/internship posting |
| `PUT` | `/api/jobs/:id` | Admin | Update job posting |
| `DELETE` | `/api/jobs/:id` | Admin | Delete/close job posting |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Student | Apply for job (prevents duplicate applications) |
| `GET` | `/api/applications/my` | Student | Get all applications submitted by student |
| `GET` | `/api/applications/:id` | Owner/Admin | View single application details |
| `PUT` | `/api/applications/:id/withdraw` | Student | Withdraw application |

### Saved Jobs (`/api/saved-jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/saved-jobs/:jobId` | Student | Bookmark job (prevents duplicates) |
| `GET` | `/api/saved-jobs` | Student | Get student's bookmarked jobs |
| `DELETE`| `/api/saved-jobs/:jobId` | Student | Remove job from bookmarks |

### Courses (`/api/courses`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Public | List active courses (filter by skill/difficulty) |
| `GET` | `/api/courses/:id` | Public | Get single course details |
| `POST` | `/api/courses` | Admin | Create course recommendation |
| `PUT` | `/api/courses/:id` | Admin | Update course details |
| `DELETE`| `/api/courses/:id` | Admin | Delete course |

### Assessments (`/api/assessments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments` | Public | List diagnostic assessments |
| `GET` | `/api/assessments/:id` | Public | Get test questions (*answer keys sanitized*) |
| `POST` | `/api/assessments/:id/submit` | Student | Submit answers, auto-grade & generate result |

### Learning Progress & Personalized Roadmap (`/api/roadmap` & `/api/progress`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/roadmap` | Student | View personalized ordered learning roadmap |
| `POST` | `/api/roadmap` | Student | Generate roadmap for role/job or add custom step |
| `PUT` | `/api/roadmap/:id` | Student | Update step status, percentage, notes |
| `DELETE`| `/api/roadmap/:id` | Student | Delete custom roadmap step |
| `GET` | `/api/progress` | Student | View skill milestone trackers |
| `POST` | `/api/progress` | Student | Track new skill progress |
| `PUT` | `/api/progress/:id` | Student | Update percentage, level, completed courses |

### Smart Job Matching (`/api/matching`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/matching/jobs` | Student | Get jobs matched against skills, filtered by tier, sorted |
| `GET` | `/api/matching/jobs/:jobId` | Student | Get match details for a specific opportunity |
| `GET` | `/api/matching/summary` | Student | Overall employability & match tier distribution |

### Skill Gap Analysis (`/api/skill-gap`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/skill-gap/jobs/:jobId` | Student | Skill gap diagnostic against a target job |
| `GET` | `/api/skill-gap/role/:roleName` | Student | Skill gap benchmark against standard career role |

### Course Recommendations (`/api/recommendations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recommendations/courses` | Student | Recommended active courses for role gaps |
| `GET` | `/api/recommendations/courses/:jobId` | Student | Recommended active courses for specific job gaps |

### Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Aggregate placement metrics & status breakdown |
| `GET` | `/api/admin/users` | Admin | List all registered students & admins |
| `GET` | `/api/admin/applications` | Admin | Review candidate submissions queue |
| `PUT` | `/api/admin/applications/:id/status`| Admin | Shortlist, Reject, or Under Review |

---

## 🧠 Explainable Matching & Recommendation Formula (For College Demonstrations)

The matching and recommendation engine is 100% deterministic, explainable, and requires zero third-party or paid AI APIs:

### 1. Job-Skill Matching Formula
$$\text{Match Percentage} = \left(\frac{\text{Number of Matched Required Skills}}{\text{Total Number of Required Skills}}\right) \times 100$$

- **Normalization**: Trims leading/trailing whitespace, converts to lowercase, and resolves canonical aliases (e.g. `JS` $\rightarrow$ `JavaScript`, `Node` $\rightarrow$ `Node.js`, `Mongo` $\rightarrow$ `MongoDB`, `K8s` $\rightarrow$ `Kubernetes`).
- **Technology Isolation**: Guarantees distinct technologies are never conflated (e.g. `Java` $\neq$ `JavaScript`, `C` $\neq$ `C++`).
- **Match Tiers**:
  - **Excellent**: $80\% - 100\%$
  - **Good**: $60\% - 79\%$
  - **Moderate**: $40\% - 59\%$
  - **Low**: $< 40\%$
- **Empty Requirements**: Jobs with 0 strict prerequisites return $100\%$ match gracefully.

### 2. Dependency-Ordered Roadmap Generation
Skills are ranked by foundational depth:
1. **Rank 1 (Core Languages/Basics)**: HTML5, CSS3, JavaScript, Python, Java, SQL
2. **Rank 2 (Runtimes & VCS)**: Git, Node.js, Linux, TypeScript
3. **Rank 3 (Frameworks & Databases)**: React.js, Express.js, MongoDB, PostgreSQL, REST APIs
4. **Rank 4 (Architecture & Containers)**: Redux, Next.js, Docker, GraphQL
5. **Rank 5 (Cloud & Infrastructure)**: AWS, Kubernetes, CI/CD

Roadmap generation orders missing skills so foundational skills precede dependent technologies.

---

## 🔒 Security & Data Integrity Features

1. **Password Hashing**: Automatic `bcryptjs` salt + hash in Mongoose `pre('save')`. Passwords are never stored in plain text and are excluded (`select: false` / `toJSON` transform) from API outputs.
2. **Role-Based Access Control (RBAC)**: `authorize('admin')` guarantees student accounts cannot invoke administrative routes.
3. **Cross-Student Isolation**: All roadmap mutations verify ownership (`step.studentId === req.user._id`). Students cannot view or modify another student's learning progress.
4. **Assessment Answer Protection**: Assessment question endpoints sanitize outputs so `correctAnswer` and `explanation` are never exposed to public or student clients prior to test completion.
5. **Duplicate Prevention**: Mongoose compound unique indexes enforce:
   - 1 Application per student per job (`{ studentId: 1, jobId: 1 }`).
   - 1 Saved bookmark per student per job (`{ studentId: 1, jobId: 1 }`).
   - 1 Learning progress record per student per skill (`{ studentId: 1, skill: 1 }`).
6. **Centralized Error Handling**: Captures Mongoose CastError, duplicate key (11000), offline DB timeouts, and validation errors without leaking server stack traces in production.

---

## 🧪 Comprehensive Automated Test Verification

All phases are verified through 5 standalone suites (**69/69 automated tests passing**):

```powershell
npm test                     # Phase 2: Core Express & Mongoose validation (13/13 PASS)
npm --prefix server run test:auth     # Phase 3: Auth & RBAC security (12/12 PASS)
npm --prefix server run test:profile  # Phase 4: Student profile & skills (12/12 PASS)
npm --prefix server run test:jobs     # Phase 5: Jobs & applications (17/17 PASS)
npm --prefix server run test:matching # Phase 6: Matching & recommendation (15/15 PASS)
```


