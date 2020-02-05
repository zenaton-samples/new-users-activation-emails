module.exports.handle = function* (user) {
  // Waiting for user activation, not more than ACTIVATION_WAIT_1 seconds
  yield* this.waitActivation(user, 1 * process.env.ACTIVATION_WAIT_1);

  // If event not received, send an email to propose to read the docs
  this.run.task('SendEmail', {
    to: user.email,
    subject: 'Need some help?',
    content: 'Look at our documentation...'
  })

  // Then wait for user activation, not more than ACTIVATION_WAIT_2 seconds
  yield* this.waitActivation(user, 1 * process.env.ACTIVATION_WAIT_2);

  // If event not received, send an email to propose to setup a call
  this.run.task('SendEmail', {
    to: user.email,
    subject: 'Happy to discuss',
    content: 'Please setup a call...'
  });

  // Still waiting for user activation, not more than ACTIVATION_WAIT_3 seconds
  yield* this.waitActivation(user, 1 * process.env.ACTIVATION_WAIT_3);

  // If event not received, send an email to ask for feedback
  this.run.task('SendEmail', {
    to: user.email,
    subject: 'What did happen?',
    content: 'Please tell us what we can change...'
  });
}

module.exports.waitActivation = function* (user, duration) {
  // wait for activation
  const event = yield this.wait.event("userActivated").for(duration);

  // user activated!
  if (event) {
    // Send an email to congratulate the user and give him resources for real examples.
    this.run.task('SlackUserActivated', `${user.email} is actived :)`);

    // Send an email to congratulate the user and give him resources for real examples.
    yield this.run.task('SendEmail', {
      to: user.email,
      subject: 'Congrats!',
      content: 'Look at our advanced examples ...'
    })
    
    // workflow ends
    yield this.terminate();
  }
}

