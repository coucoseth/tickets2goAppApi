const pool = require('../middleware/db');

exports.subscribe = async (req, res, next) => {
  const { email } = req.body;

  try {
    const sql = 'INSERT INTO waitlist_subscriptions (email) VALUES (LOWER(?))';
    await pool.execute(sql, [email]);
    // pool.release();
    return res
      .status(201)
      .json({ success: true, message: 'You have been added to the waitlist.' });
  } catch (err) {
    // Duplicate email -> idempotent success (keep frontend logic simple)
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res
        .status(200)
        .json({ success: true, message: 'Email already added.' });
    }
    return next(err);
  }
};
