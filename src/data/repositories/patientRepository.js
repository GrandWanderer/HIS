function createPatientRepository(db) {
  return {
    create(patient) {
      db.patients.push({ id: db.patients.length + 1, ...patient });
      return db.patients[db.patients.length - 1];
    },
    getByPhone(phone) {
      return db.patients.find((p) => p.phone === phone) || null;
    },
  };
}

module.exports = { createPatientRepository };
