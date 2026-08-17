# Murqib AI


**A startup monitoring and incubation management platform that helps founders track execution progress and enables incubators to monitor startup plans, milestones, and deliverables.**


🔗 **Live Demo:** https://murqibai.vercel.app/


---


## Overview


Startup incubators often need a structured way to follow the progress of the startups they support, while founders need a clear view of their plans, milestones, deliverables, and execution status.


**Murqib AI** was developed as a digital platform that connects both sides of this process.


The platform provides founders with a workspace to manage their startup profile, execution plan, milestones, and deliverables, while incubator administrators can monitor startup progress through a dedicated dashboard.


---


## Key Features


- 👤 **Founder Workspace**  
  Founders can manage their startup profile, development stage, plans, milestones, and deliverables.


- 📊 **Incubator Dashboard**  
  Administrators can monitor startups and review their progress from a centralized dashboard.


- 🗓️ **Milestones & Deliverables**  
  Tracks upcoming milestones, deadlines, deliverable status, and execution progress.


- 🔐 **Role-Based Access**  
  Separates founder and incubator-admin experiences with dedicated permissions.


- 🗄️ **Structured Startup Data**  
  Stores startup profiles, plans, members, milestones, and deliverables using a relational data model.


- 🛡️ **Row-Level Security**  
  Uses Supabase RLS so founders access their own startup data while incubator administrators can access startups under their incubator.


---


## How It Works


The platform supports two primary user journeys:


### Founder


1. The founder signs in to the platform.
2. The system identifies the user as a startup member.
3. The founder accesses their startup workspace.
4. They can view or update their startup profile and execution plan.
5. Deliverables can be added, updated, tracked, or removed.
6. Upcoming milestones and progress are surfaced in the founder dashboard.


### Incubator Admin


1. The administrator signs in.
2. The system identifies the user as an incubator administrator.
3. The administrator accesses the incubator dashboard.
4. They can review startups associated with their incubator.
5. Startup plans, milestones, and deliverables can be viewed for monitoring purposes.


---


## Tech Stack


- **Framework:** Next.js 14
- **Frontend:** React
- **Language:** TypeScript
- **Backend / Database:** Supabase
- **Database:** PostgreSQL
- **Authentication & Session Handling:** Supabase SSR
- **Authorization:** Row-Level Security (RLS)
- **Deployment:** Vercel
- **Version Control:** Git & GitHub


---


## Data Model


The platform includes several core entities:


- `startups` — startup information, type, stage, and description
Running Locally

Clone the repository:

git clone https://github.com/Layan-Alghymah/Marqibai.git
cd Marqibai

Install dependencies:

npm install

Create a .env.local file and add:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Run the development server:

npm run dev

Then open:

http://localhost:3000
What I Worked On

This project gave me hands-on experience in building a multi-role web platform around a real startup-incubation workflow.

My work included:

Structuring the platform around founder and incubator-admin journeys.
Working with Next.js and Supabase integration.
Designing relational startup data around plans, milestones, members, and deliverables.
Implementing role-based access patterns and Row-Level Security.
Building and refining dashboard and startup-management workflows.
Deploying and debugging the application on Vercel.
Live Demo

🔗 https://murqibai.vercel.app/

Murqib AI is a prototype. Some functionality may depend on configured Supabase services and environment variables.
