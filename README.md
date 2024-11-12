# 🔐 EYS (Encrypt Your Stuff)

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![bcrypt](https://img.shields.io/badge/bcrypt-2A7284?style=for-the-badge)](https://www.npmjs.com/package/bcrypt)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

EYS is a secure file encryption application that helps you protect your sensitive data with enterprise-grade encryption. Built with Node.js, React, and PostgreSQL, it offers a user-friendly interface while maintaining robust security standards.

## 🚀 Features

- 🔒 Strong file encryption using industry-standard algorithms
- 👥 User authentication and authorization
- 📁 Secure file storage and management
- 🔄 Easy file encryption/decryption
- 💻 Clean and intuitive user interface

## 📋 Prerequisites for build

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/SonormaY/eys_node.git
cd eys_node
```

2. **Set up the environment variables on frontend and backend**
```bash
# Create .env file in the client directory
cd client
cp .env.example .env
# Edit the .env file with your database credentials

# Create .env file in the server directory
cd ../server
cp .env.example .env
# Edit the .env file with your database credentials and jwt secret
```

3. **Install dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd ../client
npm install
```

4. **Set up the database**
```bash
# Run the PostgreSQL scripts in the database directory
cd ..
psql -U postgres -f schema.sql
```

## 🚀 Running the Application in dev mode

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

The application will be available at `http://localhost:3001` or different port if specified in the `.env` file.

## 🏗️ Project Structure

```
eys/
├── client/                 # React frontend
│   ├── src/
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── .env.example
│   ├── index.js
│   ├── index_rpi.js
│   ├── package-lock.json
│   └── package.json
├── .gitignore              # Git ignore file
├── LICENSE                 # License file
├── README.md               # Readme file
├── deploy.sh               # Deployment script
└── schema.sql              # Database scripts
```

## 🔒 Security Features

- Password hashing using bcrypt
- JWT authentication
- Secure file encryption
- CORS protection
- Rate limiting

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.

## 👥 Authors

- Stanislav Humeniuk - *Initial work* - [SonormaY](https://github.com/SonormaY)

## 📞 Support

For support, email stanislav.humeniuk@outlook.com or create an issue in the repository.

---
Made with ❤️ by SonormaY