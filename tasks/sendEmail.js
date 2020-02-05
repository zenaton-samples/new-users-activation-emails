module.exports.handle = async function(email) {
  console.log(`sending email to ${email.to}: ${email.content}`);
};