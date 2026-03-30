## React TypeScript website created using Vite. 
- This is an inventory management system for a construction company

## Installations
- If you don't have node.js, install it [here](https://nodejs.org/en/download)

## Helpful VS Code extensions
- TailwindCSS Intellisense
- ES7 React 
- Prettier 

## How to Run
- Clone repository
- npm install
- copy .env files 
- npm run dev // starts the website (frontend)
- npm run server // starts the express server

## Code pipeline 
* Everytime a change is made to the codebase, create a new branch before committing the change. Branch should be named after the Jira ticket, for example "git branch Scrum-114"
* Create pull requests after small successes, helps reduce merge conflicts in the long run. Merge to main once pull request is approved by MINIMUM one other developer.

* Delete branch once entire task is done. 

## Pull Requests
* Title pull requests using meaningful names use one of the following prefixes for each pull request followed by a description
   - fix: description (used when fixing something like a bug)
   - chore: description (used for maintenance work)
   - feat: description (used when adding a new feature)
   - docs: description (used when updating docs)
   - test: description (used when adding test cases)
* Add images/screenshots of what you added and changed and explain what you did and why.

## Important Commands
- If at any point the database structure is changed in any way, rerun the following command. This will update the supabase.ts file to update the types.
- npx supabase gen types typescript --project-id athaftfgyhpyzqlqtzhe > src/types/supabase.ts
