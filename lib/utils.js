module.exports = {
  sendError: sendError,

  sendUnexpectedError: function(res) {
    return sendError(500, 'An unexpected error occurred.', res);
  }
};

function sendError(status, message, res) {
  console.error(message);
  res.type('text/plain').status(status).send(message);
}
