require('dotenv').config()

module.exports = function(email) {
    return {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Account has been created',
        html: `
        <h1>Welcome to our shop!</h1>
        <p>You have successfully created an account.</p>
        <hr />
        <a href="${process.env.BASE_URL}">Click here to enter Courses Shop</a>
        `
      }
};