// Backend error codes → messages for the user. Unknown codes fall back to the backend's message.
const messages = {
  BACKEND_UNREACHABLE: "Smart Space is still starting. Try again in a moment.",
  WORKSPACE_PATH_INVALID: null, // the backend's message explains what is wrong with the folder
  DISK_FULL: "There is not enough free disk space for this download.",
};

/** @param {unknown} err */
export function errorMessage(err) {
  if (!err) return "";
  return messages[err.code] ?? err.message ?? "Something went wrong.";
}
