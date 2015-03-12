module.exports = {
  sendError: sendError,

  sendUnexpectedError: function(res, err) {
    return sendError(500, 'An unexpected error occurred.', res, err);
  }
};

function sendError(status, message, res, err) {
  if (err) {
    console.error(err);
  } else {
    console.error(message);
  }
  res.type('text/plain').status(status).send(message);
}
