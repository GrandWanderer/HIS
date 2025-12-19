function createInMemoryDb() {
  return {
    patients: [],
    appointments: [],
    payments: [],
    audit: [],
  };
}

module.exports = { createInMemoryDb };
