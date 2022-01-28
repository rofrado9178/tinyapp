const searchUserByEmail = (email, database) => {
  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return false;
};

module.exports = searchUserByEmail;
