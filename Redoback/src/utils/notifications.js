const Notification = require("../models/Notification");

exports.notifyUser = async (user, title, message, link = "") => {
  if (!user) return null;

  return Notification.create({
    user,
    title,
    message,
    link,
  });
};

exports.notifyMany = async (users, title, message, link = "") => {
  const uniqueUsers = [...new Set(users.filter(Boolean).map(String))];
  if (!uniqueUsers.length) return [];

  return Notification.insertMany(
    uniqueUsers.map((user) => ({
      user,
      title,
      message,
      link,
    }))
  );
};
