// Shared 500 handler.
//
// Security: the old code returned raw MySQL error objects in ~15
// places — `res.status(500).json(err)` leaks sqlMessage, the SQL text
// and table/column names to any caller. Every route now calls this
// helper instead: the error is logged server-side (where it belongs)
// and the client gets one generic message that reveals nothing.
function handleServerError(res, err) {
  console.error(err);
  return res.status(500).json({ status: "error", message: "Something went wrong" });
}

module.exports = { handleServerError };
