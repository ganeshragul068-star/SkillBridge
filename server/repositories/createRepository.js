const { DemoDataStore, generateId, matchesFilter, DemoQuery } = require('./dataStore');
const { isDemoMode } = require('../config/dataMode');
const bcrypt = require('bcryptjs');

/**
 * Creates a repository that dynamically delegates to either DemoDataStore or MongooseModel
 * based on process.env.DATA_MODE
 */
function createRepository(collectionName, MongooseModel) {
  if (collectionName && MongooseModel) {
    DemoDataStore.registerModel(collectionName, MongooseModel);
  }

  const getCollection = () => {
    return DemoDataStore.collections[collectionName];
  };

  class RepositoryModel {
    constructor(data = {}) {
      if (!isDemoMode() && MongooseModel) {
        return new MongooseModel(data);
      }

      const id = data._id ? data._id.toString() : generateId();
      const now = new Date().toISOString();
      const raw = {
        ...data,
        _id: id,
        createdAt: data.createdAt || now,
        updatedAt: now
      };

      // Special hashing on User constructor if password provided
      if (collectionName === 'users') {
        if (raw.password && !raw.password.startsWith('$2')) {
          raw.password = bcrypt.hashSync(raw.password, 10);
        }
        if (raw.isActive === undefined) {
          raw.isActive = true;
        }
      }

      // Automatically assign empty arrays for profile collections
      if (collectionName === 'profiles') {
        if (!Array.isArray(raw.skills)) raw.skills = [];
        if (!Array.isArray(raw.education)) raw.education = [];
        if (!Array.isArray(raw.projects)) raw.projects = [];
        if (!Array.isArray(raw.certifications)) raw.certifications = [];
      }

      if (collectionName === 'jobs') {
        if (!raw.status) raw.status = 'Active';
      }

      if (collectionName === 'applications') {
        if (!raw.status) raw.status = 'Applied';
      }

      if (collectionName === 'courses' || collectionName === 'assessments' || collectionName === 'mentors') {
        if (raw.isActive === undefined) raw.isActive = true;
      }

      if (collectionName === 'mentors') {
        if (!Array.isArray(raw.technicalSkills)) raw.technicalSkills = [];
        if (!Array.isArray(raw.areasOfExpertise)) raw.areasOfExpertise = [];
        if (!Array.isArray(raw.careerDomains)) raw.careerDomains = [];
        if (!raw.preferredMode) raw.preferredMode = 'online';
      }

      if (collectionName === 'mentorshipRequests') {
        if (!raw.status) raw.status = 'Pending';
      }

      return DemoDataStore.wrapDoc(collectionName, raw);
    }

    static find(query = {}) {
      if (!isDemoMode() && MongooseModel) {
        return MongooseModel.find(query);
      }

      return new DemoQuery(collectionName, async () => {
        const all = Array.from(getCollection().values());
        return all.filter((doc) => matchesFilter(doc, query));
      }, false);
    }

    static findOne(query = {}) {
      if (!isDemoMode() && MongooseModel) {
        return MongooseModel.findOne(query);
      }

      return new DemoQuery(collectionName, async () => {
        const all = Array.from(getCollection().values());
        const found = all.find((doc) => matchesFilter(doc, query));
        return found || null;
      }, true);
    }

    static findById(id) {
      if (!isDemoMode() && MongooseModel) {
        return MongooseModel.findById(id);
      }

      return new DemoQuery(collectionName, async () => {
        if (!id) return null;
        const idStr = id.toString();
        const found = getCollection().get(idStr);
        return found || null;
      }, true);
    }

    static async create(data) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.create(data);
      }

      const id = data._id ? data._id.toString() : generateId();
      const now = new Date().toISOString();
      const doc = {
        ...data,
        _id: id,
        createdAt: now,
        updatedAt: now
      };

      // Auto-hash password on User creation
      if (collectionName === 'users') {
        if (doc.password && !doc.password.startsWith('$2')) {
          doc.password = bcrypt.hashSync(doc.password, 10);
        }
        if (doc.isActive === undefined) {
          doc.isActive = true;
        }
      }

      // Profile default arrays
      if (collectionName === 'profiles') {
        if (!Array.isArray(doc.skills)) doc.skills = [];
        if (!Array.isArray(doc.education)) doc.education = [];
        if (!Array.isArray(doc.projects)) doc.projects = [];
        if (!Array.isArray(doc.certifications)) doc.certifications = [];
      }

      if (collectionName === 'courses' || collectionName === 'assessments') {
        if (doc.isActive === undefined) doc.isActive = true;
      }

      if (collectionName === 'assessmentResults') {
        if (!doc.status) doc.status = 'completed';
      }

      getCollection().set(id, doc);
      await DemoDataStore.persist(collectionName);
      return DemoDataStore.wrapDoc(collectionName, doc);
    }

    static async countDocuments(query = {}) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.countDocuments(query);
      }

      const all = Array.from(getCollection().values());
      const filtered = all.filter((doc) => matchesFilter(doc, query));
      return filtered.length;
    }

    static async findByIdAndUpdate(id, update = {}, options = {}) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.findByIdAndUpdate(id, update, options);
      }

      if (!id) return null;
      const idStr = id.toString();
      const existing = getCollection().get(idStr);
      if (!existing) return null;

      const updated = applyUpdate(collectionName, existing, update);
      getCollection().set(idStr, updated);
      await DemoDataStore.persist(collectionName);

      return DemoDataStore.wrapDoc(collectionName, updated);
    }

    static async findOneAndUpdate(query = {}, update = {}, options = {}) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.findOneAndUpdate(query, update, options);
      }

      const all = Array.from(getCollection().values());
      const existing = all.find((doc) => matchesFilter(doc, query));
      if (!existing) return null;

      const idStr = existing._id.toString();
      const updated = applyUpdate(collectionName, existing, update);
      getCollection().set(idStr, updated);
      await DemoDataStore.persist(collectionName);

      return DemoDataStore.wrapDoc(collectionName, updated);
    }

    static async findByIdAndDelete(id) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.findByIdAndDelete(id);
      }

      if (!id) return null;
      const idStr = id.toString();
      const existing = getCollection().get(idStr);
      if (!existing) return null;

      getCollection().delete(idStr);
      await DemoDataStore.persist(collectionName);
      return DemoDataStore.wrapDoc(collectionName, existing);
    }

    static async findOneAndDelete(query = {}) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.findOneAndDelete(query);
      }

      const all = Array.from(getCollection().values());
      const existing = all.find((doc) => matchesFilter(doc, query));
      if (!existing) return null;

      const idStr = existing._id.toString();
      getCollection().delete(idStr);
      await DemoDataStore.persist(collectionName);
      return DemoDataStore.wrapDoc(collectionName, existing);
    }

    static async deleteOne(query = {}) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.deleteOne(query);
      }

      const all = Array.from(getCollection().values());
      const existing = all.find((doc) => matchesFilter(doc, query));
      if (existing) {
        getCollection().delete(existing._id.toString());
        await DemoDataStore.persist(collectionName);
        return { acknowledged: true, deletedCount: 1 };
      }
      return { acknowledged: true, deletedCount: 0 };
    }

    static async deleteMany(query = {}) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.deleteMany(query);
      }

      const all = Array.from(getCollection().values());
      const matching = all.filter((doc) => matchesFilter(doc, query));
      for (const doc of matching) {
        getCollection().delete(doc._id.toString());
      }
      await DemoDataStore.persist(collectionName);
      return { acknowledged: true, deletedCount: matching.length };
    }

    static async insertMany(docs = []) {
      if (!isDemoMode() && MongooseModel) {
        return await MongooseModel.insertMany(docs);
      }

      const results = [];
      for (const item of docs) {
        const id = item._id ? item._id.toString() : generateId();
        const now = new Date().toISOString();
        const doc = {
          ...item,
          _id: id,
          createdAt: item.createdAt || now,
          updatedAt: now
        };
        if (collectionName === 'courses' || collectionName === 'assessments') {
        if (doc.isActive === undefined) doc.isActive = true;
      }

      if (collectionName === 'assessmentResults') {
        if (!doc.status) doc.status = 'completed';
      }

      getCollection().set(id, doc);
        results.push(DemoDataStore.wrapDoc(collectionName, doc));
      }
      await DemoDataStore.persist(collectionName);
      return results;
    }
  }

  // Preserve schema reference if provided
  if (MongooseModel && MongooseModel.schema) {
    RepositoryModel.schema = MongooseModel.schema;
  }

  return RepositoryModel;
}

/**
 * Applies updates to a document supporting $set, $push, $pull, $inc, $addToSet operators
 */
function applyUpdate(collectionName, doc, update) {
  const result = JSON.parse(JSON.stringify(doc));
  result.updatedAt = new Date().toISOString();

  // If update is plain object without operators
  const isOperatorUpdate = Object.keys(update).some((k) => k.startsWith('$'));

  if (!isOperatorUpdate) {
    Object.assign(result, update);
    return result;
  }

  // $set operator
  if (update.$set) {
    for (const [key, val] of Object.entries(update.$set)) {
      if (key.includes('.')) {
        const parts = key.split('.');
        let curr = result;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = val;
      } else {
        result[key] = val;
      }
    }
  }

  // $push operator
  if (update.$push) {
    for (const [key, val] of Object.entries(update.$push)) {
      if (!Array.isArray(result[key])) result[key] = [];
      const itemToPush = typeof val === 'object' && val !== null ? { ...val } : val;
      if (typeof itemToPush === 'object' && itemToPush !== null && !itemToPush._id) {
        itemToPush._id = generateId();
      }
      result[key].push(itemToPush);
    }
  }

  // $addToSet operator
  if (update.$addToSet) {
    for (const [key, val] of Object.entries(update.$addToSet)) {
      if (!Array.isArray(result[key])) result[key] = [];
      const valStr = val && val.toString ? val.toString() : String(val);
      const exists = result[key].some((x) => (x && x.toString ? x.toString() : String(x)) === valStr);
      if (!exists) {
        result[key].push(val);
      }
    }
  }

  // $pull operator
  if (update.$pull) {
    for (const [key, cond] of Object.entries(update.$pull)) {
      if (Array.isArray(result[key])) {
        if (typeof cond === 'object' && cond !== null) {
          result[key] = result[key].filter((item) => !matchesFilter(item, cond));
        } else {
          result[key] = result[key].filter((item) => String(item) !== String(cond));
        }
      }
    }
  }

  // $inc operator
  if (update.$inc) {
    for (const [key, amount] of Object.entries(update.$inc)) {
      result[key] = (Number(result[key]) || 0) + Number(amount);
    }
  }

  return result;
}

module.exports = createRepository;
