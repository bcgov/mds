## Frontend Refactor: 

### What's Changing? 

- NPM -> YARN 
- Monorepo Setup 
- Introduce Common package 
- Common packge builds

### How is my local development flow changing? 

Based on the discord survey looks like 80% or more of the team is doing local development for FE since it's faster. 

So for the first cut of upgrades, only the local development on the host machine is being focused on.

- Run `make valid` on the host machine to make sure you have YARN and Node in the right versions. 
- Use the prompts to install YARN if your host machine does not have the right setup 
- Run `make env` to update the environment variables. 


#### Workflow: 

Nothing huge has changed, but here is a quick explanation on how to work with yarn monorepo. 

1. Delete any existing `node_modules` in minespace, core-web, root of the repo etc.
2. Run `yarn` command on the root of the repo. This will use the monorepo `yarn.lock` to install dependencies. Any new dependencies you want to add use yarn workspaces command
3.  Running `yarn` on the root of the repo will hoist `node_modules` to the root of the repo with very few dependencies inside the services folders. 
4.  Open a new terminal, run `cd services/common` and run `yarn watch`. This will watch any changes to the common package. 
5.  Open new terminals for `minespace` and `core-web` respectively and run `yarn serve` for local development.