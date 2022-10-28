require('dotenv').config();

module.exports = function(email, token) {
    return {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Access recovery',
        html: `
        <h1>Did you forget your password?</h1>
        <p>If you remember your password, just miss this mail.</p>
        <p>Otherwise, click the link below:</p>
        <p><a href="${process.env.BASE_URL}/auth/password/${token}">Reset password</a></p>
        <hr />
        <a href="${process.env.BASE_URL}">Click here to enter Courses Shop</a>
        `
      }
};