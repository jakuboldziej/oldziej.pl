const isAdmin = (authUser) => authUser?.role === "admin";

const isSelfOrAdmin = (authUser, displayName) =>
  isAdmin(authUser) || (!!displayName && authUser?.displayName === displayName);

const isSelfOrAdminById = (authUser, userId) =>
  isAdmin(authUser) || (!!userId && authUser?._id?.toString() === userId.toString());

const requireAdmin = (req, res, next) => {
  if (!isAdmin(res.authUser)) {
    return res.status(403).send({ message: "Admin privileges required." });
  }
  next();
};

module.exports = { isAdmin, isSelfOrAdmin, isSelfOrAdminById, requireAdmin };
