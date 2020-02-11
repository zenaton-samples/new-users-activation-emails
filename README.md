# Nurturing A Non-Activated User 

## Overview
Here is a sample Zenaton project that sends a sequence of emails to a new user if they have not completed a designated activation 'event' within an application.  This might be installing something or completing a task or creating their first project. 

A workflow instance would be dispatched for the user when they register and then immediately start a series of 'wait' steps in which the workflow waits for a designated time for the user to complete the activation.  After each wait, if the event has not been received, the workflow triggers a step that sends an email offering help. 

If the user completes the activation event, then we send a congratulatory email and send an internal slack message to notify the team.  

Note: the task that sends emails is fake but can easily be coded using the API of your preferred email provider.

## Requirements
A [Zenaton](https://www.zenaton.com/) account, API id and API key

## Workflow logic

Step by step, the workflow logic is:

- wait for ACTIVATION_WAIT_1 seconds
- send an email about documentation
- wait for ACTIVATION_WAIT_2 seconds
- send an email proposing to setup a call
- wait for ACTIVATION_WAIT_3 seconds
- send an email asking for feedback

If a "userActivated" event is received:
- send a message to Slack
- send an email suggesting advanced examples
- terminate the workflow.

This flowchart shows a visual representation of the workflow tasks.

![Workflow chart](/doc/images/user-activation.png)

Notes:
- process.env.ACTIVATION_WAIT_n is multiplied by 1 to convert a string to an integer
- in `onEvent` function, the tasks are run without yield (in background) - this is to terminate the workflow immediately. 

## Development

The `boot.js` file is where you tell the Zenaton Agent where to find - by name - the source code of your tasks and workflows.

> If you add a task or a workflow to this project, do not forget to update the `boot.js` file.

Look at Zenaton documentation to learn how to implement [workflows](https://docs.zenaton.com/workflows/implementation/) and [tasks](https://docs.zenaton.com/tasks/implementation/).

## Run 

A workflow or Zenaton task can be run from within any application using the [Zenaton API](https://docs.zenaton.com/client/graphql-api/). They will be processed as soon as you run this project.

> Note: tasks and workflows are dispatched in an environment (`AppEnv`) of your Zenaton application (`AppId`). They will be processed by this project, **if** you setup it with the same `AppId` and `AppEnv`. You must also provide an `Api Token` to authorize access to this application (found at https://app.zenaton.com/api)

### Run Locally
First, install dependencies:
```
npm install
```
then, fill-in `ZENATON_APP_ID` and `ZENATON_API_TOKEN` in the `.env` file.

Install a Zenaton Agent:
````sh
curl https://install.zenaton.com | sh
````
and run it:
````sh
zenaton listen --boot=boot.js
````

### Run in Docker

Create your `.env` file
```
cp -n .env.sample .env
```
and fill-in `ZENATON_APP_ID` and `ZENATON_API_TOKEN` in it.

Then start your container:
```
cd docker && docker-compose up
```

### Run on Heroku

Follow this button [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy), then fill in the env variables and click "deploy".

### Run on other hosting solutions

Check our [documentation](https://docs.zenaton.com/going-to-production/) for more options (AWS, Google Cloud, Clever Cloud ...)

### Checking that your project is running
Whatever your installation method, you should see that a new Agent is listening from this url: https://app.zenaton.com/agents (if you do not see it, please check again that you have selected the right application and environment).

## Dispatching Tasks and Workflows

### Using Zenaton API 
Tasks and workflows can be dispatched by name from everywhere using the [Zenaton API](https://docs.zenaton.com/client/graphql-api/) or our [Node.js SDK](https://github.com/zenaton/zenaton-node).

You can test it from your command line interface:

Dispatching a "UserActivation" workflow: 

````bash
curl -X POST https://gateway.zenaton.com/graphql \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <API_TOKEN> \
  -d '{"query":"mutation($input: DispatchWorkflowInput!) { dispatchWorkflow(input: $input) { id } }","variables":{"input":{"appId":"<APP_ID>","environment":"dev","name":"UserActivation","input":"[{\"email\":\"foo@example.com\"}]"}}}'
````

> Do not forget to replace `<APP_ID>` and `<API_TOKEN>` by your Zenaton AppId and api token. 

Sending a "userActivated" event to this workflow: 
````bash
curl -X POST https://gateway.zenaton.com/graphql \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <API_TOKEN> \
  -d '{"query":"mutation($input: SendEventToWorkflowsInput!) { sendEventToWorkflows(input: $input) { status } }","variables":{"input":{"appId":"<APP_ID>","environment":"dev","name":"userActivated","data":"[]","selector":{"id":"<WORKFLOW_ID>"}}}}'
````

> Do not forget to replace `<APP_ID>` and `<API_TOKEN>` by your Zenaton AppId and api token. And <WORKFLOW_ID> by your workflow's id that you have received when dispatched.

### Example App 

We have provided an [example app](https://github.com/zenaton/nodejs-example-app) with basic UI to dispatch workflows and events with associated data to your Zenaton project. After installation, you can (optionaly) add your workflows and some examples of input and event in the `public/config.json` file. eg.
````json
{
  "workflows": [
    {
      "name": "UserActivation",
      "input": [ {"email": "john.doe@gmail.com"}],
      "event": { "name": "userActivated", "data": []},
    }
  ]
} 
````
> You need to rebuild your example app after having modified this file. If you prefer, you can update directly `dist/config.json` and simply reload the page - but your changes will be lost at the next rebuild.

## Monitoring Tasks and Workflows Processing

Look at your [dashboard](https://app.zenaton.com/workflows/) (if you do not see your dispatched tasks or workflows, please check that you have selected the right application and environment).
