const { assert } = require("chai");

const getUserByEmail = require("../helper");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user id with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it("should return undefine if email is not valid", function () {
    const user = getUserByEmail("user@exampleaa.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

  it("should return a user email with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "user@example.com";
    assert.deepEqual(user.email, expectedUserID);
  });
});

console.log(getUserByEmail("user@exampleaa.com", testUsers));
