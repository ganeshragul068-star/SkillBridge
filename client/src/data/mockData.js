/**
 * Mock Data for SkillBridge (Phase 1 Frontend Prototype)
 * Provides realistic data for jobs, user profile, and skill gap statistics
 */

export const studentProfile = {
  id: 'std_101',
  name: 'Alex Johnson',
  email: 'alex.johnson@college.edu',
  headline: 'Aspiring Full Stack Web Developer | 3rd Year B.Tech CSE',
  college: 'National Institute of Technology',
  degree: 'B.Tech in Computer Science & Engineering',
  graduationYear: 2026,
  cgpa: '8.7 / 10',
  targetRole: 'MERN Stack Developer',
  employabilityScore: 78, // %
  profileCompletion: 85, // %
  bio: 'Enthusiastic computer science student passionate about building scalable web applications with modern JavaScript frameworks. Currently focusing on mastering full-stack system architecture.',
  skillsAcquired: [
    { name: 'JavaScript (ES6+)', level: 'Advanced', proficiency: 85 },
    { name: 'React.js', level: 'Intermediate', proficiency: 75 },
    { name: 'Node.js', level: 'Intermediate', proficiency: 70 },
    { name: 'HTML5 & CSS3', level: 'Advanced', proficiency: 90 },
    { name: 'Git & GitHub', level: 'Intermediate', proficiency: 80 },
    { name: 'REST APIs', level: 'Intermediate', proficiency: 75 }
  ],
  skillGaps: [
    { name: 'MongoDB Aggregations', importance: 'High', status: 'In Progress' },
    { name: 'Docker & Containers', importance: 'Medium', status: 'Not Started' },
    { name: 'Unit Testing (Jest)', importance: 'Medium', status: 'Not Started' },
    { name: 'TypeScript', importance: 'High', status: 'Recommended' }
  ],
  stats: {
    appliedJobs: 6,
    interviewsScheduled: 2,
    skillsMastered: 12,
    skillGapsRemaining: 4,
    assessmentsTaken: 5
  },
  recentActivities: [
    { id: 1, title: 'Completed React Component Architecture Assessment', time: 'Yesterday', score: '88%' },
    { id: 2, title: 'Applied for Frontend Intern at TechNova Labs', time: '3 days ago', status: 'Under Review' },
    { id: 3, title: 'Added Git & Version Control to Profile', time: '5 days ago', status: 'Verified' },
    { id: 4, title: 'Skill Gap Report generated for MERN Stack role', time: '1 week ago', status: 'Completed' }
  ],
  projects: [
    {
      title: 'CampHub - College Event Management Platform',
      tech: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
      description: 'A portal enabling student clubs to organize events, sell tickets, and verify attendance via QR codes.'
    },
    {
      title: 'DevCollab - Realtime Code Snippet Sharing',
      tech: ['React', 'Socket.io', 'Express'],
      description: 'Web app for peer code reviews and sharing snippet playgrounds in real time.'
    }
  ]
};

export const sampleJobs = [
  {
    id: 'job-1',
    title: 'Frontend React Developer Intern',
    company: 'TechNova Labs',
    location: 'Bangalore, India',
    type: 'Internship',
    workplace: 'Hybrid',
    stipend: '₹25,000 / month',
    duration: '6 Months',
    experience: 'Fresher / Student',
    matchScore: 88,
    tags: ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Git'],
    description: 'Looking for a passionate React intern to build dynamic client dashboards, reusable component libraries, and optimize web performance.',
    postedDate: '2 days ago',
    applicantsCount: 42,
    featured: true
  },
  {
    id: 'job-2',
    title: 'Junior MERN Stack Developer',
    company: 'NextGen Solutions',
    location: 'Hyderabad, India',
    type: 'Full-time',
    workplace: 'On-site',
    stipend: '₹5.5 - 7.0 LPA',
    duration: 'Full-time',
    experience: '0 - 1 Years',
    matchScore: 78,
    tags: ['MongoDB', 'Express', 'React', 'Node.js', 'REST APIs'],
    description: 'Join our agile core engineering squad building B2B SaaS portals. Great opportunity for recent 2025/2026 graduates with hands-on MERN projects.',
    postedDate: 'Just now',
    applicantsCount: 18,
    featured: true
  },
  {
    id: 'job-3',
    title: 'Backend Node.js Intern',
    company: 'Apex Fintech',
    location: 'Remote',
    type: 'Internship',
    workplace: 'Remote',
    stipend: '₹30,000 / month',
    duration: '3 Months',
    experience: 'Student / Pre-final Year',
    matchScore: 70,
    tags: ['Node.js', 'Express', 'MongoDB', 'Authentication', 'REST'],
    description: 'Work alongside lead architects designing high-throughput API endpoints, payment webhooks, and secure authentication flows.',
    postedDate: '3 days ago',
    applicantsCount: 65,
    featured: false
  },
  {
    id: 'job-4',
    title: 'Software Development Engineer - Intern',
    company: 'CloudSphere Technologies',
    location: 'Pune, India',
    type: 'Internship',
    workplace: 'Remote',
    stipend: '₹22,000 / month',
    duration: '6 Months',
    experience: 'Fresher',
    matchScore: 82,
    tags: ['JavaScript', 'React', 'Git', 'Data Structures', 'Problem Solving'],
    description: 'Gain real-world experience building scalable cloud-native web modules with modern micro-frontend architectures.',
    postedDate: '4 days ago',
    applicantsCount: 51,
    featured: false
  },
  {
    id: 'job-5',
    title: 'Data Analyst & BI Intern',
    company: 'InsightWave Analytics',
    location: 'Gurgaon, India',
    type: 'Internship',
    workplace: 'Hybrid',
    stipend: '₹20,000 / month',
    duration: '4 Months',
    experience: 'Student',
    matchScore: 55,
    tags: ['Python', 'SQL', 'PowerBI', 'Excel', 'Data Visualization'],
    description: 'Assist product teams in querying user analytics, formulating retention cohorts, and creating executive dashboard reports.',
    postedDate: '1 week ago',
    applicantsCount: 34,
    featured: false
  },
  {
    id: 'job-6',
    title: 'UI/UX Design & Frontend Intern',
    company: 'PixelCraft Studio',
    location: 'Remote',
    type: 'Internship',
    workplace: 'Remote',
    stipend: '₹18,000 / month',
    duration: '3 Months',
    experience: 'Student / Fresher',
    matchScore: 75,
    tags: ['Figma', 'React', 'CSS3', 'UI Design', 'Wireframing'],
    description: 'Bridge the gap between design mockups and working React interfaces. Create interactive component prototypes and accessible web styles.',
    postedDate: '5 days ago',
    applicantsCount: 29,
    featured: false
  }
];

export const platformFeatures = [
  {
    id: 'feat-1',
    title: 'AI Skill Gap Detection',
    description: 'Compare your current coursework and projects against real-time industry job descriptions to identify the exact missing skills.',
    icon: 'Target',
    tag: 'Core Feature'
  },
  {
    id: 'feat-2',
    title: 'Fresher-Verified Opportunities',
    description: 'Access curated internships and entry-level positions where employers are specifically seeking college students and fresh graduates.',
    icon: 'Briefcase',
    tag: 'Direct Hiring'
  },
  {
    id: 'feat-3',
    title: 'Personalized Learning Roadmaps',
    description: 'Receive step-by-step milestones to close your skill gaps with free, high-yield college-friendly tutorials and project ideas.',
    icon: 'Compass',
    tag: 'Guided Growth'
  },
  {
    id: 'feat-4',
    title: 'Employability Readiness Index',
    description: 'Get an objective employability percentage score to benchmark your market competitiveness before applying for campus placements.',
    icon: 'TrendingUp',
    tag: 'Benchmarking'
  },
  {
    id: 'feat-5',
    title: 'ATS-Friendly Profile & Resume',
    description: 'Format your college projects, technical proficiencies, and coursework into recruiter-ready formats that pass screening engines.',
    icon: 'FileCheck',
    tag: 'Career Ready'
  },
  {
    id: 'feat-6',
    title: 'College Campus Alignment',
    description: 'Built specifically around academic curriculum calendars so students can balance exams, lab work, and career prep seamlessly.',
    icon: 'GraduationCap',
    tag: 'Student Focused'
  }
];
