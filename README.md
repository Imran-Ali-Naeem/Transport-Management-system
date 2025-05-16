# Transport Management System (TMS)


A comprehensive full-stack solution for managing transportation logistics with role-based access control, real-time tracking, and scheduling capabilities.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)

## Features

### Core Functionality
- **Multi-role Authentication System** (Admin, Drivers, Students)
- **Route Optimization** with intelligent scheduling
- **Real-time Vehicle Tracking** using GPS integration
- **Automated Notifications** for schedule changes

### Admin Capabilities
- Dashboard with analytics and reporting
- User management and permissions
- Route creation and assignment
- Vehicle fleet management

### Driver Features
- Mobile-friendly interface
- Route navigation assistance
- Attendance and status updates
- Emergency alert system

### Student Portal
- Personalized route information
- Real-time vehicle tracking
- Schedule notifications
- Feedback system

## Technologies Used

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | Frontend framework |
| React Router v6 | Navigation |
| Axios | HTTP client |
| Context API | State management |
| React Icons | Icon library |
| Socket.io Client | Real-time updates |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 16+ | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Bcrypt.js | Password hashing |
| Nodemailer | Email services |
| Socket.io | WebSockets |
| Dotenv | Environment management |

## Folder Structure
<pre> <code>
Transport-management-system/
├── backend/ # Backend server code
│ ├── config/ # Configuration files
│ │ ├── db.js # Database configuration
│ │ └── auth.js # Auth strategies
│ ├── controllers/ # Route controllers
│ │ ├── authController.js # Auth logic
│ │ ├── userController.js # User management
│ │ └── routeController.js # Route operations
│ ├── middleware/ # Custom middleware
│ │ ├── auth.js # Authentication
│ │ └── errorHandler.js # Error handling
│ ├── models/ # MongoDB models
│ │ ├── User.js # User schema
│ │ ├── Route.js # Route schema
│ │ └── Vehicle.js # Vehicle schema
│ ├── routes/ # API endpoints
│ │ ├── authRoutes.js # Auth endpoints
│ │ ├── userRoutes.js # User endpoints
│ │ └── routeRoutes.js # Route endpoints
│ ├── services/ # Business logic
│ │ ├── authService.js # Auth services
│ │ └── routeService.js # Route services
│ ├── utils/ # Utilities
│ │ ├── apiFeatures.js # API utilities
│ │ └── emailSender.js # Email templates
│ ├── .env # Environment variables
│ ├── package.json # Backend dependencies
│ └── server.js # Server entry point
│
├── src/ # Frontend React application
│ ├── components/ # Reusable components
│ │ ├── auth/ # Auth components
│ │ │ ├── LoginForm.js # Login form
│ │ │ └── RegisterForm.js # Registration form
│ │ ├── student/ # Student components
│ │ │ ├── RouteCard.js # Route display
│ │ │ └── TrackingMap.js # Live tracking
│ │ └── shared/ # Shared components
│ │ ├── Navbar.js # Navigation bar
│ │ └── Footer.js # Page footer
│ ├── context/ # Context providers
│ │ ├── AuthContext.js # Auth state
│ │ └── RouteContext.js # Route data
│ ├── pages/ # Page components
│ │ ├── admin/ # Admin pages
│ │ │ ├── Dashboard.js # Admin dashboard
│ │ │ └── Users.js # User management
│ │ ├── auth/ # Auth pages
│ │ │ ├── Login.js # Login page
│ │ │ └── Register.js # Register page
│ │ ├── driver/ # Driver pages
│ │ │ ├── Schedule.js # Driver schedule
│ │ │ └── Navigation.js # Route navigation
│ │ ├── shared/ # Shared pages
│ │ │ ├── Profile.js # User profile
│ │ │ └── Settings.js # Account settings
│ │ └── student/ # Student pages
│ │ ├── Home.js # Student dashboard
│ │ └── RouteInfo.js # Route details
│ ├── services/ # API services
│ │ ├── auth.js # Auth API calls
│ │ └── routes.js # Route API calls
│ ├── App.js # Main application
│ ├── index.js # React entry point
│ └── index.css # Global styles
│
├── .gitignore # Git ignore rules
├── package.json # Frontend dependencies
└── README.md # Project documentation

 </code> </pre>




## Installation

### 1. Clone the Repository

git clone  https://github.com/Imran-Ali-Naeem/Transport-Management-system.git  
cd Transport-management-system

### 2. Backend Setup
cd backend  
npm install

### 3. Frontend Setup
cd nu-cfd-transport-system  
npm install


## Configuration
### 1. Create .env file in the backend directory:
# Server Configuration
PORT=5000  
NODE_ENV = development

# Database
MONGO_URI = mongodb://localhost:27017/nu_cfd_transport


# Authentication
JWT_SECRET = your_jwt_secret  
JWT_EXPIRE = 30d

# Email Service
EMAIL_SERVICE = gmail  
EMAIL_USER = your_email  
EMAIL_APP_PASSWORD = your_email_password_using_2_step_verification


## Running the Application
### Start application
cd backend  
npm run dev  
Server will run at: http://localhost:5000

### Start Frontend Development Server
cd nu-cfd-transport-system  
npm start  
Application will open at: http://localhost:3000



