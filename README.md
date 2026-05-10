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

## Vercel Deployment

This project is fully ready to be deployed on Vercel. 

### Environment Variables
When importing the repository into Vercel, you must add the following Environment Variables in the Vercel Dashboard before clicking Deploy:

**Firebase Client Config (Required for Web SDK):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Firebase Admin SDK (Required for Server-Side Verification):**
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` 
  *(Note: When pasting the private key in Vercel, include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` exactly as they appear in your service account JSON file. The application automatically formats newline characters).*

### Deployment Steps
1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `taskflow-ai` GitHub repository.
4. Open the **Environment Variables** section and paste the keys listed above.
5. Click **Deploy**. Vercel will automatically build the Next.js app and deploy your live URL.
