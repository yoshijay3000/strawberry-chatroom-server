let users = [];

function addUser(id, name, room) {
  // check that the user is not already in room
  const check = users.find(
    (element) => element.name === name && element.room === room
  );

  if (check) {
    throw new Error("Name already taken! Please use another!");
  }

  users.push({ id, name, room });
}

function removeUser(id) {
  users = users.filter((element) => element.id !== id);
}

function getUserData(id) {
  return users.find((element) => element.id === id);
}

function getUsersInRoom(room) {
  let arr = [];
  for (let item of users) {
    if (item.room === room) {
      arr.push(item.name);
    }
  }

  return arr;
}

module.exports = { addUser, removeUser, getUserData, getUsersInRoom };
