
# Wanderly Backend — REST API for Travel Social Network

🔐 A secure and scalable backend service for a traveler-oriented social network.

🔗 **API Base URL**: [https://wanderly-back.onrender.com/api/v1](https://wanderly-back.onrender.com/api/v1)

---

## 📌 Project Ownership

This backend server was built entirely by **OLGA DIETIUK KAHRAMAN** for educational and portfolio purposes. The design, endpoints, and architecture reflect my own development decisions.

---

## 🌟 Features

- 🔐 JWT-based authentication
- ✅ Secure login and registration with validation
- 🧱 MongoDB database via Mongoose
- 🚧 Rate limiter middleware for security
- 🧰 Error handling and route protection
- ✨ Ready to scale with cloud deployment (Render)

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express-Validator** for validation
- **Rate Limit Middleware**
- **Dotenv** for environment configuration

---

## 📦 Used Modules and Imports

```js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');


## 🚀 Installation
### Backend Setup
```bash
git clone "https://github.com/olgakahraman/wanderly-back"
cd server
npm install
cp .env.example .env
# Fill in your environment variables
npm start

© 2025 Wanderly — all rights reserved. 
Developed by OLGA DIETIUK KAHRAMAN.
