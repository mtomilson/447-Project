## React TypeScript website created using Vite. 
- This is an inventory management system for a construction company

## Installations
- If you don't have node.js, install it [here](https://nodejs.org/en/download)

## Helpful VS Code extensions
- TailwindCSS Intellisense
- ES7 React 
- Prettier
- Thunderbolt

## How to Run
- Clone repository
- npm install
- copy .env files 
- npm run dev // starts both the server and the website cocurrently

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

---

# Workflow

---

## 1. Project Setup
| Task |
|------| 
| Create Vite + React + TypeScript project |
| TailwindCSS, Supabase, Express.js installed |

---

## 2. Authentication

| Task |
|------| 
| Login Page UI |
| Login API route on backend |
| Login Error Message Display |
| Redirect after login based on user role |
| Logout button |

---

## 3. Navigation
| Task |
|------|
| Navigation bar |
| Role-based navigation |
| Profile page |

---

## 4. Page: Jobsite Logistics Role
| Task | 
|------|
| Submit new material request form |
| View my requests list |
| Confirm delivery (mark as delivered) |
| View inventory for in their location |

---

## 5. Pages: Warehouse Logistics Role
| Task |
|------|
| Log a delivery (upload packing slip photo) |
| Mark request as shipped |
| View shipments |
| View inventory for warehouse |

---

## 6. Pages: Project Manager Role
| Task |
|------|
| Approve or deny material requests |
| View all inventory across locations |
| View audit log |
| Create new job site |
| Manage job sites (edit/archive) |
| View reports |
| Create and view pay orders |

---

## 7. Pages: System Administrator Role
| Task | 
|------|
| View all users | 
| Create new user | 
| Edit / deactivate existing user | 
| View all locations |
| Update location details |
| View inventory |
| View audit log |
| Manage inventory | 
