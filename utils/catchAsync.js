module.exports = (fn) => (req, res, next) => {
  // propgate async promise rejection error to middleware error handler
  fn(req, res, next).catch((err) => next(err));
};
