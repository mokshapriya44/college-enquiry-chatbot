# ABC College Enquiry Chatbot — Updated Project

This version keeps the existing React + Vite frontend, Node.js + Express backend, MySQL database, and chatbot. It adds separate student/admin login flows, role-based navigation, protected routes, student enquiries, and an admin dashboard.

## 1. Project flow

### Home page
- Student Login
- Admin Login
- College banner image

### Student login
Navbar: `Chatbot | Enquiry Form | Logout`

Students can register, log in, use the chatbot, submit enquiries, and view their own enquiry statuses.

### Admin login
Navbar: `Dashboard | Courses | Enquiry Details | Logout`

Admins can view dashboard counts, add/edit/delete courses, view all student enquiries, and update enquiry statuses.

A student cannot open admin pages by typing an admin URL. The React route guard blocks the page, and the Express API independently checks the JWT role. Changing localStorage or manually calling an API does not grant admin permission.

## 2. Database setup

1. Open MySQL Workbench.
2. Run the complete `database.sql` file.
3. If your existing `college_chatbot` database already has `students`, `courses`, `bot_responses`, and `chat_history`, this script keeps those tables and creates the new `admins` and `enquiries` tables if they do not exist.
4. Existing sample courses are inserted only if they do not already exist.

## 3. Backend setup

Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and update your MySQL password and secrets:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_chatbot
JWT_SECRET=use_a_long_random_secret_here
JWT_EXPIRES_IN=1d
ADMIN_NAME=ABC College Admin
ADMIN_EMAIL=admin@abccollege.com
ADMIN_PASSWORD=ChangeThisAdminPassword123
GEMINI_API_KEY=your_gemini_api_key
```

Do not share or upload `.env` to GitHub.

Create the first admin account (run once, from the backend folder):

```bash
node createAdmin.js
```

This creates an admin record with a bcrypt-hashed password. It does not create an admin registration page, so students cannot register themselves as admins.

Start backend:

```bash
npm run dev
```

Backend URL: `http://localhost:3000`

## 4. Frontend setup

Open another terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## 5. Test accounts and flow

1. Open the home page.
2. Choose Student Login. If you do not have a student account, use the Register link first.
3. Student navbar should show only Chatbot, Enquiry Form, Logout.
4. Submit an enquiry from Enquiry Form.
5. Logout and choose Admin Login.
6. Login with the admin email/password configured in `.env`.
7. Admin navbar should show Dashboard, Courses, Enquiry Details, Logout.
8. In Enquiry Details, update the enquiry status.
9. Login as student again and verify the updated status appears in My Enquiries.
10. While logged in as student, try `/admin/dashboard` and `/admin/enquiries`. The frontend redirects the student. Admin APIs also return HTTP 403 for a student token.

## 6. Chatbot notes

- Course names, fees, and durations are read from the MySQL `courses` table, so changes made by the admin are reflected in course-related chatbot answers.
- Other predefined answers are read from `bot_responses`.
- If a `GEMINI_API_KEY` is configured, Gemini is used for questions not answered from MySQL. If no key is configured, the chatbot returns its built-in college enquiry guidance.
- Ollama is not used in this updated version.

## 7. Main added/updated files

Backend:
- `Middleware/authMiddleware.js` — JWT verification and role authorization
- `Controller/adminController.js` — admin login
- `Controller/enquiryController.js` — student/admin enquiry operations and dashboard stats
- `Router/adminRouter.js`, `Router/enquiryRouter.js`
- `createAdmin.js` — securely create the initial admin account

Frontend:
- `App.jsx` — role-based navbars and protected routes
- `pages/AdminLogin.jsx`
- `pages/AdminDashboard.jsx`
- `pages/EnquiryForm.jsx`
- `pages/EnquiryDetails.jsx`

## Important security note

The admin login option is visible on the public home page, but admin access is granted only to an account stored in the `admins` table. Do not add a public admin registration endpoint. Keep `.env` private.
