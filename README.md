# 🛒 EcoTrade – Secure & Sustainable Resale Platform

[![MERN](https://img.shields.io/badge/Stack-MERN-blue)](https://mern.io/)
[![React](https://img.shields.io/badge/React-17.0.2-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-4.18-lightgrey?logo=express)](https://expressjs.com/)
[![Braintree](https://img.shields.io/badge/Braintree-Payments-purple?logo=braintree)](https://www.braintreepayments.com/)

---

## 📌 Project Description

*EcoTrade* is a **full-stack MERN based e-commerce / 2nd-hand marketplace platform** that allows users to **buy and sell pre-owned products** securely.  
The application supports:

* Role-based access (Buyer & Admin)  
* OTP-based authentication  
* Real-time chat  
* Secure online payments  
* Product & order management  

The project is built using **modern web technologies** following a **client–server architecture**.

---

**Demo Video:** [Watch on LinkedIn](https://www.linkedin.com/posts/-ayush-raj_ecotrade-mern-stack-2nd-hand-marketplace-activity-7412198307378167809-reEn?utm_source=share&utm_medium=member_android&rcm=ACoAAENVmG8BczQWK3BQ9nRFEBLWoDM5t5fNhDQ)

---

# 🧱 System Architecture

Client (React.js)
↓ REST APIs / Socket.IO
Server (Node.js + Express.js)
↓
MongoDB Database



---

# 🖥 FRONTEND – React.js (Client Side)

## 🎯 Frontend Responsibility

The frontend is responsible for:

* User Interface (UI) & interaction  
* Routing & navigation  
* State management  
* API communication  
* Real-time chat UI  
* Form validation  
* Authentication handling  

---

## 📁 Frontend Folder Structure

frontend/

│

├── public/

│ └── index.html

│

├── src/

│ ├── components/ → Reusable UI components

│ ├── pages/ → Route-based pages

│ ├── features/ → Redux slices (auth, cart, product, chat)

│ ├── utils/ → Helper functions

│ ├── theme/ → MUI theme configuration

│ ├── App.jsx → Main routing file

│ ├── main.jsx → App entry point

│

├── package.json  


---

## 🧩 Frontend Technologies

**React.js** – Component-based UI, fast rendering via Virtual DOM  
**React Router DOM** – Client-side routing  
**Redux Toolkit** – Global state management  
**Axios** – HTTP requests to backend APIs  
**Material UI (MUI)** – UI components & responsive design  
**JWT Handling** – Token-based authentication for protected routes  
**Form Validation Libraries** – Client-side validation  
**Socket.IO Client** – Real-time chat  
**Payment Gateway Integration** – Payment UI & order confirmation  

---

### 🔐 Frontend Authentication Flow

1. User enters credentials  
2. OTP verification screen  
3. JWT token received  
4. Token stored securely  
5. Protected routes enabled  

---

# 🛠 BACKEND – Node.js + Express.js (Server Side)

## 🎯 Backend Responsibility

Backend handles:

* Business logic  
* Authentication & authorization  
* Database operations  
* API creation  
* Email & OTP services  
* Payment verification  
* Real-time chat logic  

---

## 📁 Backend Folder Structure

backend/

│

├── controllers/ → Business logic

├── routes/ → API routes

├── models/ → MongoDB schemas

├── middleware/ → Auth & error handling

├── database/ → DB connection

├── socket/ → Socket.IO logic

├── utils/ → Helper utilities

├── uploads/ → Product images

│

├── index.js → Server entry

├── package.json

├── .env 


---

## 🔧 Backend Technologies

**Node.js** – Asynchronous JS runtime  
**Express.js** – RESTful APIs & middleware  
**MongoDB** – NoSQL database  
**Mongoose** – ODM for MongoDB  
**JWT** – Token-based authentication  
**Bcrypt.js** – Password hashing  
**OTP System** – Email verification & password reset  
**Email Service (Resend/Nodemailer)** – Sends OTPs  
**Multer** – File uploads  
**Socket.IO** – Real-time chat  
**Stripe** – Payment processing  
**Middleware** – Auth, admin check, error handling  
**Environment Variables** – Secure sensitive data  

---

## 📦 Database Models

**User Model** – Name, Email, Password, Role, Verified status  
**Product Model** – Title, Description, Price, Images, Seller  
**Order Model** – Buyer, Products, Payment & Order status  
**OTP Model** – Email, OTP, Expiry time  

---

## 🔄 API Flow

1. Frontend sends request  
2. Express route receives request  
3. Controller processes logic  
4. MongoDB queried  
5. Response sent back  

---

## 🔐 Security Features

✔ Password hashing  
✔ JWT authentication  
✔ Role-based access  
✔ Protected routes  
✔ Secure payments  

---

## ▶ How to Run

### Backend

```bash
cd backend
npm install
npm run dev

### Frontend

cd frontend
npm install
npm run dev


