const bcrypt = require('bcryptjs');

// Standardized 24-character hex ObjectIds for reproducible relationships
const IDS = {
  adminUser: '65e010000000000000000001',
  studentUser: '65e010000000000000000002',
  studentProfile: '65e020000000000000000001',
  jobReactIntern: '65e030000000000000000001',
  jobMernDev: '65e030000000000000000002',
  jobNodeIntern: '65e030000000000000000003',
  jobJavaTrainee: '65e030000000000000000004',
  jobPythonAnalyst: '65e030000000000000000005',
  jobDevOpsIntern: '65e030000000000000000006',
  jobDatabaseAdmin: '65e030000000000000000007',
  jobMobileFlutter: '65e030000000000000000008',
  jobQaTrainee: '65e030000000000000000009',
  jobFullStackDjango: '65e030000000000000000010',
  jobUiUxIntern: '65e030000000000000000011',
  courseMongo: '65e040000000000000000001',
  courseDocker: '65e040000000000000000002',
  courseJs: '65e040000000000000000003',
  courseReact: '65e040000000000000000004',
  courseNodeSec: '65e040000000000000000005',
  courseJavaSpring: '65e040000000000000000006',
  coursePythonData: '65e040000000000000000007',
  courseSqlOpt: '65e040000000000000000008',
  courseJest: '65e040000000000000000009',
  courseGit: '65e040000000000000000010',
  courseRedux: '65e040000000000000000011',
  courseTailwind: '65e040000000000000000012',
  courseTs: '65e040000000000000000013',
  courseFrontendArch: '65e040000000000000000014',
  assessmentReact: '65e050000000000000000001',
  assessmentNode: '65e050000000000000000002',
  assessmentPython: '65e050000000000000000003',
  assessmentJava: '65e050000000000000000004',
  assessmentMongo: '65e050000000000000000005',
  assessmentJs: '65e050000000000000000006',
  assessmentCpp: '65e050000000000000000007',
  assessmentSql: '65e050000000000000000008',
  assessmentHtmlCss: '65e050000000000000000009',
  assessmentDsa: '65e050000000000000000010',
  resultJsInitial: '65e060000000000000000001',
  progressJs: '65e070000000000000000001',
  progressReact: '65e070000000000000000002',
  progressNode: '65e070000000000000000003',
  applicationSample: '65e080000000000000000001',
  savedJobSample: '65e090000000000000000001',
  mentorFullStack: '65e0a0000000000000000001',
  mentorDevOps: '65e0a0000000000000000002',
  mentorAI: '65e0a0000000000000000003',
  mentorCyber: '65e0a0000000000000000004',
  mentorData: '65e0a0000000000000000005',
  mentorRobotics: '65e0a0000000000000000006'
};

const getInitialDemoData = () => {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminHashed = bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD || 'Admin@Pass2026!', adminSalt);

  const studentSalt = bcrypt.genSaltSync(10);
  const studentHashed = bcrypt.hashSync('Password123!', studentSalt);

  const now = new Date();
  const future30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const future25 = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString();
  const future20 = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
  const future40 = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString();
  const future15 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  const future35 = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString();
  const future28 = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();
  const future18 = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString();
  const future22 = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString();
  const future14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const users = [
    {
      _id: IDS.adminUser,
      name: process.env.ADMIN_NAME || 'SkillBridge Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@skillbridge.edu').toLowerCase().trim(),
      password: adminHashed,
      role: 'admin',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.studentUser,
      name: 'Alex Johnson',
      email: 'alex.johnson@college.edu',
      password: studentHashed,
      role: 'student',
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const profiles = [
    {
      _id: IDS.studentProfile,
      userId: IDS.studentUser,
      phone: '+91 98765 43210',
      college: 'National Institute of Technology',
      department: 'Computer Science & Engineering',
      degree: 'B.Tech in Computer Science',
      graduationYear: 2026,
      location: 'Bangalore, India',
      bio: 'Enthusiastic full-stack web developer passionate about building scalable JavaScript and MERN systems.',
      profileImage: '',
      skills: [
        { _id: '65e021000000000000000001', name: 'JavaScript (ES6+)', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
        { _id: '65e021000000000000000002', name: 'React.js', category: 'Frontend Development', proficiency: 'Advanced', yearsOfExperience: 2 },
        { _id: '65e021000000000000000003', name: 'Node.js', category: 'Backend Development', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { _id: '65e021000000000000000004', name: 'Express.js', category: 'Backend Development', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { _id: '65e021000000000000000005', name: 'HTML5 & CSS3', category: 'Frontend Development', proficiency: 'Advanced', yearsOfExperience: 3 },
        { _id: '65e021000000000000000006', name: 'Git & GitHub', category: 'DevOps', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { _id: '65e021000000000000000007', name: 'MongoDB', category: 'Database', proficiency: 'Intermediate', yearsOfExperience: 1 }
      ],
      education: [
        {
          _id: '65e022000000000000000001',
          institution: 'National Institute of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science',
          department: 'Computer Science & Engineering',
          startYear: 2022,
          endYear: 2026,
          grade: '8.7 / 10 CGPA'
        }
      ],
      projects: [
        {
          _id: '65e023000000000000000001',
          title: 'CampHub - College Event Management Platform',
          description: 'Web portal enabling student clubs to organize hackathons and ticketing with QR verification.',
          techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
          liveUrl: 'https://camphub.example.com',
          githubUrl: 'https://github.com/alexjohnson/camphub'
        }
      ],
      certifications: [
        {
          _id: '65e024000000000000000001',
          name: 'Meta Front-End Developer Professional Certificate',
          issuingOrganization: 'Coursera / Meta',
          issueDate: new Date('2025-06-15').toISOString(),
          credentialId: 'META-FED-2025-9981',
          credentialUrl: 'https://coursera.org/verify/META-FED-2025-9981'
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const jobs = [
    {
      _id: IDS.jobReactIntern,
      title: 'Frontend React Developer Intern',
      company: 'TechNova Labs',
      description: 'Design and build performant, responsive client dashboards and reusable React component libraries for our enterprise SaaS suite.',
      jobType: 'Internship',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      requiredSkills: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
      preferredSkills: ['TypeScript', 'Tailwind CSS'],
      qualifications: ['B.Tech / BCA in Computer Science', 'Strong JavaScript fundamentals'],
      experience: 'Fresher / Student',
      salary: '₹25,000 / month',
      applicationDeadline: future30,
      openings: 3,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobMernDev,
      title: 'Junior MERN Stack Developer',
      company: 'NextGen Solutions',
      description: 'Join our product squad developing end-to-end B2B microservices. Great role for 2025/2026 graduates with hands-on full-stack projects.',
      jobType: 'Full-time',
      location: 'Hyderabad, India',
      workMode: 'On-site',
      requiredSkills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST APIs'],
      preferredSkills: ['Docker', 'AWS', 'Jest'],
      qualifications: ['Bachelor degree in Computer Science or IT', 'Completed MERN projects'],
      experience: '0 - 1 Years',
      salary: '₹6.5 - 8.0 LPA',
      applicationDeadline: future25,
      openings: 2,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobNodeIntern,
      title: 'Backend Node.js & API Intern',
      company: 'Apex Fintech Solutions',
      description: 'Collaborate with senior backend engineers on payment ledger integrations, secure authentication, and webhook reliability.',
      jobType: 'Internship',
      location: 'Remote',
      workMode: 'Remote',
      requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'REST APIs'],
      preferredSkills: ['Redis', 'Postman'],
      qualifications: ['3rd or 4th year undergraduate student', 'Familiarity with Postman'],
      experience: 'Student / Fresher',
      salary: '₹30,000 / month',
      applicationDeadline: future20,
      openings: 4,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobJavaTrainee,
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
      applicationDeadline: future40,
      openings: 5,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobPythonAnalyst,
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
      applicationDeadline: future15,
      openings: 2,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobDevOpsIntern,
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
      applicationDeadline: future35,
      openings: 3,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobDatabaseAdmin,
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
      applicationDeadline: future28,
      openings: 2,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobMobileFlutter,
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
      applicationDeadline: future18,
      openings: 2,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobQaTrainee,
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
      applicationDeadline: future22,
      openings: 4,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobFullStackDjango,
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
      applicationDeadline: future30,
      openings: 2,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.jobUiUxIntern,
      title: 'UI/UX Design & Frontend Engineering Intern',
      company: 'PixelCraft Digital',
      description: 'Bridge the gap between high-fidelity Figma component prototypes and clean, modular HTML5/CSS3/React implementations.',
      jobType: 'Internship',
      location: 'Remote',
      workMode: 'Remote',
      requiredSkills: ['Figma', 'React.js', 'CSS3', 'Responsive Design', 'Accessibility'],
      qualifications: ['Design portfolio or GitHub demo links required'],
      experience: 'Student',
      salary: '₹18,000 / month',
      applicationDeadline: future14,
      openings: 2,
      status: 'Active',
      createdBy: IDS.adminUser,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const courses = [
    {
      _id: IDS.courseMongo,
      title: 'MongoDB Aggregation Masterclass',
      provider: 'MongoDB University',
      description: 'Deep dive into $match, $group, $lookup, and indexing optimization pipelines.',
      skillsCovered: ['MongoDB', 'Database Indexing', 'NoSQL', 'Database'],
      difficulty: 'Intermediate',
      duration: '4 Hours',
      courseUrl: 'https://learn.mongodb.com',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseDocker,
      title: 'Docker & Containers for Full-Stack Developers',
      provider: 'SkillBridge Tech Academy',
      description: 'Learn containerizing Node.js and React apps, Dockerfiles, and multi-service docker-compose.',
      skillsCovered: ['Docker', 'DevOps', 'Linux', 'Microservices'],
      difficulty: 'Beginner',
      duration: '6 Hours',
      courseUrl: 'https://skillbridge.edu/courses/docker',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseJs,
      title: 'Modern JavaScript (ES6+ Deep Dive)',
      provider: 'JavaScript.info & SkillBridge',
      description: 'Master closures, event loop, async/await, promises, and modern ES module features.',
      skillsCovered: ['JavaScript', 'Programming Language', 'Frontend'],
      difficulty: 'Intermediate',
      duration: '8 Hours',
      courseUrl: 'https://javascript.info',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseReact,
      title: 'React.js State Management & Custom Hooks',
      provider: 'Frontend Masters Curriculum',
      description: 'Build enterprise React architectures with Context API, Redux Toolkit, and performance memoization.',
      skillsCovered: ['React.js', 'Frontend', 'JavaScript'],
      difficulty: 'Advanced',
      duration: '10 Hours',
      courseUrl: 'https://react.dev',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseNodeSec,
      title: 'REST API Security & JWT Authentication in Node.js',
      provider: 'Node Security Project',
      description: 'Implement role-based access control, cryptographic password hashing, refresh tokens, and rate limiting.',
      skillsCovered: ['Node.js', 'Express.js', 'JWT', 'Backend'],
      difficulty: 'Intermediate',
      duration: '5 Hours',
      courseUrl: 'https://skillbridge.edu/courses/node-security',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseJavaSpring,
      title: 'Java Spring Boot Microservices from Scratch',
      provider: 'Java Code Academy',
      description: 'Learn Spring Data JPA, Eureka Service Discovery, Spring Cloud Gateway, and Spring Security.',
      skillsCovered: ['Java', 'Spring Boot', 'Backend', 'SQL'],
      difficulty: 'Intermediate',
      duration: '12 Hours',
      courseUrl: 'https://spring.io/guides',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.coursePythonData,
      title: 'Python for Data Analysis & Automation',
      provider: 'DataCamp Open Series',
      description: 'Exploratory data analysis using NumPy, Pandas, Matplotlib, and automated reporting scripts.',
      skillsCovered: ['Python', 'Pandas', 'Data Analysis', 'Data Visualization'],
      difficulty: 'Beginner',
      duration: '7 Hours',
      courseUrl: 'https://skillbridge.edu/courses/python-data',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseSqlOpt,
      title: 'Relational Database Design & SQL Optimization',
      provider: 'PostgreSQL Global Guild',
      description: 'Master ACID transactions, schema normalization (1NF to 3NF), views, and query plan execution.',
      skillsCovered: ['SQL', 'Database', 'PostgreSQL'],
      difficulty: 'Intermediate',
      duration: '6 Hours',
      courseUrl: 'https://skillbridge.edu/courses/sql-optimization',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseJest,
      title: 'Unit & Integration Testing with Jest and RTL',
      provider: 'Testing JavaScript Series',
      description: 'Write maintainable test suites for React components and Express API routes with mock assertions.',
      skillsCovered: ['Jest', 'Unit Testing', 'React.js', 'Node.js'],
      difficulty: 'Intermediate',
      duration: '4 Hours',
      courseUrl: 'https://skillbridge.edu/courses/testing',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseGit,
      title: 'Git Version Control & GitHub Team Workflows',
      provider: 'GitHub Education',
      description: 'Master branch strategies, rebasing, pull request reviews, and GitHub Actions automated checks.',
      skillsCovered: ['Git', 'GitHub', 'DevOps'],
      difficulty: 'Beginner',
      duration: '3 Hours',
      courseUrl: 'https://git-scm.com/book/en/v2',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseRedux,
      title: 'Redux Toolkit & Modern Global State Architecture',
      provider: 'Redux Core Team & SkillBridge',
      description: 'Master Redux Toolkit (RTK), slices, createAsyncThunk, selectors, and RTK Query to manage complex global frontend state with high performance.',
      skillsCovered: ['Redux', 'React.js', 'State Management', 'Frontend', 'JavaScript'],
      difficulty: 'Intermediate',
      duration: '6 Hours',
      courseUrl: 'https://redux-toolkit.js.org/tutorials/quick-start',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseTailwind,
      title: 'Modern Responsive UI with Tailwind CSS',
      provider: 'Tailwind Labs & Frontend Masters',
      description: 'Build fast, highly responsive, production-ready interfaces using Tailwind utility-first classes, flexbox/grid layouts, dark mode, and component abstraction.',
      skillsCovered: ['Tailwind CSS', 'CSS3', 'Frontend', 'Responsive Design', 'HTML5'],
      difficulty: 'Beginner',
      duration: '5 Hours',
      courseUrl: 'https://tailwindcss.com/docs/utility-first',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseTs,
      title: 'TypeScript Fundamentals for React Developers',
      provider: 'TypeScript Official Guild',
      description: 'Learn static typing for modern JavaScript: interfaces, generics, union types, typing React props & state, and building type-safe component APIs.',
      skillsCovered: ['TypeScript', 'JavaScript', 'Frontend', 'React.js'],
      difficulty: 'Intermediate',
      duration: '7 Hours',
      courseUrl: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.courseFrontendArch,
      title: 'Enterprise Frontend Stack: React, Redux & TypeScript',
      provider: 'Frontend Masters & SkillBridge',
      description: 'End-to-end frontend engineering: combining React.js with TypeScript, Redux Toolkit, and Tailwind CSS for production enterprise web applications.',
      skillsCovered: ['React.js', 'Redux', 'TypeScript', 'Tailwind CSS', 'Frontend'],
      difficulty: 'Intermediate',
      duration: '12 Hours',
      courseUrl: 'https://react.dev/learn/typescript',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const assessments = [
    {
      _id: IDS.assessmentReact,
      title: 'React.js Component Architecture & Hooks Assessment',
      skill: 'React.js',
      category: 'Frontend Development',
      difficulty: 'Intermediate',
      description: 'Test your understanding of component lifecycle, state management, useEffect dependencies, and performance optimizations.',
      duration: 20,
      passingScore: 70,
      isActive: true,
      questions: [
        {
          _id: '65e051000000000000000001',
          questionText: 'Which React hook should be used to avoid recalculating an expensive computation on every render?',
          options: ['useEffect', 'useMemo', 'useCallback', 'useRef'],
          correctAnswer: 1,
          explanation: 'useMemo returns a memoized value that only recalculates when one of its specified dependencies changes.',
          marks: 1
        },
        {
          _id: '65e051000000000000000002',
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
          _id: '65e051000000000000000003',
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
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentNode,
      title: 'Node.js & Express RESTful APIs Diagnostic',
      skill: 'Node.js',
      category: 'Backend Development',
      difficulty: 'Intermediate',
      description: 'Evaluate your knowledge of the Node.js event loop, Express routing, middleware execution order, and error handling.',
      duration: 20,
      passingScore: 70,
      isActive: true,
      questions: [
        {
          _id: '65e052000000000000000001',
          questionText: 'In an Express application, what parameter signature distinguishes error-handling middleware from regular middleware?',
          options: ['(req, res, next)', '(err, req, res, next)', '(req, res, error)', '(app, req, res)'],
          correctAnswer: 1,
          explanation: 'Express recognizes error-handling middleware by its four arguments: (err, req, res, next).',
          marks: 1
        },
        {
          _id: '65e052000000000000000002',
          questionText: 'Which HTTP method should be used when an API endpoint performs a partial update of a resource?',
          options: ['PUT', 'POST', 'PATCH', 'UPDATE'],
          correctAnswer: 2,
          explanation: 'PATCH is standard for partial updates, whereas PUT is traditionally used for replacing the entire entity.',
          marks: 1
        },
        {
          _id: '65e052000000000000000003',
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
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentPython,
      title: 'Python Core & Data Analysis Fundamentals',
      skill: 'Python',
      category: 'Programming Languages',
      difficulty: 'Beginner',
      description: 'Assess list comprehensions, dictionary operations, Pandas DataFrame manipulation, and exception handling.',
      duration: 15,
      passingScore: 60,
      isActive: true,
      questions: [
        {
          _id: '65e053000000000000000001',
          questionText: 'Which of the following is an immutable data type in Python?',
          options: ['List', 'Dictionary', 'Tuple', 'Set'],
          correctAnswer: 2,
          explanation: 'Tuples are immutable sequences in Python; once created, their elements cannot be modified or reassigned.',
          marks: 1
        },
        {
          _id: '65e053000000000000000002',
          questionText: 'In Pandas, which method allows filtering rows based on condition and selecting specific columns simultaneously?',
          options: ['.loc[]', '.iloc[]', '.filter()', '.select()'],
          correctAnswer: 0,
          explanation: '.loc[] accesses a group of rows and columns by label(s) or a boolean array.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentJava,
      title: 'Java Object-Oriented Programming & Collections',
      skill: 'Java',
      category: 'Programming Languages',
      difficulty: 'Intermediate',
      description: 'Test core OOP principles: inheritance, polymorphism, abstract classes, interfaces, and Java Collections Framework.',
      duration: 20,
      passingScore: 70,
      isActive: true,
      questions: [
        {
          _id: '65e054000000000000000001',
          questionText: 'Which collection class in Java guarantees that elements are maintained in sorted order based on their natural comparison?',
          options: ['ArrayList', 'HashSet', 'TreeSet', 'HashMap'],
          correctAnswer: 2,
          explanation: 'TreeSet implements the NavigableSet interface and stores elements in a sorted tree structure (Red-Black tree).',
          marks: 1
        },
        {
          _id: '65e054000000000000000002',
          questionText: 'Can an abstract class in Java have a constructor?',
          options: [
            'No, abstract classes can never have constructors',
            'Yes, and it is called when an instance of a subclass is created',
            'Only if the class contains no abstract methods',
            'Only if marked private'
          ],
          correctAnswer: 1,
          explanation: 'Yes, abstract classes have constructors invoked by subclass constructors via super().',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentMongo,
      title: 'MongoDB Query Modeling & Indexing',
      skill: 'MongoDB',
      category: 'Database',
      difficulty: 'Intermediate',
      description: 'Evaluate document schema design, aggregation pipeline operators, compound indexing, and write concern options.',
      duration: 15,
      passingScore: 70,
      isActive: true,
      questions: [
        {
          _id: '65e055000000000000000001',
          questionText: 'Which aggregation pipeline stage is used to perform an equality join with another collection in MongoDB?',
          options: ['$join', '$lookup', '$merge', '$project'],
          correctAnswer: 1,
          explanation: '$lookup performs a left outer join to an unsharded collection in the same database.',
          marks: 1
        },
        {
          _id: '65e055000000000000000002',
          questionText: 'What is the primary benefit of creating a compound index in MongoDB?',
          options: [
            'It reduces disk space by 50%',
            'It supports queries that match on multiple keys according to the Equality-Sort-Range rule',
            'It eliminates the need for an _id primary key',
            'It automatically validates JSON schemas'
          ],
          correctAnswer: 1,
          explanation: 'Compound indexes index multiple fields and can serve queries matching prefixes of the indexed fields.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentJs,
      title: 'JavaScript Modern ES6+ & Async Programming',
      skill: 'JavaScript',
      category: 'Programming Languages',
      difficulty: 'Intermediate',
      description: 'Covers closures, prototypes, event delegation, Promises, async/await, and modern ES2022+ features.',
      duration: 25,
      passingScore: 65,
      isActive: true,
      questions: [
        {
          _id: '65e056000000000000000001',
          questionText: 'What does Promise.all() do when one of the input promises rejects?',
          options: [
            'It waits for all others to finish and ignores the error',
            'It immediately rejects with the reason of that first promise that rejected',
            'It retries the failed promise three times',
            'It resolves with null'
          ],
          correctAnswer: 1,
          explanation: 'Promise.all rejects immediately with the error of the first promise that rejects (fail-fast behavior).',
          marks: 1
        },
        {
          _id: '65e056000000000000000002',
          questionText: 'What is a closure in JavaScript?',
          options: [
            'A way to terminate a loop early',
            'The combination of a function bundled together with references to its lexical environment',
            'A method that only executes once',
            'A special CSS selector for JavaScript elements'
          ],
          correctAnswer: 1,
          explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentCpp,
      title: 'C++ Object Models & Memory Management',
      skill: 'C++',
      category: 'Programming Languages',
      difficulty: 'Advanced',
      description: 'Pointers, dynamic memory allocation with new/delete, RAII, copy vs move constructors, and smart pointers.',
      duration: 20,
      passingScore: 70,
      isActive: true,
      questions: [
        {
          _id: '65e057000000000000000001',
          questionText: 'Which C++ smart pointer provides exclusive ownership of a dynamically allocated resource?',
          options: ['std::shared_ptr', 'std::unique_ptr', 'std::weak_ptr', 'std::auto_ptr'],
          correctAnswer: 1,
          explanation: 'std::unique_ptr uniquely owns and manages another object through a pointer and disposes of that object when the unique_ptr goes out of scope.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentSql,
      title: 'SQL Relational Queries & Transaction Control',
      skill: 'SQL',
      category: 'Database',
      difficulty: 'Intermediate',
      description: 'Covers JOINs, GROUP BY, HAVING, subqueries, indexing principles, and ACID transaction isolation.',
      duration: 20,
      passingScore: 70,
      isActive: true,
      questions: [
        {
          _id: '65e058000000000000000001',
          questionText: 'Which SQL clause is used to filter aggregate records after a GROUP BY statement?',
          options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
          correctAnswer: 1,
          explanation: 'The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentHtmlCss,
      title: 'HTML5 Semantic Web & Modern CSS Responsive Layouts',
      skill: 'HTML and CSS',
      category: 'Frontend Development',
      difficulty: 'Beginner',
      description: 'Semantic tags, accessibility (a11y), CSS Flexbox, CSS Grid, media queries, and responsive viewports.',
      duration: 15,
      passingScore: 60,
      isActive: true,
      questions: [
        {
          _id: '65e059000000000000000001',
          questionText: 'In CSS Flexbox, which property aligns items along the cross-axis?',
          options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
          correctAnswer: 1,
          explanation: 'align-items controls the alignment of items on the cross axis, while justify-content controls main axis alignment.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.assessmentDsa,
      title: 'Data Structures and Algorithms Proficiency Test',
      skill: 'Data Structures and Algorithms',
      category: 'Computer Science Core',
      difficulty: 'Advanced',
      description: 'Time and space complexity (Big O), trees, graphs, dynamic programming, sorting, and hash map collision resolution.',
      duration: 30,
      passingScore: 75,
      isActive: true,
      questions: [
        {
          _id: '65e05a000000000000000001',
          questionText: 'What is the average-case time complexity of searching for an element in a balanced Binary Search Tree (AVL or Red-Black)?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correctAnswer: 1,
          explanation: 'Because the height of a balanced BST is kept proportional to log2(n), search takes O(log n) time.',
          marks: 1
        }
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const assessmentResults = [
    {
      _id: IDS.resultJsInitial,
      studentId: IDS.studentUser,
      assessmentId: IDS.assessmentJs,
      score: 2,
      totalMarks: 2,
      percentage: 100,
      passingScore: 65,
      isPassed: true,
      proficiencyLevel: 'Expert',
      timeSpentSeconds: 240,
      status: 'completed',
      attemptNumber: 1,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 240 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
      correctCount: 2,
      incorrectCount: 0,
      unansweredCount: 0,
      reviewAnswers: [
        {
          questionText: 'What does Promise.all() do when one of the input promises rejects?',
          options: [
            'It waits for all others to finish and ignores the error',
            'It immediately rejects with the reason of that first promise that rejected',
            'It retries the failed promise three times',
            'It resolves with null'
          ],
          selectedAnswer: 1,
          correctAnswer: 1,
          isCorrect: true,
          explanation: 'Promise.all rejects immediately with the error of the first promise that rejects (fail-fast behavior).',
          marksAwarded: 1
        },
        {
          questionText: 'What is a closure in JavaScript?',
          options: [
            'A way to terminate a loop early',
            'The combination of a function bundled together with references to its lexical environment',
            'A method that only executes once',
            'A special CSS selector for JavaScript elements'
          ],
          selectedAnswer: 1,
          correctAnswer: 1,
          isCorrect: true,
          explanation: 'A closure gives an inner function access to an outer function’s scope even after the outer function has returned.',
          marksAwarded: 1
        }
      ],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const learningProgress = [
    {
      _id: IDS.progressJs,
      studentId: IDS.studentUser,
      skill: 'JavaScript',
      currentProficiency: 'Advanced',
      targetProficiency: 'Expert',
      progressPercentage: 85,
      startedCourses: [IDS.courseJs],
      completedCourses: [IDS.courseJs],
      notes: 'Completed Modern JavaScript deep dive course. Passed JavaScript assessment with 100% score.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.progressReact,
      studentId: IDS.studentUser,
      skill: 'React.js',
      currentProficiency: 'Advanced',
      targetProficiency: 'Expert',
      progressPercentage: 75,
      startedCourses: [IDS.courseReact],
      completedCourses: [],
      notes: 'Studying React performance optimization and memoization patterns.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.progressNode,
      studentId: IDS.studentUser,
      skill: 'Node.js',
      currentProficiency: 'Intermediate',
      targetProficiency: 'Advanced',
      progressPercentage: 60,
      startedCourses: [IDS.courseNodeSec],
      completedCourses: [],
      notes: 'Working on JWT authentication security modules.',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const applications = [
    {
      _id: IDS.applicationSample,
      studentId: IDS.studentUser,
      jobId: IDS.jobReactIntern,
      resumeUrl: 'https://skillbridge.edu/resumes/alex-johnson.pdf',
      coverNote: 'Excited about contributing to TechNova Labs front-end architecture with my React and JavaScript background.',
      status: 'Under Review',
      notes: 'Profile shortlisted for interview round 1.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const savedJobs = [
    {
      _id: IDS.savedJobSample,
      studentId: IDS.studentUser,
      jobId: IDS.jobMernDev,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const resumes = [
    {
      _id: '65e0a0000000000000000001',
      studentId: IDS.studentUser,
      title: 'Full Stack MERN Developer Resume',
      targetRole: 'Full Stack MERN Developer',
      template: 'ats',
      isDefault: true,
      personalInfo: {
        fullName: 'Alex Johnson',
        email: 'alex.johnson@college.edu',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        linkedinUrl: 'https://linkedin.com/in/alexjohnson',
        githubUrl: 'https://github.com/alexjohnson',
        portfolioUrl: 'https://alexjohnson.dev',
        summary: 'Enthusiastic full-stack engineer with hands-on experience designing reactive interfaces, scalable Express REST microservices, and high-performance MongoDB data pipelines.'
      },
      education: [
        {
          _id: '65e0a1000000000000000001',
          institution: 'National Institute of Technology',
          degree: 'B.Tech',
          fieldOfStudy: 'Computer Science & Engineering',
          startYear: 2022,
          endYear: 2026,
          grade: '8.7 / 10 CGPA',
          location: 'Bangalore, India'
        }
      ],
      experience: [
        {
          _id: '65e0a2000000000000000001',
          company: 'TechStart Labs',
          role: 'Full Stack Web Development Intern',
          location: 'Bangalore (Hybrid)',
          startDate: 'May 2025',
          endDate: 'July 2025',
          current: false,
          description: 'Engineered high-throughput client portals and automated notification microservices.',
          bulletPoints: [
            'Architected 12+ reusable React components adhering to Atomic Design principles, reducing sprint UI delivery time by 28%.',
            'Integrated JWT authentication with HTTP-only cookies and bcrypt password hashing for 2,000+ test user accounts.',
            'Optimized MongoDB aggregation pipelines to lower dashboard response latency by 35%.'
          ]
        }
      ],
      projects: [
        {
          _id: '65e0a3000000000000000001',
          title: 'CampHub — College Event Management Platform',
          description: 'Full-stack event portal enabling university clubs to host hackathons, sell tickets, and verify entries via dynamic QR codes.',
          technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
          liveUrl: 'https://camphub.example.com',
          githubUrl: 'https://github.com/alexjohnson/camphub',
          startDate: 'Jan 2025',
          endDate: 'Apr 2025',
          bulletPoints: [
            'Processed 500+ ticket bookings during annual tech symposium with zero concurrency lockouts.',
            'Implemented automated transactional email confirmations with PDF ticket attachments.'
          ]
        }
      ],
      skills: [
        { _id: '65e0a4000000000000000001', name: 'JavaScript (ES6+)', category: 'Programming Languages', proficiency: 'Advanced' },
        { _id: '65e0a4000000000000000002', name: 'React.js', category: 'Frontend Development', proficiency: 'Advanced' },
        { _id: '65e0a4000000000000000003', name: 'Node.js', category: 'Backend Development', proficiency: 'Intermediate' },
        { _id: '65e0a4000000000000000004', name: 'Express.js', category: 'Backend Development', proficiency: 'Intermediate' },
        { _id: '65e0a4000000000000000005', name: 'MongoDB', category: 'Database', proficiency: 'Intermediate' },
        { _id: '65e0a4000000000000000006', name: 'HTML5 & CSS3', category: 'Frontend Development', proficiency: 'Advanced' },
        { _id: '65e0a4000000000000000007', name: 'Git & GitHub', category: 'DevOps & Tools', proficiency: 'Intermediate' }
      ],
      certifications: [
        {
          _id: '65e0a5000000000000000001',
          name: 'Meta Front-End Developer Professional Certificate',
          issuingOrganization: 'Coursera / Meta',
          issueDate: '2025-06-15',
          credentialId: 'META-FED-2025-9981',
          credentialUrl: 'https://coursera.org/verify/META-FED-2025-9981'
        }
      ],
      customSections: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const resumeAnalyses = [
    {
      _id: '65e0b0000000000000000001',
      studentId: IDS.studentUser,
      resumeId: '65e0a0000000000000000001',
      resumeTitle: 'Full Stack MERN Developer Resume',
      targetRole: 'Frontend React Developer Intern',
      jobId: IDS.jobReactIntern,
      jobTitle: 'Frontend React Developer Intern',
      company: 'TechNova Labs',
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
      aiConfigured: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const mentors = [
    {
      _id: IDS.mentorFullStack,
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
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.mentorDevOps,
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
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.mentorAI,
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
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.mentorCyber,
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
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.mentorData,
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
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: IDS.mentorRobotics,
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
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  const mentorshipRequests = [
    {
      _id: '65e0b0000000000000000001',
      studentId: IDS.studentUser,
      mentorId: IDS.mentorFullStack,
      message: 'Hello Sarah, I am working through MERN stack projects and would value guidance on clean microservice architecture and production state management.',
      status: 'Pending',
      mentorResponse: '',
      statusChangedAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  return {
    users,
    profiles,
    jobs,
    courses,
    assessments,
    assessmentResults,
    learningProgress,
    applications,
    savedJobs,
    resumes,
    resumeAnalyses,
    mentors,
    mentorshipRequests
  };
};

module.exports = {
  IDS,
  getInitialDemoData
};
