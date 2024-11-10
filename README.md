# 🔐 EYS (Encrypt Your Stuff)

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

EYS is a secure file encryption application that helps you protect your sensitive data with enterprise-grade encryption. Built with Node.js, React, and MySQL, it offers a user-friendly interface while maintaining robust security standards.

## 🚀 Features

- 🔒 Strong file encryption using industry-standard algorithms
- 👥 User authentication and authorization
- 📁 Secure file storage and management
- 🔄 Easy file encryption/decryption
- 💻 Clean and intuitive user interface

## 📋 Prerequisites for build

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/SonormaY/eys_node.git
cd eys_node
```

2. **Set up the environment variables**
```bash
# Create .env file in the server directory
cp .env.example .env
# Edit the .env file with your database credentials
```

3. **Install dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

4. **Set up the database**
```bash
# Run the MySQL scripts in the database directory
mysql -u your_username -p your_database < database/schema.sql
```

## 🚀 Running the Application

1. **Start the backend server**
```bash
cd server
npm run dev
```

2. **Start the frontend application**
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
eys/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   └── package.json
└── database/              # Database scripts
    └── schema.sql
```

## 🔒 Security Features

- Password hashing using bcrypt
- JWT authentication
- Secure file encryption
- Protection against SQL injection
- CORS protection
- Rate limiting

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.

## 👥 Authors

- SonormaY - *Initial work* - [YourGithub](https://github.com/SonormaY)

## 📞 Support

For support, email stanislav.humeniuk@outlook.com or create an issue in the repository.

---
Made with ❤️ by SonormaY