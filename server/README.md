# SkillBridge Backend Server

This is the Express.js and Node.js backend directory for SkillBridge – Youth Employability Platform.

## Current Status (Phase 1)
- Scaffolded folder structure (`config`, `controllers`, `models`, `routes`, `middleware`).
- Server entry point created (`server.js`).
- Database and Auth configurations prepared for Phase 2.

## Next Steps (Phase 2)
1. Install server dependencies: `cd server && npm install`
2. Configure `.env` with MongoDB Atlas connection string and JWT secret.
3. Activate MongoDB Mongoose connection in `server.js`.
4. Implement user authentication (Register, Login, Password Hashing via bcrypt, JWT tokens).
5. Implement Job & Internship CRUD endpoints and skill gap analysis algorithms.
