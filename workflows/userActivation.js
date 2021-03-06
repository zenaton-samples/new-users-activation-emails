module.exports = {
  *handle(user) {
    // to be used in `onEvent` function
    this.user = user

    // Waiting for ACTIVATION_WAIT_1 seconds
    yield this.wait.for(1 * process.env.ACTIVATION_WAIT_1);

    // If user does not activate within time frame, 
   //send an email to propose to read the docs
    yield this.run.task('SendEmail', {
      to: user.email,
      subject: 'Need some help?',
      content: 'Look at our documentation...'
    })

    // Waiting for ACTIVATION_WAIT_2 seconds
    yield this.wait.for(1 * process.env.ACTIVATION_WAIT_2);

    // If user does not activate within time frame, 
   //send an email to propose to setup a call
    yield this.run.task('SendEmail', {
      to: user.email,
      subject: 'Happy to discuss',
      content: 'Please setup a call...'
    });

    // Waiting for ACTIVATION_WAIT_3 seconds
    yield this.wait.for(1 * process.env.ACTIVATION_WAIT_3);

    // If user does not activate,
   // send an email to ask for feedback
    yield this.run.task('SendEmail', {
      to: user.email,
      subject: 'What did happen?',
      content: 'Please tell us what we can change...'
    });
  },
  *onEvent(name, ...data) {
    if (name === "userActivated") {
      // Send an email to congratulate the user and give him resources for real examples.
      this.run.task('SlackUserActivated', `${this.user.email} is actived :)`);

      // Send an email to congratulate the user and offer resources for next steps.
      this.run.task('SendEmail', {
        to: this.user.email,
        subject: 'Congrats!',
        content: 'Look at our advanced examples...'
      })

      // Terminate the workflow to prevend sending more emails
      this.terminate();
    }
  }
};
