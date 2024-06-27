# About

**SG Decoding Web Portal** provides transcribing (speech-to-text) services for users. Features include live transcribing and transcribing of uploaded audio files. The frontend project is built with the following:

1. [React](https://reactjs.org/docs/getting-started.html)
2. [Semantic UI as Styling Library](https://react.semantic-ui.com/)
3. [React-Redux for state management](https://react-redux.js.org/introduction/getting-started)
4. [TypeScript](https://www.typescriptlang.org/)
5. Additional helper libs specified in _package.json_


The backend is built with the following:

1. [Node/ExpressJs for API server](https://expressjs.com/)
2. Additional helper libs specified in _package.json_


# Set up .Env Files

Prior to running the project, please set up these .env files. Don't push these files as you may add sensitive values in future development like API keys.

**./backend/.env/**
```text
DB_CONNECTION_STRING=mongodb://localhost:27017/SG_Decoding
LIVE_TRANSCRIBE_QUOTA=60
OFFLINE_TRANSCRIBE_QUOTA=60
```
 

**./frontend/.env.development.local**
```text
FAST_REFRESH=false
REACT_APP_API="http://localhost:2000"
REACT_APP_LIVE_WSS="ws://localhost:8080/client/ws/speech"
```

**./frontend/.env.production.local**

```text
REACT_APP_API="/api"
REACT_APP_LIVE_WSS="wss://sgdecoding.speechlab.sg/wslive/client/ws/speech"
```

**./frontend/cypress.env.json**
```text
{
	"url_to_visit": "http://localhost:3000",
	"testuserEmail": <Create Another Account yourself>,
	"testuserPassword": <Create Another Account yourself>,
	"testuserNewPassword": <Create Another Test Account yourself>
}
```


# Running Locally
```text
// Frontend
cd frontend
npm i
npm run start

// Backend
cd backend
npm i
node server.js

// Alternative for backend with nodemon (restarts node server when file changes)
cd backend && npm run dev
```

# Building and running Docker containers

```text

// Building the Docker containers
sudo docker-compose build --no-cache

// Running Docker containers
sudo docker-compose up -d
```
- "sudo" is not needed if running on Windows

# Testing

For the frontend

- Unit and integration tests are built with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

- End-to-End tests are built with [Cypress](https://docs.cypress.io).

Due to time constraints, limited test cases were written and could be expanded upon in future development.

## Running Frontend Tests

```
// Unit/Integration

cd frontend && npm run test

// End-to-End
cd frontend && npm run cypress:open

```

# Documentation

Documentation for this project can be found in our FYP reports as hyperlinked:
- [THZ's FYP report](https://hdl.handle.net/10356/157669)
- [Terry's FYP report](https://hdl.handle.net/10356/157441) 

## Speech Gateway Docs

The API documentation for Speech Gateway can be found in this [gitbook](https://speech-ntu.gitbook.io/speech-gateway/).

# nvm version
use nvm 16

# Backend URL
backend URL is specified in SGDecoding-Speech2Text-Portal/frontend/src/api/api.ts

---

# Deploy application to AWS
Reference : https://aws.amazon.com/blogs/containers/deploy-applications-on-amazon-ecs-using-docker-compose/

1. Create AWS ECS context
```
docker context create ecs myecscontext
```

2. Check if AWS ECS context is created
```
docker context ls
```

3. Switch to AWS ECS context

```
docker context use myecscontext
```

4. Provision resources

```
docker-compose -f docker-compose.production.yml up
```

Application is deployed


*Last updated 8 May 2023*

