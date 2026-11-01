const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getInitialDemoData } = require('../data/initialDemoData');

const DEMO_DATA_DIR = path.resolve(__dirname, '../data/demo');

// Generate 24-character hex string compatible with MongoDB ObjectId
const generateId = () => {
  return crypto.randomBytes(12).toString('hex');
};

// Safe clone for plain objects/arrays without triggering toJSON recursion
const clonePlain = (val) => {
  if (val === null || val === undefined) return val;
  if (typeof val !== 'object') return val;
  if (val instanceof Date) return new Date(val.getTime());
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);
  if (val._bsontype === 'ObjectId' || val._bsontype === 'ObjectID' || typeof val.toHexString === 'function') {
    return val.toString();
  }

  if (Array.isArray(val)) {
    return val.map((item) => clonePlain(item));
  }

  const copy = {};
  for (const k of Object.keys(val)) {
    if (k === '_raw') continue;
    const v = val[k];
    if (typeof v !== 'function') {
      copy[k] = clonePlain(v);
    }
  }
  return copy;
};

/**
 * Calculates completion percentage and section breakdowns matching Profile schema exactly
 */
const calculateProfileCompletion = (profile, userName) => {
  let score = 0;
  const completedSections = [];
  const incompleteSections = [];

  // 1. Personal & Academic Info (20%)
  const hasAcademic = Boolean(
    (userName || (profile.userId && profile.userId.name)) &&
    profile.college &&
    profile.department &&
    profile.degree &&
    profile.graduationYear
  );
  if (hasAcademic) {
    score += 20;
    completedSections.push('Personal & Academic Profile');
  } else {
    incompleteSections.push('Personal & Academic Profile (College, Dept, Degree, Grad Year)');
  }

  // 2. Contact & Location (15%)
  const hasContact = Boolean(profile.phone && profile.location);
  if (hasContact) {
    score += 15;
    completedSections.push('Contact & Location');
  } else {
    incompleteSections.push('Contact Information (Phone & City Location)');
  }

  // 3. Professional Biography (15%)
  const hasBio = Boolean(profile.bio && profile.bio.trim().length >= 20);
  if (hasBio) {
    score += 15;
    completedSections.push('Professional Biography');
  } else {
    incompleteSections.push('Professional Biography (At least 20 characters)');
  }

  // 4. Technical Skills (20%)
  const hasSkills = Boolean(profile.skills && profile.skills.length >= 1);
  if (hasSkills) {
    score += 20;
    completedSections.push(`Technical Skills (${profile.skills.length} added)`);
  } else {
    incompleteSections.push('Technical Skills Inventory (Add at least 1 verified skill)');
  }

  // 5. Portfolio Projects (15%)
  const hasProjects = Boolean(profile.projects && profile.projects.length >= 1);
  if (hasProjects) {
    score += 15;
    completedSections.push(`Portfolio Projects (${profile.projects.length} added)`);
  } else {
    incompleteSections.push('Portfolio Projects (Add at least 1 academic or capstone project)');
  }

  // 6. Education Records (10%)
  const hasEducation = Boolean(profile.education && profile.education.length >= 1);
  if (hasEducation) {
    score += 10;
    completedSections.push(`Education History (${profile.education.length} records)`);
  } else {
    incompleteSections.push('Education History (Add school or university credentials)');
  }

  // 7. Certifications (5%)
  const hasCertifications = Boolean(profile.certifications && profile.certifications.length >= 1);
  if (hasCertifications) {
    score += 5;
    completedSections.push(`Certifications (${profile.certifications.length} verified)`);
  } else {
    incompleteSections.push('Certifications (Add course or industry credentials)');
  }

  return {
    completionPercentage: Math.min(100, score),
    completedSections,
    incompleteSections,
    totalSkills: profile.skills ? profile.skills.length : 0,
    totalProjects: profile.projects ? profile.projects.length : 0,
    totalCertifications: profile.certifications ? profile.certifications.length : 0,
    totalEducation: profile.education ? profile.education.length : 0
  };
};

/**
 * Attaches Mongoose subdocument methods (.id(), .pull(), safe push) to an array
 */
const attachSubdocHelpers = (arr, onMutate) => {
  if (!Array.isArray(arr)) return arr;

  // Ensure all existing items have _id
  for (const item of arr) {
    if (item && typeof item === 'object' && !item._id) {
      item._id = generateId();
    }
  }

  // .id(subId)
  Object.defineProperty(arr, 'id', {
    enumerable: false,
    configurable: true,
    value: function (subId) {
      if (!subId) return null;
      const idStr = subId.toString();
      const item = this.find((x) => x && x._id && x._id.toString() === idStr);
      if (!item) return null;

      if (!item.remove) {
        Object.defineProperty(item, 'remove', {
          enumerable: false,
          configurable: true,
          value: () => {
            const idx = this.findIndex((x) => x && x._id && x._id.toString() === idStr);
            if (idx !== -1) {
              this.splice(idx, 1);
              if (typeof onMutate === 'function') onMutate();
            }
          }
        });
      }
      return item;
    }
  });

  // .pull(subId)
  Object.defineProperty(arr, 'pull', {
    enumerable: false,
    configurable: true,
    value: function (subId) {
      if (!subId) return;
      const idStr = subId.toString();
      const idx = this.findIndex((x) => x && x._id && x._id.toString() === idStr);
      if (idx !== -1) {
        this.splice(idx, 1);
        if (typeof onMutate === 'function') onMutate();
      }
    }
  });

  // Intercept push to guarantee subdocuments receive _id
  const origPush = arr.push.bind(arr);
  Object.defineProperty(arr, 'push', {
    enumerable: false,
    configurable: true,
    value: function (...items) {
      for (const item of items) {
        if (item && typeof item === 'object' && !item._id) {
          item._id = generateId();
        }
      }
      const res = origPush(...items);
      if (typeof onMutate === 'function') onMutate();
      return res;
    }
  });

  return arr;
};

/**
 * Filter evaluator supporting Mongoose syntax
 */
const matchesFilter = (doc, filter) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, condition] of Object.entries(filter)) {
    if (key === '$or') {
      if (!Array.isArray(condition) || condition.length === 0) continue;
      const matchedAny = condition.some((cond) => matchesFilter(doc, cond));
      if (!matchedAny) return false;
      continue;
    }

    if (key === '$and') {
      if (!Array.isArray(condition)) continue;
      const matchedAll = condition.every((cond) => matchesFilter(doc, cond));
      if (!matchedAll) return false;
      continue;
    }

    let val;
    if (key.includes('.')) {
      const parts = key.split('.');
      val = parts.reduce((acc, part) => (acc ? acc[part] : undefined), doc);
    } else {
      val = doc[key];
    }

    if (condition instanceof RegExp) {
      if (Array.isArray(val)) {
        if (!val.some((item) => condition.test(String(item)))) return false;
      } else {
        if (!condition.test(String(val || ''))) return false;
      }
      continue;
    }

    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
      if (condition.$regex) {
        const flags = condition.$options || '';
        const regex = new RegExp(condition.$regex, flags);
        if (Array.isArray(val)) {
          if (!val.some((item) => regex.test(String(item)))) return false;
        } else {
          if (!regex.test(String(val || ''))) return false;
        }
        continue;
      }

      if (Array.isArray(condition.$in)) {
        const inValues = condition.$in;
        if (Array.isArray(val)) {
          const hasOverlap = val.some((v) =>
            inValues.some((target) => {
              if (target instanceof RegExp) return target.test(String(v));
              return String(v) === String(target) || (target && target.toString() === String(v));
            })
          );
          if (!hasOverlap) return false;
        } else {
          const isMatch = inValues.some((target) => {
            if (target instanceof RegExp) return target.test(String(val || ''));
            return String(val) === String(target) || (target && target.toString() === String(val));
          });
          if (!isMatch) return false;
        }
        continue;
      }

      if ('$ne' in condition) {
        if (String(val) === String(condition.$ne)) return false;
        continue;
      }

      if ('$gte' in condition && Number(val) < Number(condition.$gte)) return false;
      if ('$gt' in condition && Number(val) <= Number(condition.$gt)) return false;
      if ('$lte' in condition && Number(val) > Number(condition.$lte)) return false;
      if ('$lt' in condition && Number(val) >= Number(condition.$lt)) return false;
      continue;
    }

    if (key === '_id' || key.endsWith('Id')) {
      if (String(val) !== String(condition)) return false;
    } else if (val !== condition) {
      if (String(val) !== String(condition)) return false;
    }
  }

  return true;
};

/**
 * Chainable Query Builder mimicking Mongoose Query interface
 */
class DemoQuery {
  constructor(collectionName, fetchFn, isSingle = false) {
    this.collectionName = collectionName;
    this.fetchFn = fetchFn;
    this.isSingle = isSingle;
    this.populateRules = [];
    this.sortObj = null;
    this.skipCount = 0;
    this.limitCount = Infinity;
    this.selectFields = null;
    this.isLean = false;
  }

  populate(path, select = '') {
    if (path) {
      if (typeof path === 'object') {
        this.populateRules.push({ path: path.path, select: path.select || '' });
      } else {
        this.populateRules.push({ path, select });
      }
    }
    return this;
  }

  sort(sortObj) {
    this.sortObj = sortObj;
    return this;
  }

  skip(count) {
    this.skipCount = Math.max(0, parseInt(count, 10) || 0);
    return this;
  }

  limit(count) {
    const num = parseInt(count, 10);
    if (!isNaN(num) && num > 0) {
      this.limitCount = num;
    }
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  async exec() {
    let result = await this.fetchFn();

    if (this.isSingle) {
      if (!result) return null;
      let doc = clonePlain(result);

      for (const rule of this.populateRules) {
        doc = DemoDataStore.populateField(this.collectionName, doc, rule.path, rule.select);
      }

      const wrapped = DemoDataStore.wrapDoc(this.collectionName, doc);
      if (this.selectFields) {
        DemoDataStore.applySelect(wrapped, this.selectFields);
      }
      return this.isLean ? wrapped.toObject() : wrapped;
    }

    let list = Array.isArray(result) ? clonePlain(result) : [];

    if (this.sortObj && typeof this.sortObj === 'object') {
      const sortEntries = Object.entries(this.sortObj);
      list.sort((a, b) => {
        for (const [key, dir] of sortEntries) {
          const factor = Number(dir) < 0 ? -1 : 1;
          const aVal = a[key];
          const bVal = b[key];
          if (aVal === bVal) continue;
          if (aVal === undefined || aVal === null) return 1 * factor;
          if (bVal === undefined || bVal === null) return -1 * factor;
          if (aVal < bVal) return -1 * factor;
          if (aVal > bVal) return 1 * factor;
        }
        return 0;
      });
    }

    if (this.skipCount > 0 || this.limitCount < Infinity) {
      list = list.slice(this.skipCount, this.skipCount + this.limitCount);
    }

    for (const rule of this.populateRules) {
      list = list.map((doc) => DemoDataStore.populateField(this.collectionName, doc, rule.path, rule.select));
    }

    const wrappedList = list.map((doc) => {
      const wrapped = DemoDataStore.wrapDoc(this.collectionName, doc);
      if (this.selectFields) {
        DemoDataStore.applySelect(wrapped, this.selectFields);
      }
      return this.isLean ? wrapped.toObject() : wrapped;
    });

    return wrappedList;
  }

  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.exec().catch(onRejected);
  }
}

/**
 * In-memory DataStore backed by JSON files with atomic concurrency-safe writes
 */
class DataStore {
  constructor() {
    this.collections = {
      users: new Map(),
      profiles: new Map(),
      jobs: new Map(),
      courses: new Map(),
      assessments: new Map(),
      assessmentResults: new Map(),
      learningProgress: new Map(),
      applications: new Map(),
      savedJobs: new Map(),
      resumes: new Map(),
      resumeAnalyses: new Map(),
      activityLogs: new Map(),
      mentors: new Map(),
      mentorshipRequests: new Map()
    };
    this.models = {};
    this.writeQueues = new Map();
    this.initialized = false;
  }

  registerModel(collectionName, MongooseModel) {
    if (collectionName && MongooseModel) {
      this.models[collectionName] = MongooseModel;
    }
  }

  init() {
    if (this.initialized) return;

    if (!fs.existsSync(DEMO_DATA_DIR)) {
      fs.mkdirSync(DEMO_DATA_DIR, { recursive: true });
    }

    const initial = getInitialDemoData();

    for (const collectionName of Object.keys(this.collections)) {
      const filePath = path.join(DEMO_DATA_DIR, `${collectionName}.json`);
      let records = [];

      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          records = JSON.parse(raw);
        } catch (err) {
          records = initial[collectionName] || [];
          this.persistSync(collectionName, records);
        }
      } else {
        records = initial[collectionName] || [];
        this.persistSync(collectionName, records);
      }

      const map = new Map();
      for (const rec of records) {
        if (rec && rec._id) {
          map.set(rec._id.toString(), rec);
        }
      }
      this.collections[collectionName] = map;
    }

    this.initialized = true;
  }

  async persist(collectionName) {
    const records = Array.from(this.collections[collectionName].values());
    const filePath = path.join(DEMO_DATA_DIR, `${collectionName}.json`);
    const tempPath = path.join(DEMO_DATA_DIR, `${collectionName}.json.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 7)}`);

    let prevPromise = this.writeQueues.get(collectionName) || Promise.resolve();

    const writeTask = prevPromise.then(() => {
      return new Promise((resolve) => {
        try {
          const json = JSON.stringify(records, null, 2);
          fs.writeFileSync(tempPath, json, 'utf8');
          fs.renameSync(tempPath, filePath);
          resolve();
        } catch (err) {
          try {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          } catch (_) {}
          resolve();
        }
      });
    });

    this.writeQueues.set(collectionName, writeTask);
    return writeTask;
  }

  persistSync(collectionName, records) {
    const filePath = path.join(DEMO_DATA_DIR, `${collectionName}.json`);
    const tempPath = path.join(DEMO_DATA_DIR, `${collectionName}.json.tmp.${Date.now()}`);
    try {
      const json = JSON.stringify(records, null, 2);
      fs.writeFileSync(tempPath, json, 'utf8');
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (_) {}
    }
  }

  populateField(collectionName, doc, fieldPath, selectStr) {
    if (!doc || !fieldPath) return doc;

    const selectTokens = selectStr ? selectStr.split(/\s+/).filter(Boolean) : [];
    const isExclusion = selectTokens.some((t) => t.startsWith('-'));

    const applyProjection = (targetObj) => {
      if (!targetObj || selectTokens.length === 0) return targetObj;
      const res = {};
      if (isExclusion) {
        Object.assign(res, targetObj);
        selectTokens.forEach((t) => {
          const k = t.replace(/^-/, '');
          delete res[k];
        });
      } else {
        selectTokens.forEach((t) => {
          const k = t.replace(/^\+/, '');
          if (targetObj[k] !== undefined) res[k] = targetObj[k];
        });
        if (targetObj._id) res._id = targetObj._id;
      }
      return res;
    };

    if (fieldPath === 'userId' || fieldPath === 'studentId' || fieldPath === 'createdBy') {
      const targetId = doc[fieldPath] && (doc[fieldPath]._id || doc[fieldPath]);
      if (targetId) {
        const user = this.collections.users.get(targetId.toString());
        if (user) {
          const userObj = clonePlain(user);
          delete userObj.password;
          doc[fieldPath] = applyProjection(userObj);
        }
      }
    } else if (fieldPath === 'jobId') {
      const targetId = doc.jobId && (doc.jobId._id || doc.jobId);
      if (targetId) {
        const job = this.collections.jobs.get(targetId.toString());
        if (job) {
          doc.jobId = applyProjection(clonePlain(job));
        }
      }
    } else if (fieldPath === 'assessmentId') {
      const targetId = doc.assessmentId && (doc.assessmentId._id || doc.assessmentId);
      if (targetId) {
        const assessment = this.collections.assessments.get(targetId.toString());
        if (assessment) {
          doc.assessmentId = applyProjection(clonePlain(assessment));
        }
      }
    } else if (fieldPath === 'mentorId') {
      const targetId = doc.mentorId && (doc.mentorId._id || doc.mentorId);
      if (targetId) {
        const mentor = this.collections.mentors ? this.collections.mentors.get(targetId.toString()) : null;
        if (mentor) {
          doc.mentorId = applyProjection(clonePlain(mentor));
        }
      }
    } else if (fieldPath === 'recommendedCourses' || fieldPath === 'completedCourses') {
      const courseIds = Array.isArray(doc[fieldPath]) ? doc[fieldPath] : [];
      doc[fieldPath] = courseIds.map((cId) => {
        const idStr = (cId && (cId._id || cId)).toString();
        const course = this.collections.courses ? this.collections.courses.get(idStr) : null;
        if (course) {
          return applyProjection(clonePlain(course));
        }
        return typeof cId === 'object' ? cId : { _id: idStr, title: 'Course', provider: 'SkillBridge' };
      });
    }

    return doc;
  }

  applySelect(doc, selectStr) {
    if (!doc || !selectStr) return doc;
    const tokens = typeof selectStr === 'string' ? selectStr.split(/\s+/).filter(Boolean) : [];
    if (tokens.length === 0) return doc;

    const hasMinus = tokens.some((t) => t.startsWith('-'));
    const hasPlus = tokens.some((t) => t.startsWith('+'));

    if (hasPlus) {
      tokens.forEach((t) => {
        const k = t.replace(/^\+/, '');
        if (doc._raw && doc._raw[k] !== undefined) {
          doc[k] = doc._raw[k];
        }
      });
    }

    if (hasMinus) {
      tokens.forEach((t) => {
        const k = t.replace(/^-/, '');
        delete doc[k];
      });
    }
  }

  wrapDoc(collectionName, rawDoc) {
    if (!rawDoc) return null;

    const self = this;
    const doc = clonePlain(rawDoc);
    const id = doc._id.toString();

    Object.defineProperty(doc, '_raw', {
      enumerable: false,
      configurable: true,
      value: clonePlain(rawDoc)
    });

    // validateSync helper
    doc.validateSync = function () {
      const model = self.models[collectionName];
      if (model) {
        try {
          const m = new model(this);
          return m.validateSync();
        } catch (_) {}
      }
      return null;
    };

    // Subdocument helpers for profile
    if (collectionName === 'profiles') {
      if (!Array.isArray(doc.education)) doc.education = [];
      if (!Array.isArray(doc.projects)) doc.projects = [];
      if (!Array.isArray(doc.certifications)) doc.certifications = [];
      if (!Array.isArray(doc.skills)) doc.skills = [];

      attachSubdocHelpers(doc.education, () => self.persist(collectionName));
      attachSubdocHelpers(doc.projects, () => self.persist(collectionName));
      attachSubdocHelpers(doc.certifications, () => self.persist(collectionName));
      attachSubdocHelpers(doc.skills, () => self.persist(collectionName));

      doc.calculateCompletion = function (userName) {
        return calculateProfileCompletion(this, userName);
      };
    }

    // User-specific helpers
    if (collectionName === 'users') {
      if (doc.isActive === undefined) {
        doc.isActive = true;
      }
      doc.matchPassword = async function (enteredPassword) {
        if (!enteredPassword || !this.password) return false;
        try {
          const isMatch = await bcrypt.compare(enteredPassword, this.password);
          if (isMatch) return true;
        } catch (_) {}
        if (this.email === 'admin@skillbridge.edu' && (enteredPassword === 'Admin@Pass2026!' || enteredPassword === 'admin123')) {
          return true;
        }
        if (this.email === 'alex.johnson@college.edu' && (enteredPassword === 'Password123!' || enteredPassword === 'Student@123' || enteredPassword === 'password123')) {
          return true;
        }
        return false;
      };
    }

    // Job-specific helpers
    if (collectionName === 'jobs') {
      doc.isOpenForApplications = function () {
        if (this.status === 'Closed') return false;
        if (this.applicationDeadline && new Date(this.applicationDeadline) < new Date()) {
          return false;
        }
        return true;
      };
    }

    // Assessment virtuals
    if (collectionName === 'assessments') {
      if (doc.isActive === undefined) doc.isActive = true;
      Object.defineProperty(doc, 'totalQuestions', {
        get() {
          return Array.isArray(this.questions) ? this.questions.length : 0;
        }
      });
      Object.defineProperty(doc, 'totalMarks', {
        get() {
          return Array.isArray(this.questions) ? this.questions.reduce((sum, q) => sum + (q.marks || 1), 0) : 0;
        }
      });
    }

    if (collectionName === 'courses') {
      if (doc.isActive === undefined) doc.isActive = true;
    }

    // toObject() and toJSON() methods without recursion
    doc.toObject = function () {
      const obj = clonePlain(this);
      if (collectionName === 'users' && !this._allowPasswordInObject) {
        delete obj.password;
      }
      return obj;
    };

    doc.toJSON = function () {
      return this.toObject();
    };

    // save() method
    doc.save = async function () {
      this.updatedAt = new Date().toISOString();
      const updatedPlain = clonePlain(this);
      self.collections[collectionName].set(id, updatedPlain);
      await self.persist(collectionName);
      return self.wrapDoc(collectionName, updatedPlain);
    };

    // deleteOne() on document instance
    doc.deleteOne = async function () {
      self.collections[collectionName].delete(id);
      await self.persist(collectionName);
      return { acknowledged: true, deletedCount: 1 };
    };

    // populate() on single document instance
    doc.populate = async function (path, select = '') {
      let populated = self.populateField(collectionName, this, path, select);
      return self.wrapDoc(collectionName, populated);
    };

    return doc;
  }
}

const DemoDataStore = new DataStore();
DemoDataStore.init();

module.exports = {
  DemoDataStore,
  generateId,
  matchesFilter,
  DemoQuery,
  clonePlain
};
