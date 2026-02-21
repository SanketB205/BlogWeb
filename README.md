# MERN Blogging Platform

A full-stack blogging platform built with MongoDB, Express, React, and Node.js.

## Features
- User Authentication (Register/Login)
- Create, Read, Update, Delete (CRUD) Blog Posts
- Rich Text Editor (basic text area for now)
- Image Support (URL based)
- Responsive Design with Tailwind CSS

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on port 27017

## Setup & Run

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:5000

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## Environment Variables
**Backend (.env)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_platform
JWT_SECRET=your_secret_key
```

## API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (Auth required)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (Auth required, Author only)
- `DELETE /api/posts/:id` - Delete post (Auth required, Author only)
