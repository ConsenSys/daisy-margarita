/** The default */
exports.NotStarted = "NOT_STARTED"; // eslint-disable-line no-unused-vars
/** When it's created and sent to the blockchain. */
exports.Pending = "PENDING"; // eslint-disable-line no-unused-vars
/** Accepted and started and it's active at this moment. */
exports.Active = "ACTIVE"; // eslint-disable-line no-unused-vars
/** Like `Active` but on the last billing period. */
exports.ActiveCancelled = "ACTIVE_CANCELLED"; // eslint-disable-line no-unused-vars
/** Not executable anymore; probably ran out of funds */
exports.Cancelled = "CANCELLED"; // eslint-disable-line no-unused-vars
/** Not executable anymore because the time-span defined by the user was met. */
exports.Expired = "EXPIRED"; // eslint-disable-line no-unused-vars
/** Invalid in blockchain */
exports.Invalid = "INVALID"; // eslint-disable-line no-unused-vars
/** Ran out of funds */
exports.NotEnoughFunds = "NOT_ENOUGH_FUNDS"; // eslint-disable-line no-unused-vars
/** Failed to be `Created`; should retry. */
exports.Failed = "FAILED"; // eslint-disable-line no-unused-vars
