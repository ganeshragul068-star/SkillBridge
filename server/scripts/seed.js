const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Course = require('../models/Course');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const LearningProgress = require('../models/LearningProgress');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const ActivityLog = require('../models/ActivityLog');
const Mentor = require('../models/Mentor');
const MentorshipRequest = require('../models/MentorshipRequest');

const { isDemoMode } = require('../config/dataMode');

const seedDatabase = async () => {
  try {
    if (!isDemoMode()) {
      const conn = await connectDB();
      if (!conn) {
        console.error('❌ Could not establish database connection. Please check MONGO_URI in .env');
        process.exit(1);
      }
    } else {
      console.log('💡 [SkillBridge Seed]: Running in DEMO MODE. Seeding JSON demo repository...');
    }

    console.log('🔄 Cleaning existing collections for fresh seed...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await SavedJob.deleteMany({});
    await Course.deleteMany({});
    await Assessment.deleteMany({});
    await AssessmentResult.deleteMany({});
    await LearningProgress.deleteMany({});
    await Resume.deleteMany({});
    await ResumeAnalysis.deleteMany({});
    await ActivityLog.deleteMany({});
    await Mentor.deleteMany({});
    await MentorshipRequest.deleteMany({});

    console.log('👤 Creating initial Admin and Student accounts...');
    
    // Controlled Admin account from environment variables
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@Pass2026!';
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'SkillBridge Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@skillbridge.edu',
      password: adminPassword,
      role: 'admin'
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@college.edu',
      password: 'Student@123',
      role: 'student'
    });

    // Create Alex's rich student profile
    await Profile.create({
      userId: studentUser._id,
      phone: '+91 98765 43210',
      college: 'National Institute of Technology',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech in Computer Science',
      graduationYear: 2026,
      location: 'Bangalore, India',
      bio: 'Enthusiastic full-stack web developer passionate about building scalable JavaScript and MERN systems.',
      skills: [
        { name: 'JavaScript (ES6+)', category: 'Programming Language', proficiency: 'Advanced' },
        { name: 'React.js', category: 'Frontend', proficiency: 'Advanced' },
        { name: 'Node.js', category: 'Backend', proficiency: 'Intermediate' },
        { name: 'Express.js', category: 'Backend', proficiency: 'Intermediate' },
        { name: 'HTML5 & CSS3', category: 'Frontend', proficiency: 'Advanced' },
        { name: 'Git & GitHub', category: 'DevOps', proficiency: 'Intermediate' },
        { name: 'MongoDB', category: 'Database', proficiency: 'Intermediate' }
      ],
      education: [
        {
          institution: 'National Institute of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          grade: '8.7 / 10 CGPA'
        }
      ],
      projects: [
        {
          title: 'CampHub - College Event Management Platform',
          description: 'Web portal enabling student clubs to organize hackathons and ticketing with QR verification.',
          techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
          liveUrl: 'https://camphub.example.com',
          githubUrl: 'https://github.com/alexjohnson/camphub'
        }
      ]
    });

    // Student 2: Priya Patel (AI & Data Science)
    const priyaUser = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@college.edu',
      password: 'Student@123',
      role: 'student'
    });
    await Profile.create({
      userId: priyaUser._id,
      phone: '+91 91234 56780',
      college: 'PSG College of Technology',
      department: 'Information Technology',
      degree: 'B.Tech in Information Technology',
      graduationYear: 2026,
      location: 'Coimbatore, India',
      bio: 'Aspiring machine learning researcher and data analyst skilled in Python, pandas, and predictive modeling.',
      skills: [
        { name: 'Python', category: 'Programming Language', proficiency: 'Advanced' },
        { name: 'SQL', category: 'Database', proficiency: 'Advanced' },
        { name: 'Pandas & NumPy', category: 'AI and Machine Learning', proficiency: 'Intermediate' },
        { name: 'TensorFlow', category: 'AI and Machine Learning', proficiency: 'Intermediate' },
        { name: 'Data Visualization', category: 'Tools and Technologies', proficiency: 'Intermediate' }
      ],
      education: [
        {
          institution: 'PSG College of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Information Technology',
          startYear: 2022,
          endYear: 2026,
          grade: '8.9 / 10 CGPA'
        }
      ],
      projects: [
        {
          title: 'Predictive Medical Diagnostic Engine',
          description: 'Analyzed clinical records using scikit-learn random forests achieving 92% classification accuracy.',
          techStack: ['Python', 'scikit-learn', 'Streamlit', 'Pandas']
        }
      ]
    });

    // Student 3: Rohan Sharma (Cloud & DevOps)
    const rohanUser = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@college.edu',
      password: 'Student@123',
      role: 'student'
    });
    await Profile.create({
      userId: rohanUser._id,
      phone: '+91 94567 12345',
      college: 'Vellore Institute of Technology',
      department: 'Computer Science',
      degree: 'B.Tech in Computer Science',
      graduationYear: 2025,
      location: 'Chennai, India',
      bio: 'Cloud architecture enthusiast focusing on Docker containerization, Kubernetes clusters, and automated CI/CD.',
      skills: [
        { name: 'Docker', category: 'DevOps', proficiency: 'Advanced' },
        { name: 'Kubernetes', category: 'DevOps', proficiency: 'Intermediate' },
        { name: 'AWS Cloud', category: 'Cloud Computing', proficiency: 'Intermediate' },
        { name: 'Linux', category: 'Tools and Technologies', proficiency: 'Advanced' },
        { name: 'Bash Scripting', category: 'Programming Language', proficiency: 'Intermediate' }
      ],
      education: [
        {
          institution: 'Vellore Institute of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          startYear: 2021,
          endYear: 2025,
          grade: '8.4 / 10 CGPA'
        }
      ]
    });

    // Student 4: Ananya Sen (Frontend UI/UX)
    const ananyaUser = await User.create({
      name: 'Ananya Sen',
      email: 'ananya.sen@college.edu',
      password: 'Student@123',
      role: 'student'
    });
    await Profile.create({
      userId: ananyaUser._id,
      phone: '+91 97890 23456',
      college: 'BITS Pilani',
      department: 'Computer Science',
      degree: 'B.E. Computer Science',
      graduationYear: 2026,
      location: 'Hyderabad, India',
      bio: 'Frontend specialist crafting pixel-perfect, accessible React and Tailwind CSS user interfaces.',
      skills: [
        { name: 'React.js', category: 'Frontend', proficiency: 'Advanced' },
        { name: 'TypeScript', category: 'Programming Language', proficiency: 'Intermediate' },
        { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Advanced' },
        { name: 'Figma', category: 'Tools and Technologies', proficiency: 'Intermediate' }
      ],
      education: [
        {
          institution: 'BITS Pilani',
          degree: 'B.E.',
          fieldOfStudy: 'Computer Science',
          startYear: 2022,
          endYear: 2026,
          grade: '9.1 / 10 CGPA'
        }
      ]
    });

    // Student 5: Karthik Raja (Java & Backend)
    const karthikUser = await User.create({
      name: 'Karthik Raja',
      email: 'karthik.raja@college.edu',
      password: 'Student@123',
      role: 'student'
    });
    await Profile.create({
      userId: karthikUser._id,
      phone: '+91 98901 34567',
      college: 'Kumaraguru College of Technology',
      department: 'Information Technology',
      degree: 'B.Tech in Information Technology',
      graduationYear: 2026,
      location: 'Coimbatore, India',
      bio: 'Java enterprise developer passionate about Spring Boot, distributed microservices, and database tuning.',
      skills: [
        { name: 'Java', category: 'Programming Language', proficiency: 'Advanced' },
        { name: 'Spring Boot', category: 'Backend', proficiency: 'Intermediate' },
        { name: 'PostgreSQL', category: 'Database', proficiency: 'Intermediate' },
        { name: 'REST APIs', category: 'Backend', proficiency: 'Intermediate' }
      ],
      education: [
        {
          institution: 'Kumaraguru College of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Information Technology',
          startYear: 2022,
          endYear: 2026,
          grade: '8.6 / 10 CGPA'
        }
      ]
    });

    console.log('💼 Seeding 10+ verified Jobs & Internships...');
    const jobsData = [
      {
        title: 'Frontend React Developer Intern',
        company: 'TechNova Labs',
        description: 'Design and build performant, responsive client dashboards and reusable React component libraries for our enterprise SaaS suite.',
        jobType: 'Internship',
        location: 'Bangalore, India',
        workMode: 'Hybrid',
        requiredSkills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
        qualifications: ['B.Tech / BCA in Computer Science', 'Strong JavaScript fundamentals'],
        experience: 'Fresher / Student',
        salary: '₹25,000 / month',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        openings: 3,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Junior MERN Stack Developer',
        company: 'NextGen Solutions',
        description: 'Join our product squad developing end-to-end B2B microservices. Great role for 2025/2026 graduates with hands-on full-stack projects.',
        jobType: 'Full-time',
        location: 'Hyderabad, India',
        workMode: 'On-site',
        requiredSkills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST APIs'],
        qualifications: ['Bachelor degree in Computer Science or IT', 'Completed MERN projects'],
        experience: '0 - 1 Years',
        salary: '₹6.5 - 8.0 LPA',
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        openings: 2,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Backend Node.js & API Intern',
        company: 'Apex Fintech Solutions',
        description: 'Collaborate with senior backend engineers on payment ledger integrations, secure authentication, and webhook reliability.',
        jobType: 'Internship',
        location: 'Remote',
        workMode: 'Remote',
        requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'REST APIs'],
        qualifications: ['3rd or 4th year undergraduate student', 'Familiarity with Postman'],
        experience: 'Student / Fresher',
        salary: '₹30,000 / month',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        openings: 4,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Java Spring Boot Developer Trainee',
        company: 'Cognitive Enterprise Systems',
        description: 'Work on distributed core banking microservices using Spring Boot, Hibernate, and Oracle/PostgreSQL databases.',
        jobType: 'Full-time',
        location: 'Pune, India',
        workMode: 'Hybrid',
        requiredSkills: ['Java', 'Spring Boot', 'Hibernate', 'SQL', 'Data Structures'],
        qualifications: ['B.E. / B.Tech / MCA 2025 or 2026 Batch', 'Good OOP knowledge'],
        experience: 'Fresher',
        salary: '₹5.5 - 7.0 LPA',
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        openings: 5,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Python Data Analyst Intern',
        company: 'InsightWave Analytics',
        description: 'Analyze telemetry and user cohort datasets. Write automated ETL transformation scripts and build PowerBI executive dashboards.',
        jobType: 'Internship',
        location: 'Gurgaon, India',
        workMode: 'Hybrid',
        requiredSkills: ['Python', 'Pandas', 'SQL', 'Data Visualization', 'Excel'],
        qualifications: ['Undergraduate in CS, Statistics, or Math', 'Strong analytical mindset'],
        experience: 'Fresher / Student',
        salary: '₹22,000 / month',
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        openings: 2,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Cloud DevOps & Infrastructure Intern',
        company: 'CloudPeak Networks',
        description: 'Learn modern continuous deployment, Docker containerization, AWS EC2/S3 management, and GitHub Actions automation.',
        jobType: 'Internship',
        location: 'Remote',
        workMode: 'Remote',
        requiredSkills: ['Docker', 'Linux', 'Git', 'AWS Basics', 'Bash'],
        qualifications: ['Hands-on Linux CLI experience', 'Basic understanding of networking'],
        experience: 'Student',
        salary: '₹28,000 / month',
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        openings: 3,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Junior Database Administrator (SQL & NoSQL)',
        company: 'DataCore Corp',
        description: 'Assist in schema migrations, index optimization, automated backup monitoring, and query performance tuning across MySQL and MongoDB.',
        jobType: 'Full-time',
        location: 'Chennai, India',
        workMode: 'On-site',
        requiredSkills: ['SQL', 'MongoDB', 'Database Indexing', 'Database Normalization', 'Linux'],
        qualifications: ['B.Tech Computer Science / Information Tech', 'Strong DB theory'],
        experience: '0 - 1 Years',
        salary: '₹4.8 - 6.2 LPA',
        applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        openings: 2,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Mobile App Developer Intern (Flutter)',
        company: 'AppVerse Studio',
        description: 'Develop slick, cross-platform Android and iOS applications using Flutter and Dart, connecting with Firebase and REST backends.',
        jobType: 'Internship',
        location: 'Remote',
        workMode: 'Remote',
        requiredSkills: ['Flutter', 'Dart', 'Mobile UI', 'REST APIs', 'Firebase'],
        qualifications: ['Built at least one mobile application project', 'Passionate about mobile UX'],
        experience: 'Fresher / Student',
        salary: '₹20,000 / month',
        applicationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        openings: 2,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'QA & Test Automation Trainee',
        company: 'QualityFirst Labs',
        description: 'Write automated API and end-to-end web test suites using Jest, Cypress, and Selenium. Gain real-world CI/CD pipeline experience.',
        jobType: 'Full-time',
        location: 'Noida, India',
        workMode: 'Hybrid',
        requiredSkills: ['JavaScript', 'Jest', 'Automation Testing', 'Selenium', 'Git'],
        qualifications: ['Engineering or Computer Applications graduate', 'Meticulous attention to detail'],
        experience: 'Fresher',
        salary: '₹4.5 - 5.5 LPA',
        applicationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        openings: 4,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'Full Stack Web Developer (Python & Django)',
        company: 'ByteScale Innovations',
        description: 'Build robust web applications leveraging Django REST Framework, PostgreSQL, and modern React frontends.',
        jobType: 'Full-time',
        location: 'Mumbai, India',
        workMode: 'Hybrid',
        requiredSkills: ['Python', 'Django', 'React.js', 'PostgreSQL', 'Docker'],
        qualifications: ['Solid Python coding skills', 'Knowledge of MVC / MTV design patterns'],
        experience: '0 - 1 Years',
        salary: '₹6.0 - 7.5 LPA',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        openings: 2,
        status: 'Active',
        createdBy: adminUser._id
      },
      {
        title: 'UI/UX Design & Frontend Engineering Intern',
        company: 'PixelCraft Digital',
        description: 'Bridge the bridge between high-fidelity Figma component prototypes and clean, modular HTML5/CSS3/React implementations.',
        jobType: 'Internship',
        location: 'Remote',
        workMode: 'Remote',
        requiredSkills: ['Figma', 'React.js', 'CSS3', 'Responsive Design', 'Accessibility'],
        qualifications: ['Design portfolio or GitHub demo links required'],
        experience: 'Student',
        salary: '₹18,000 / month',
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        openings: 2,
        status: 'Active',
        createdBy: adminUser._id
      }
    ];
    await Job.insertMany(jobsData);

    console.log('📝 Seeding realistic Job Applications with varied statuses...');
    const allSeededJobs = await Job.find({});
    const reactJob = allSeededJobs.find(j => j.title.includes('React')) || allSeededJobs[0];
    const mernJob = allSeededJobs.find(j => j.title.includes('MERN')) || allSeededJobs[1];
    const devopsJob = allSeededJobs.find(j => j.title.includes('DevOps') || j.title.includes('Cloud')) || allSeededJobs[2];
    const dataJob = allSeededJobs.find(j => j.title.includes('Python') || j.title.includes('Data')) || allSeededJobs[3];
    const javaJob = allSeededJobs.find(j => j.title.includes('Java')) || allSeededJobs[4];

    await Application.create([
      {
        studentId: studentUser._id,
        jobId: reactJob._id,
        status: 'Shortlisted',
        coverLetter: 'I have hands-on React and full-stack JavaScript experience demonstrated via CampHub.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { status: 'Under Review', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { status: 'Shortlisted', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Strong React portfolio projects.' }
        ]
      },
      {
        studentId: priyaUser._id,
        jobId: dataJob._id,
        status: 'Under Review',
        coverLetter: 'Skilled in Python, SQL and predictive modeling.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { status: 'Under Review', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        studentId: rohanUser._id,
        jobId: devopsJob._id,
        status: 'Selected',
        coverLetter: 'Certified in Docker and experienced in building automated CI/CD pipelines.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { status: 'Under Review', changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { status: 'Shortlisted', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: 'Selected', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Exceptional system architecture and Docker knowledge.' }
        ]
      },
      {
        studentId: ananyaUser._id,
        jobId: mernJob._id,
        status: 'Applied',
        coverLetter: 'Enthusiastic about building accessible, performant React web clients.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        studentId: karthikUser._id,
        jobId: javaJob._id,
        status: 'Rejected',
        coverLetter: 'Passionate about Java Spring Boot microservices.',
        statusHistory: [
          { status: 'Applied', changedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { status: 'Rejected', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remarks: 'Role requires 1+ year enterprise experience.' }
        ]
      }
    ]);

    console.log('📚 Seeding 10+ curated Courses...');
    const coursesData = [
      {
        title: 'MongoDB Aggregation Masterclass',
        provider: 'MongoDB University',
        description: 'Deep dive into $match, $group, $lookup, and indexing optimization pipelines.',
        skillsCovered: ['MongoDB', 'Database Indexing', 'NoSQL', 'Database'],
        difficulty: 'Intermediate',
        duration: '4 Hours',
        courseUrl: 'https://learn.mongodb.com'
      },
      {
        title: 'Docker & Containers for Full-Stack Developers',
        provider: 'SkillBridge Tech Academy',
        description: 'Learn containerizing Node.js and React apps, Dockerfiles, and multi-service docker-compose.',
        skillsCovered: ['Docker', 'DevOps', 'Linux', 'Microservices'],
        difficulty: 'Beginner',
        duration: '6 Hours',
        courseUrl: 'https://skillbridge.edu/courses/docker'
      },
      {
        title: 'Modern JavaScript (ES6+ Deep Dive)',
        provider: 'JavaScript.info & SkillBridge',
        description: 'Master closures, event loop, async/await, promises, and modern ES module features.',
        skillsCovered: ['JavaScript', 'Programming Language', 'Frontend'],
        difficulty: 'Intermediate',
        duration: '8 Hours',
        courseUrl: 'https://javascript.info'
      },
      {
        title: 'React.js State Management & Custom Hooks',
        provider: 'Frontend Masters Curriculum',
        description: 'Build enterprise React architectures with Context API, Redux Toolkit, and performance memoization.',
        skillsCovered: ['React.js', 'Frontend', 'JavaScript'],
        difficulty: 'Advanced',
        duration: '10 Hours',
        courseUrl: 'https://react.dev'
      },
      {
        title: 'REST API Security & JWT Authentication in Node.js',
        provider: 'Node Security Project',
        description: 'Implement role-based access control, cryptographic password hashing, refresh tokens, and rate limiting.',
        skillsCovered: ['Node.js', 'Express.js', 'JWT', 'Backend'],
        difficulty: 'Intermediate',
        duration: '5 Hours',
        courseUrl: 'https://skillbridge.edu/courses/node-security'
      },
      {
        title: 'Java Spring Boot Microservices from Scratch',
        provider: 'Java Code Academy',
        description: 'Learn Spring Data JPA, Eureka Service Discovery, Spring Cloud Gateway, and Spring Security.',
        skillsCovered: ['Java', 'Spring Boot', 'Backend', 'SQL'],
        difficulty: 'Intermediate',
        duration: '12 Hours',
        courseUrl: 'https://spring.io/guides'
      },
      {
        title: 'Python for Data Analysis & Automation',
        provider: 'DataCamp Open Series',
        description: 'Exploratory data analysis using NumPy, Pandas, Matplotlib, and automated reporting scripts.',
        skillsCovered: ['Python', 'Pandas', 'Data Analysis', 'Data Visualization'],
        difficulty: 'Beginner',
        duration: '7 Hours',
        courseUrl: 'https://skillbridge.edu/courses/python-data'
      },
      {
        title: 'Relational Database Design & SQL Optimization',
        provider: 'PostgreSQL Global Guild',
        description: 'Master ACID transactions, schema normalization (1NF to 3NF), views, and query plan execution.',
        skillsCovered: ['SQL', 'Database', 'PostgreSQL'],
        difficulty: 'Intermediate',
        duration: '6 Hours',
        courseUrl: 'https://skillbridge.edu/courses/sql-optimization'
      },
      {
        title: 'Unit & Integration Testing with Jest and RTL',
        provider: 'Testing JavaScript Series',
        description: 'Write maintainable test suites for React components and Express API routes with mock assertions.',
        skillsCovered: ['Jest', 'Unit Testing', 'React.js', 'Node.js'],
        difficulty: 'Intermediate',
        duration: '4 Hours',
        courseUrl: 'https://skillbridge.edu/courses/testing'
      },
      {
        title: 'Git Version Control & GitHub Team Workflows',
        provider: 'GitHub Education',
        description: 'Master branch strategies, rebasing, pull request reviews, and GitHub Actions automated checks.',
        skillsCovered: ['Git', 'GitHub', 'DevOps'],
        difficulty: 'Beginner',
        duration: '3 Hours',
        courseUrl: 'https://git-scm.com/book/en/v2'
      },
      {
        title: 'Redux Toolkit & Modern Global State Architecture',
        provider: 'Redux Core Team & SkillBridge',
        description: 'Master Redux Toolkit (RTK), slices, createAsyncThunk, selectors, and RTK Query to manage complex global frontend state with high performance.',
        skillsCovered: ['Redux', 'React.js', 'State Management', 'Frontend', 'JavaScript'],
        difficulty: 'Intermediate',
        duration: '6 Hours',
        courseUrl: 'https://redux-toolkit.js.org/tutorials/quick-start'
      },
      {
        title: 'Modern Responsive UI with Tailwind CSS',
        provider: 'Tailwind Labs & Frontend Masters',
        description: 'Build fast, highly responsive, production-ready interfaces using Tailwind utility-first classes, flexbox/grid layouts, dark mode, and component abstraction.',
        skillsCovered: ['Tailwind CSS', 'CSS3', 'Frontend', 'Responsive Design', 'HTML5'],
        difficulty: 'Beginner',
        duration: '5 Hours',
        courseUrl: 'https://tailwindcss.com/docs/utility-first'
      },
      {
        title: 'TypeScript Fundamentals for React Developers',
        provider: 'TypeScript Official Guild',
        description: 'Learn static typing for modern JavaScript: interfaces, generics, union types, typing React props & state, and building type-safe component APIs.',
        skillsCovered: ['TypeScript', 'JavaScript', 'Frontend', 'React.js'],
        difficulty: 'Intermediate',
        duration: '7 Hours',
        courseUrl: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html'
      },
      {
        title: 'Enterprise Frontend Stack: React, Redux & TypeScript',
        provider: 'Frontend Masters & SkillBridge',
        description: 'End-to-end frontend engineering: combining React.js with TypeScript, Redux Toolkit, and Tailwind CSS for production enterprise web applications.',
        skillsCovered: ['React.js', 'Redux', 'TypeScript', 'Tailwind CSS', 'Frontend'],
        difficulty: 'Intermediate',
        duration: '12 Hours',
        courseUrl: 'https://react.dev/learn/typescript'
      }
    ];
    await Course.insertMany(coursesData);

    console.log('📝 Seeding 5 comprehensive Skill Assessments...');
    const assessmentsData = [
      {
        title: 'React.js Component Architecture & Hooks Assessment',
        skill: 'React.js',
        description: 'Test your understanding of component lifecycle, state management, useEffect dependencies, and performance optimizations.',
        duration: 20,
        passingScore: 70,
        questions: [
          {
            questionText: 'Which React hook should be used to avoid recalculating an expensive computation on every render?',
            options: ['useEffect', 'useMemo', 'useCallback', 'useRef'],
            correctAnswer: 1,
            explanation: 'useMemo returns a memoized value that only recalculates when one of its specified dependencies changes.',
            marks: 1
          },
          {
            questionText: 'What is the primary difference between controlled and uncontrolled form components in React?',
            options: [
              'Controlled components use Redux while uncontrolled use local state',
              'Controlled components have their value handled by React state, while uncontrolled rely on DOM refs',
              'Uncontrolled components are faster and cannot have default values',
              'Controlled components only work with class components'
            ],
            correctAnswer: 1,
            explanation: 'In a controlled component, form data is handled by React state. In uncontrolled components, form data is handled by the DOM itself using refs.',
            marks: 1
          },
          {
            questionText: 'When does the cleanup function returned inside a useEffect hook execute?',
            options: [
              'Only when the browser window closes',
              'Before the component re-renders or unmounts',
              'Synchronously before the initial render',
              'Only when an uncaught error occurs in the component'
            ],
            correctAnswer: 1,
            explanation: 'The cleanup function runs before the component is removed from the UI (unmounts) and prior to running the effect again on re-render.',
            marks: 1
          }
        ]
      },
      {
        title: 'Node.js & Express RESTful APIs Diagnostic',
        skill: 'Node.js',
        description: 'Evaluate your knowledge of the Node.js event loop, Express routing, middleware execution order, and error handling.',
        duration: 20,
        passingScore: 70,
        questions: [
          {
            questionText: 'In an Express application, what parameter signature distinguishes error-handling middleware from regular middleware?',
            options: [
              '(req, res, next)',
              '(err, req, res, next)',
              '(req, res, error)',
              '(app, req, res)'
            ],
            correctAnswer: 1,
            explanation: 'Express recognizes error-handling middleware by its four arguments: (err, req, res, next).',
            marks: 1
          },
          {
            questionText: 'Which HTTP method should be used when an API endpoint performs a partial update of a resource?',
            options: ['PUT', 'POST', 'PATCH', 'UPDATE'],
            correctAnswer: 2,
            explanation: 'PATCH is standard for partial updates, whereas PUT is traditionally used for replacing the entire entity.',
            marks: 1
          },
          {
            questionText: 'What is the purpose of process.nextTick() in Node.js?',
            options: [
              'It delays execution until the next calendar day',
              'It schedules a callback to be run at the very end of the current phase of the event loop before I/O',
              'It creates a new thread in the worker pool',
              'It pauses execution for 100 milliseconds'
            ],
            correctAnswer: 1,
            explanation: 'process.nextTick() queues a callback function to be invoked immediately after the current operation finishes and before the event loop continues.',
            marks: 1
          }
        ]
      },
      {
        title: 'Python Core & Data Analysis Fundamentals',
        skill: 'Python',
        description: 'Assess list comprehensions, dictionary operations, Pandas DataFrame manipulation, and exception handling.',
        duration: 15,
        passingScore: 70,
        questions: [
          {
            questionText: 'In Pandas, which method is used to remove rows containing null/NaN values from a DataFrame?',
            options: ['df.clean()', 'df.dropna()', 'df.strip_na()', 'df.remove_empty()'],
            correctAnswer: 1,
            explanation: 'df.dropna() drops rows (or columns) that contain missing or NaN values.',
            marks: 1
          },
          {
            questionText: 'What does the *args parameter syntax in a Python function definition permit?',
            options: [
              'Keyword arguments only',
              'An arbitrary number of positional arguments passed as a tuple',
              'Mandatory pointers to memory addresses',
              'Array slicing in the function body'
            ],
            correctAnswer: 1,
            explanation: '*args allows passing a variable number of positional arguments to a function, accessible as a tuple.',
            marks: 1
          }
        ]
      },
      {
        title: 'Java Core & Object-Oriented Principles',
        skill: 'Java',
        description: 'Test OOP fundamentals (Inheritance, Polymorphism, Abstraction, Encapsulation), Collections, and Exception Handling.',
        duration: 20,
        passingScore: 70,
        questions: [
          {
            questionText: 'Which collection implementation in Java maintains elements in sorted order based on their natural comparison or a Comparator?',
            options: ['ArrayList', 'HashSet', 'TreeSet', 'LinkedList'],
            correctAnswer: 2,
            explanation: 'TreeSet is part of the NavigableSet interface in Java and guarantees that elements are maintained in sorted ascending order.',
            marks: 1
          },
          {
            questionText: 'Can an abstract class in Java have concrete methods with complete method bodies?',
            options: [
              'No, abstract classes can only contain method signatures',
              'Yes, an abstract class can contain both abstract and concrete methods',
              'Only if the class is declared static',
              'Only in Java versions prior to Java 7'
            ],
            correctAnswer: 1,
            explanation: 'Abstract classes in Java can have fully implemented concrete methods alongside abstract methods.',
            marks: 1
          }
        ]
      },
      {
        title: 'MongoDB & Database Architecture Assessment',
        skill: 'MongoDB',
        description: 'Assess schema design patterns, aggregation stages, compound indexing, and embedding versus referencing tradeoffs.',
        duration: 20,
        passingScore: 70,
        questions: [
          {
            questionText: 'In a MongoDB aggregation pipeline, which stage performs a left outer join with another collection in the same database?',
            options: ['$join', '$lookup', '$merge', '$project'],
            correctAnswer: 1,
            explanation: '$lookup performs an equality match or subquery join between documents from the input and another collection.',
            marks: 1
          },
          {
            questionText: 'What is the primary benefit of creating a compound index on { department: 1, graduationYear: -1 } in MongoDB?',
            options: [
              'It encrypts documents belonging to both fields',
              'It allows queries filtering by department, or by department AND graduationYear, to use index scans instead of collection scans',
              'It automatically converts strings to numbers',
              'It restricts documents from exceeding 16MB'
            ],
            correctAnswer: 1,
            explanation: 'A compound index supports queries that match on the prefix (department) or both fields in the index key pattern.',
            marks: 1
          }
        ]
      },
      {
        title: 'Modern JavaScript (ES6+ & Async Architecture)',
        skill: 'JavaScript',
        category: 'Programming Languages',
        difficulty: 'Intermediate',
        description: 'Test your understanding of JavaScript closures, prototypical inheritance, event loop phases, and async/await mechanics.',
        duration: 20,
        passingScore: 70,
        questions: [
          {
            questionText: 'What is the output of `typeof NaN` in JavaScript?',
            options: ['undefined', 'number', 'nan', 'object'],
            correctAnswer: 1,
            explanation: 'In JavaScript, NaN represents "Not-a-Number", but its primitive data type according to the ECMAScript spec is number.',
            marks: 1
          },
          {
            questionText: 'Which statement correctly describes how closures function in JavaScript?',
            options: [
              'Closures prevent functions from accessing variables defined outside their body',
              'A closure is the combination of a function bundled together with references to its surrounding lexical environment',
              'Closures are only created when using arrow functions',
              'Closures immediately execute and discard local memory variables'
            ],
            correctAnswer: 1,
            explanation: 'A closure gives a function access to its outer scope from an inner function, preserved across invocations.',
            marks: 1
          },
          {
            questionText: 'Which event loop queue takes priority when synchronous code finishes execution?',
            options: [
              'Task Queue (macrotasks: setTimeout/setInterval)',
              'Microtask Queue (Promises, queueMicrotask)',
              'I/O Polling Phase',
              'Check Phase (setImmediate)'
            ],
            correctAnswer: 1,
            explanation: 'The microtask queue (promise callbacks) is drained completely before the next macrotask is processed.',
            marks: 1
          }
        ]
      },
      {
        title: 'C++ Systems & Memory Management Competency',
        skill: 'C++',
        category: 'Programming Languages',
        difficulty: 'Advanced',
        description: 'Assess pointer arithmetic, dynamic heap allocation, references, virtual destructors, and RAII principles.',
        duration: 25,
        passingScore: 70,
        questions: [
          {
            questionText: 'Why should a base class containing virtual methods declare a virtual destructor in C++?',
            options: [
              'To speed up compilation times',
              'To guarantee that deleting an object through a base class pointer correctly invokes the derived class destructor',
              'To make the class abstract and non-instantiable',
              'To allow private variables to be inherited'
            ],
            correctAnswer: 1,
            explanation: 'Without a virtual destructor, deleting a derived object via a base pointer causes undefined behavior and resource leaks.',
            marks: 1
          },
          {
            questionText: 'Which smart pointer in modern C++ (C++11+) maintains exclusive ownership of a dynamically allocated heap resource?',
            options: ['std::shared_ptr', 'std::unique_ptr', 'std::weak_ptr', 'std::auto_ptr'],
            correctAnswer: 1,
            explanation: 'std::unique_ptr enforces exclusive ownership; it cannot be copied, only moved via std::move.',
            marks: 1
          }
        ]
      },
      {
        title: 'Relational Database Design & SQL Querying Assessment',
        skill: 'SQL',
        category: 'Database',
        difficulty: 'Intermediate',
        description: 'Test complex SQL JOIN operations, GROUP BY aggregations, HAVING clauses, subqueries, and ACID properties.',
        duration: 20,
        passingScore: 70,
        questions: [
          {
            questionText: 'What is the primary difference between WHERE and HAVING clauses in an SQL query?',
            options: [
              'WHERE is used for numeric comparisons, while HAVING is used for string comparisons',
              'WHERE filters individual rows before aggregation; HAVING filters aggregated groups after GROUP BY',
              'HAVING can only be used with SELECT * statements',
              'WHERE requires an inner join to be present'
            ],
            correctAnswer: 1,
            explanation: 'WHERE filters rows prior to grouping; HAVING evaluates aggregate functions like COUNT() or SUM() after grouping.',
            marks: 1
          },
          {
            questionText: 'Which JOIN returns all records from the left table and matched records from the right table, filling with NULL when no match exists?',
            options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
            correctAnswer: 1,
            explanation: 'LEFT JOIN (or LEFT OUTER JOIN) preserves all rows from the left table regardless of whether a matching record exists on the right.',
            marks: 1
          }
        ]
      },
      {
        title: 'HTML5 Semantic Markup & Modern CSS Layouts',
        skill: 'HTML and CSS',
        category: 'Frontend Development',
        difficulty: 'Beginner',
        description: 'Test HTML5 semantic structure, CSS Flexbox, CSS Grid, media queries, accessibility, and the CSS box model.',
        duration: 15,
        passingScore: 70,
        questions: [
          {
            questionText: 'When `box-sizing: border-box` is set on an element, what is included in the total declared width and height?',
            options: [
              'Content area only (padding and border are added externally)',
              'Content, padding, and border (only margin is outside)',
              'Content and margin only',
              'Border and margin only'
            ],
            correctAnswer: 1,
            explanation: 'border-box includes content, padding, and border within the specified element width and height.',
            marks: 1
          },
          {
            questionText: 'In CSS Flexbox, which property aligns items along the cross axis?',
            options: ['justify-content', 'align-items', 'flex-direction', 'flex-wrap'],
            correctAnswer: 1,
            explanation: 'align-items controls item alignment along the cross axis, while justify-content aligns along the main axis.',
            marks: 1
          }
        ]
      },
      {
        title: 'Data Structures & Algorithms Core Diagnostic',
        skill: 'Data Structures and Algorithms',
        category: 'Data Structures',
        difficulty: 'Intermediate',
        description: 'Evaluate Big-O time and space complexity, Linked Lists, Binary Search Trees, Stacks, Queues, and Graphs.',
        duration: 25,
        passingScore: 70,
        questions: [
          {
            questionText: 'What is the average-case time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctAnswer: 1,
            explanation: 'In a balanced BST, each comparison halves the search space, giving an average search time complexity of O(log n).',
            marks: 1
          },
          {
            questionText: 'Which data structure operates on a Last-In, First-Out (LIFO) order?',
            options: ['Queue', 'Stack', 'Linked List', 'Heap'],
            correctAnswer: 1,
            explanation: 'A Stack follows the LIFO principle where the most recently inserted item is the first one removed.',
            marks: 1
          }
        ]
      }
    ];
    await Assessment.insertMany(assessmentsData);

    console.log('🏅 Seeding verified Assessment Result for Alex Johnson...');
    const seededAssessments = await Assessment.find({});
    const reactAssessment = seededAssessments.find((a) => a.skill === 'React.js');
    if (reactAssessment) {
      await AssessmentResult.create({
        studentId: studentUser._id,
        assessmentId: reactAssessment._id,
        score: 3,
        totalMarks: 3,
        percentage: 100,
        passed: true,
        status: 'completed',
        proficiencyLevel: 'Expert',
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        answers: [
          { questionIndex: 0, selectedAnswer: 1, isCorrect: true },
          { questionIndex: 1, selectedAnswer: 1, isCorrect: true },
          { questionIndex: 2, selectedAnswer: 1, isCorrect: true }
        ]
      });
    }

    console.log('📈 Seeding Learning Progress records for Alex Johnson...');
    const allCourses = await Course.find({});
    const jsCourse = allCourses.find((c) => c.title.includes('JavaScript'));
    const reactCourse = allCourses.find((c) => c.title.includes('React'));
    const nodeCourse = allCourses.find((c) => c.title.includes('Node.js'));

    await LearningProgress.create({
      studentId: studentUser._id,
      skill: 'JavaScript',
      currentProficiency: 'Advanced',
      targetProficiency: 'Expert',
      progressPercentage: 85,
      startedCourses: jsCourse ? [jsCourse._id] : [],
      completedCourses: jsCourse ? [jsCourse._id] : [],
      notes: 'Passed JavaScript diagnostic with expert standing.'
    });

    await LearningProgress.create({
      studentId: studentUser._id,
      skill: 'React.js',
      currentProficiency: 'Advanced',
      targetProficiency: 'Expert',
      progressPercentage: 75,
      startedCourses: reactCourse ? [reactCourse._id] : [],
      completedCourses: [],
      notes: 'Currently working through custom hooks and performance optimization.'
    });

    if (nodeCourse) {
      await LearningProgress.create({
        studentId: studentUser._id,
        skill: 'Node.js',
        currentProficiency: 'Intermediate',
        targetProficiency: 'Advanced',
        progressPercentage: 60,
        startedCourses: [nodeCourse._id],
        completedCourses: [],
        notes: 'API architecture and secure JWT middleware practice.'
      });
    }

    console.log('📄 Seeding initial student Resume and Job-Specific Analysis...');
    const seededResume = await Resume.create({
      studentId: studentUser._id,
      title: 'Full Stack MERN Developer Resume',
      targetRole: 'Full Stack Developer',
      template: 'ats',
      isDefault: true,
      personalInfo: {
        fullName: 'Alex Johnson',
        email: 'alex.johnson@college.edu',
        phone: '+91 98765 43210',
        location: 'Bengaluru, India',
        linkedinUrl: 'https://linkedin.com/in/alexjohnson',
        githubUrl: 'https://github.com/alexjohnson',
        portfolioUrl: 'https://alexjohnson.dev',
        summary: 'Driven Final Year B.Tech Computer Science student with comprehensive hands-on proficiency in React.js, Node.js, Express.js, MongoDB, and RESTful microservices architecture.'
      },
      education: [
        {
          institution: 'National Institute of Technology',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science and Engineering',
          startYear: 2022,
          endYear: 2026,
          grade: '8.8 / 10 CGPA',
          location: 'Bengaluru, India'
        }
      ],
      experience: [
        {
          company: 'CodeCraft Innovations',
          role: 'Frontend Development Intern',
          location: 'Bengaluru (Hybrid)',
          startDate: 'May 2025',
          endDate: 'July 2025',
          current: false,
          description: 'Engineered responsive customer onboarding workflows using React and Tailwind CSS.',
          bulletPoints: [
            'Architected 12+ reusable React components with comprehensive accessibility (a11y) standards.',
            'Optimized client-side bundle size by 28% using dynamic code splitting and React.lazy.'
          ]
        }
      ],
      projects: [
        {
          title: 'CampHub — College Event Management Platform',
          description: 'End-to-end event ticketing web app serving 1,500+ active student registrations.',
          technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
          liveUrl: 'https://camphub-demo.vercel.app',
          githubUrl: 'https://github.com/alexjohnson/camphub',
          startDate: 'Jan 2025',
          endDate: 'Apr 2025',
          bulletPoints: [
            'Built JWT-based authentication with role-based access control (Student vs Club Organizer).',
            'Implemented real-time seat availability notifications using WebSockets and Redis pub/sub.',
            'Generated QR check-in tickets that reduced queue wait times during campus symposiums by 45%.'
          ]
        }
      ],
      skills: [
        { name: 'JavaScript (ES6+)', category: 'Programming Languages', proficiency: 'Advanced' },
        { name: 'React.js', category: 'Frontend Development', proficiency: 'Advanced' },
        { name: 'Node.js', category: 'Backend Development', proficiency: 'Intermediate' },
        { name: 'Express.js', category: 'Backend Development', proficiency: 'Intermediate' },
        { name: 'MongoDB', category: 'Database', proficiency: 'Intermediate' },
        { name: 'HTML5 & CSS3', category: 'Frontend Development', proficiency: 'Advanced' },
        { name: 'Git & GitHub', category: 'DevOps & Tools', proficiency: 'Intermediate' }
      ],
      certifications: [
        {
          name: 'Meta Front-End Developer Professional Certificate',
          issuingOrganization: 'Coursera / Meta',
          issueDate: '2025-06-15',
          credentialId: 'META-FED-2025-9981',
          credentialUrl: 'https://coursera.org/verify/META-FED-2025-9981'
        }
      ],
      customSections: []
    });

    const allJobs = await Job.find({});
    const targetJob = allJobs.find(j => j.title.includes('Frontend React') || j.title.includes('MERN'));
    await ResumeAnalysis.create({
      studentId: studentUser._id,
      resumeId: seededResume._id,
      resumeTitle: seededResume.title,
      targetRole: 'Frontend React Developer Intern',
      jobId: targetJob ? targetJob._id : null,
      jobTitle: targetJob ? targetJob.title : 'Frontend React Developer Intern',
      company: targetJob ? targetJob.company : 'TechNova Labs',
      source: 'saved-resume',
      matchPercentage: 100,
      matchingSkills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
      missingSkills: [],
      strengths: [
        'Complete 100% coverage of all required technical competencies for this role.',
        'High-impact quantified project bullets demonstrating hands-on React component design.',
        'Industry-recognized Meta Front-End Developer credential included.'
      ],
      improvements: [
        'Consider tailoring personal summary to specifically emphasize design systems experience.',
        'Add TypeScript and testing libraries (Jest/RTL) as preferred skills to stand out.'
      ],
      relevantProjects: [
        'CampHub — College Event Management Platform (React.js, Node.js, Express.js, MongoDB, Tailwind CSS)'
      ],
      aiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)
    });

    console.log('📋 Seeding initial Platform Activity Logs...');
    await ActivityLog.create({
      action: 'JOB_CREATED',
      targetType: 'job',
      targetId: targetJob ? targetJob._id : null,
      targetTitle: targetJob ? `${targetJob.title} at ${targetJob.company}` : 'Frontend React Developer Intern',
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      performedByRole: 'admin',
      details: { jobType: 'Internship', workMode: 'Remote' }
    });

    await ActivityLog.create({
      action: 'ASSESSMENT_CREATED',
      targetType: 'assessment',
      targetId: reactAssessment ? reactAssessment._id : null,
      targetTitle: reactAssessment ? reactAssessment.title : 'React.js Component Architecture',
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      performedByRole: 'admin',
      details: { skill: 'React.js', duration: 20 }
    });

    await ActivityLog.create({
      action: 'STUDENT_ACTIVATED',
      targetType: 'student',
      targetId: studentUser._id,
      targetTitle: studentUser.name,
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      performedByRole: 'admin',
      details: { studentEmail: studentUser.email, reason: 'Enrolled in 2026 campus placement drive' }
    });

    console.log('🤝 Seeding 6 Domain Mentors across Tech Fields...');
    const mentorsData = [
      {
        name: 'Sarah Chen',
        title: 'Staff Full-Stack Software Engineer',
        profileImage: '',
        email: 'sarah.chen@techbridge-demo.io',
        company: 'Veloce Cloud Systems',
        industry: 'Software & Internet Technologies',
        yearsOfExperience: 8,
        technicalSkills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Redux', 'GraphQL', 'Tailwind CSS', 'REST APIs', 'Git'],
        areasOfExpertise: ['Full Stack Architecture', 'Scalable REST & GraphQL APIs', 'Microfrontends', 'State Management', 'Performance Optimization'],
        careerDomains: ['Full Stack Development', 'Frontend Development', 'Web Development', 'Software Engineering'],
        bio: 'Staff Engineer with 8+ years scaling production React and Node.js microservices. Passionate about mentoring junior and aspiring engineers on clean code and system design.',
        availability: '5 hours/week',
        preferredMode: 'online',
        isActive: true
      },
      {
        name: 'Marcus Vance',
        title: 'Principal DevOps & Cloud Infrastructure Architect',
        profileImage: '',
        email: 'marcus.vance@cloudpeak-demo.net',
        company: 'CloudPeak Networks',
        industry: 'Cloud Infrastructure & DevOps',
        yearsOfExperience: 11,
        technicalSkills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform', 'GitHub Actions', 'Python', 'Bash', 'Prometheus'],
        areasOfExpertise: ['Container Orchestration', 'Multi-Cloud Strategy', 'Zero-Downtime Deployments', 'Infrastructure as Code', 'Site Reliability Engineering'],
        careerDomains: ['Cloud Computing and DevOps', 'DevOps Engineering', 'Cloud Architecture', 'Platform Engineering'],
        bio: 'AWS Certified Solutions Architect & Kubernetes specialist helping startups migrate to robust microservice and automated GitOps pipelines.',
        availability: 'Weekends & Evenings',
        preferredMode: 'hybrid',
        isActive: true
      },
      {
        name: 'Dr. Elena Rostova',
        title: 'Lead Applied AI & Deep Learning Scientist',
        profileImage: '',
        email: 'elena.rostova@neurolabs-demo.ai',
        company: 'NeuroLabs Research',
        industry: 'Artificial Intelligence',
        yearsOfExperience: 7,
        technicalSkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Computer Vision', 'NLP', 'Large Language Models', 'FastAPI', 'Pandas', 'NumPy'],
        areasOfExpertise: ['Deep Learning Models', 'Transformer Architectures', 'MLOps Pipelines', 'Model Fine-Tuning', 'Research to Production'],
        careerDomains: ['Artificial Intelligence and Machine Learning', 'AI Research', 'Machine Learning Engineering', 'Data Science'],
        bio: 'AI researcher turned applied ML Lead. Focused on helping students bridge academic neural network concepts to real-world inference and production deployments.',
        availability: '3 hours/week',
        preferredMode: 'online',
        isActive: true
      },
      {
        name: "David K. O'Connor",
        title: 'Director of Application Security & Penetration Testing',
        profileImage: '',
        email: 'david.oconnor@securenet-demo.org',
        company: 'CyberGuard Defense',
        industry: 'Information Security & Cybersecurity',
        yearsOfExperience: 12,
        technicalSkills: ['Network Security', 'Application Security', 'Penetration Testing', 'Ethical Hacking', 'OWASP Top 10', 'Cryptography', 'Linux', 'Python', 'Wireshark', 'SOC Analysis'],
        areasOfExpertise: ['Vulnerability Assessment', 'DevSecOps Integration', 'Security Architecture', 'Incident Response', 'Threat Modeling'],
        careerDomains: ['Cybersecurity', 'Information Security', 'Application Security', 'Security Operations'],
        bio: 'Certified Ethical Hacker (CEH) and CISSP with over a decade of defense experience guiding students into defensive security, AppSec, and red-team roles.',
        availability: 'Flexible weekday slots',
        preferredMode: 'online',
        isActive: true
      },
      {
        name: 'Priya Nair',
        title: 'Senior Data Scientist & Analytics Lead',
        profileImage: '',
        email: 'priya.nair@insightflow-demo.io',
        company: 'InsightFlow Analytics',
        industry: 'Data Science & Analytics',
        yearsOfExperience: 6,
        technicalSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'PowerBI', 'Statistical Modeling', 'A/B Testing', 'Data Visualization', 'PostgreSQL'],
        areasOfExpertise: ['Predictive Analytics', 'Exploratory Data Analysis', 'Customer Segmentation', 'Dashboard Engineering', 'Statistical Hypothesis Testing'],
        careerDomains: ['Data Science', 'Data Analytics', 'Business Intelligence', 'Quantitative Analytics'],
        bio: 'Data scientist translating messy enterprise data into actionable executive insights. Mentoring candidates on storytelling with data and technical interview prep.',
        availability: '4 hours/week',
        preferredMode: 'online',
        isActive: true
      },
      {
        name: 'Vikram Malhotra',
        title: 'Autonomous Systems & Robotics Software Specialist',
        profileImage: '',
        email: 'vikram.malhotra@robocore-demo.com',
        company: 'AeroBotix Dynamics',
        industry: 'Robotics & Hardware Engineering',
        yearsOfExperience: 9,
        technicalSkills: ['C++', 'Python', 'ROS / ROS2', 'Linux', 'Gazebo Simulation', 'Computer Vision', 'OpenCV', 'SLAM', 'Path Planning', 'Embedded C'],
        areasOfExpertise: ['Robot Operating System (ROS2)', 'Sensor Fusion & LiDAR', 'Kinematics & Dynamics', 'Embedded Linux', 'Autonomous Navigation'],
        careerDomains: ['Robotics and ROS', 'Autonomous Systems', 'Embedded Robotics', 'Mechatronics'],
        bio: 'Robotics engineer building autonomous mobile robots (AMRs). Passionate about demystifying ROS2 nodes, TF2 transforms, and SLAM navigation for students.',
        availability: 'Weekends only',
        preferredMode: 'hybrid',
        isActive: true
      }
    ];

    for (const m of mentorsData) {
      const existing = await Mentor.findOne({ email: m.email });
      if (!existing) {
        await Mentor.create(m);
      }
    }

    console.log('=======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log(` 🔑 Admin Account   : ${adminUser.email}`);
    console.log(`    Admin Password  : ${adminPassword}`);
    console.log(` 🎓 Student Account : ${studentUser.email}`);
    console.log(`    Student Password: Student@123`);
    console.log(` 💼 Jobs Seeded     : ${jobsData.length}`);
    console.log(` 📚 Courses Seeded  : ${coursesData.length}`);
    console.log(` 📝 Tests Seeded    : ${assessmentsData.length}`);
    console.log(` 🤝 Mentors Seeded  : ${mentorsData.length}`);
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
