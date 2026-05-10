# TaskFlow AI - Project Management SaaS

TaskFlow AI is a modern, collaborative Project Management SaaS application built for high-performance teams. It features a stunning, premium interface, role-based access control, and real-time task management using Firebase Firestore.

## Features

- **Role-Based Access Control:** Separate experiences for "Admin" and "Member" roles.
  - **Admins** can create projects, assign tasks, and manage the team directory.
  - **Members** can view their assigned tasks and update statuses.
- **Kanban Task Board:** Interactive drag-and-drop board to manage tasks across "To Do", "In Progress", and "Completed".
- **Smart Dashboard:** Real-time completion rates, dynamic progress bars, and automatic overdue task indicators.
- **Secure Authentication:** Email/Password and Google OAuth sign-in integration.
- **Premium UI/UX:** Built with a glassmorphic aesthetic, custom Toast notifications, and automatic Dark/Light mode support.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Vanilla CSS Modules with a custom Design System
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory and add your Firebase credentials (see Vercel Deployment section below for the required keys).

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

