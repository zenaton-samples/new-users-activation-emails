// load .env
require('dotenv').config();

// load dependencies
const { workflow, task } = require('zenaton');

// define tasks
task("SendEmail", require("./tasks/sendEmail"));
task("SlackUserActivated", require("./tasks/slackUserActivated"));

// define workflows
workflow("UserActivation", require("./workflows/userActivation"));

