function normalizeEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return null;
  }
  return email.trim().toLowerCase();
}

function validateUserPlan(userPlan) {
  if (!userPlan || typeof userPlan !== 'string' || userPlan.trim().length < 3) {
    return null;
  }
  return userPlan.trim();
}

module.exports = { normalizeEmail, validateUserPlan };