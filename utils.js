export const sendError = (status, message, res, err) => {
  if (err) console.log(err);
  else console.error(message);
  res.type("text/plain").status(status).send(message);
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
