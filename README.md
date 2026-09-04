
LibraryBCA_README.md


📚 LibraryBCA
A full-stack academic file-sharing platform built for BCA students. LibraryBCA allows students to authenticate, upload and discover study material, filter files by category/subject/semester, view/download resources, comment on files, follow subjects, and receive notifications for new uploads.

The project is designed as a separate React frontend and Flask backend and is ready to be deployed as a frontend + backend web application.

✨ Features
🔐 Authentication
User registration and login

JWT-based authentication

Protected routes for authenticated actions

Password hashing on the backend

📁 File Library
Upload academic resources

Supported categories:

Notes

Assignments

Important Questions

Previous Year Papers

Filter by category, subject, and semester

Search by title, subject, or uploader

Sort by newest, oldest, or alphabetical order

Personal "My Uploads" section

File view and download support

💬 Comments
Add comments to uploaded files

View comments and comment authors

Comments are associated with individual files

🔔 Notifications & Following
Follow subjects

Receive notifications when new resources are uploaded for followed subjects

Notification read/unread state

🎨 Frontend
Responsive React UI

React Router navigation

Reusable UI components

Theme support

Loading, empty, and error states

Modern glass-style visual design

☁️ Cloud Storage
New file uploads are intended to use Cloudinary instead of relying on the backend server's local filesystem.

Cloudinary credentials must remain backend-only and must never be exposed to the React frontend.

🏗️ Tech Stack
Frontend
React 19

Vite 8

React Router 7

Lucide React

CSS3

Oxlint

Backend
Python

Flask 3

Flask-CORS

Flask-JWT-Extended

Flask-SQLAlchemy

SQLAlchemy

Gunicorn

Database
SQLite for local development

SQLAlchemy ORM

File Storage
Cloudinary for cloud-based file storage

Legacy local backend/uploads/ support may be retained for older files during migration

📂 Project Structure
LibraryBCA/
│
├── README.md
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── requirements.txt
│   ├── routes/
│   │   ├── auth.py
│   │   ├── comments.py
│   │   ├── files.py
│   │   ├── follow.py
│   │   └── meta.py
│   ├── uploads/              # Legacy/local storage during migration
│   ├── database.db           # Local SQLite database
│   └── .env                  # Backend secrets - DO NOT COMMIT
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── router/
    │   ├── services/
    │   ├── styles/
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── package.json
    └── .env
🚀 Getting Started
Prerequisites
Install:

Python 3.11+ recommended

Node.js 18+ recommended

npm

A Cloudinary account for cloud file storage

⚙️ Backend Setup
Open a terminal inside the backend directory:

cd backend
1. Create a virtual environment
Windows:

python -m venv venv
venv\Scripts\activate
macOS/Linux:

python3 -m venv venv
source venv/bin/activate
2. Install dependencies
pip install -r requirements.txt
3. Configure environment variables
Create:

backend/.env
Example:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_ORIGIN=http://localhost:5173
If the backend uses a configurable JWT secret, use a strong random value instead of the development placeholder:

JWT_SECRET_KEY=your_long_random_secret
Security: Never commit .env to GitHub. Never put CLOUDINARY_API_SECRET in the frontend .env or in any VITE_* variable.

4. Start the backend
python app.py
The development backend runs on:

http://localhost:5000
Health check:

GET /
💻 Frontend Setup
Open another terminal:

cd frontend
1. Install dependencies
npm install
2. Configure frontend environment
Create/update:

frontend/.env
Example:

VITE_API_BASE_URL=http://localhost:5000
The frontend should contain only public/non-secret configuration.

3. Start the frontend
npm run dev
Vite normally starts the application at:

http://localhost:5173
☁️ Cloudinary Configuration
Cloudinary is used as the remote file-storage layer.

Storage flow
Student
   │
   ▼
React Frontend
   │
   │ multipart/form-data
   ▼
Flask Backend
   │
   ▼
Cloudinary
   │
   ├── secure_url
   ├── public_id
   └── resource information
        │
        ▼
     Database
The database stores metadata such as the original filename and Cloudinary identifiers/URLs, while the actual file is stored in Cloudinary.

Recommended Cloudinary folder:

librarybca/files/
A more organized structure can be used when required:

librarybca/files/<semester>/<subject>/<category>/
Important
Never expose:

CLOUDINARY_API_SECRET
to the browser.

Do not use:

VITE_CLOUDINARY_API_SECRET=...
Cloudinary API operations requiring the secret must be performed by the backend.

📡 Main API Endpoints
Authentication
POST /register
POST /login
Files
POST   /upload
GET    /files
GET    /my-files
GET    /files/<file_id>/view
GET    /files/<file_id>/download
PATCH  /files/<file_id>
DELETE /files/<file_id>
Comments
GET    /files/<file_id>/comments
POST   /files/<file_id>/comments
DELETE /comments/<comment_id>
Follow / Notifications
The backend also provides endpoints for subject following and notifications through the corresponding route modules.

Endpoint details should be treated as implementation-specific and kept synchronized with the route files in backend/routes/.

📄 Supported File Types
The backend currently allows:

.pdf
.doc
.docx
.ppt
.pptx
.png
.jpg
.jpeg
.zip
.txt
File validation is performed on the backend.

🗃️ Database Models
The application currently uses models representing:

User

FileItem

Comment

Follow

Notification

A Cloudinary-backed FileItem should additionally maintain storage metadata such as:

cloudinary_public_id
cloudinary_url
resource_type
Existing records should remain compatible during the migration from local storage to Cloudinary.

🔄 File Lifecycle
Upload
Login
  ↓
Select file
  ↓
Enter metadata
  ↓
POST /upload
  ↓
Backend validates file
  ↓
Upload to Cloudinary
  ↓
Save Cloudinary metadata in database
  ↓
Notify followers
View
File Details
  ↓
GET /files/<id>/view
  ↓
Cloudinary-backed resource
  ↓
Browser preview
Download
Download button
  ↓
GET /files/<id>/download
  ↓
Cloudinary-backed file
  ↓
Browser download
Delete
Delete request
  ↓
Verify file ownership
  ↓
Delete Cloudinary resource
  ↓
Delete database record
  ↓
Delete associated comments through cascade
🧪 Testing Checklist
Before deployment, verify the complete file lifecycle:

User can register

User can log in

Authenticated user can upload a valid file

Invalid file types are rejected

File appears in the library

Search works

Category filter works

Subject filter works

Semester filter works

Sorting works

File preview/view works

File download works

Owner can edit metadata

Non-owner cannot edit the file

Owner can delete the file

Non-owner cannot delete the file

Cloudinary resource is deleted with the file

Comments work

Subject following works

Notifications are generated correctly

Legacy local files do not crash the application during migration

🛡️ Security Checklist
Before production deployment:

Replace development JWT secret with a strong random secret

Store Cloudinary credentials only in backend environment variables

Never commit .env

Never expose CLOUDINARY_API_SECRET

Keep authentication/authorization checks enabled

Validate file extensions on the backend

Use secure filenames for user-visible metadata

Verify file ownership before edit/delete operations

Do not log API secrets or tokens

Configure CORS with the real production frontend URL

Use HTTPS in production

🌐 Deployment on Render
The application can be deployed as two services:

Render
│
├── Frontend Web Service
│     └── React + Vite
│
└── Backend Web Service
      └── Flask + Gunicorn
             │
             ├── SQLite/database layer
             └── Cloudinary file storage
Backend
Recommended build command:

pip install -r requirements.txt
Recommended start command:

gunicorn app:app
Set backend environment variables in the Render dashboard:

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
JWT_SECRET_KEY
FRONTEND_ORIGIN
Do not upload the backend .env file to GitHub as a replacement for Render environment variables.

Frontend
Build command:

npm install && npm run build
Set:

VITE_API_BASE_URL=https://YOUR-BACKEND-URL
The exact Render configuration can vary depending on whether the frontend is deployed as a Static Site or Web Service.

⚠️ SQLite on Hosting
The project currently uses SQLite:

backend/database.db
SQLite is convenient for development, but persistent local files on many cloud hosting setups are not ideal for production databases.

For a larger production deployment, consider migrating the database to PostgreSQL while keeping Cloudinary as the file-storage service.

Cloudinary solves file-storage persistence; it does not replace the application's relational database.

🧹 Development Cleanup
Do not commit generated/local development directories such as:

backend/venv/
frontend/node_modules/
Also keep secrets and local runtime files out of version control:

.env
*.db
unless a database file is intentionally part of the project's deployment strategy.

🤝 Development Workflow
Recommended workflow:

git pull

# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
Before pushing changes:

cd frontend
npm run lint
npm run build
Also test the backend file lifecycle manually or with the existing backend tests.

📌 Project Status
LibraryBCA is a full-stack BCA academic resource platform with a React frontend, Flask API, JWT authentication, SQLite/SQLAlchemy data layer, and Cloudinary-based file-storage architecture.

The project is structured so that the frontend communicates with the backend API, while sensitive storage operations remain server-side.

📜 License
Add the project's chosen license here before public distribution.

LibraryBCA — A simple digital library for BCA students. 📚