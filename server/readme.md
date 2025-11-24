# Hospital Management System - Backend Server

A comprehensive Node.js/Express backend server for the Hospital Management System with AI-powered features including disease prediction and emoji-based chat suggestions.

## 🚀 Features

### Core Modules
- **Authentication & Authorization** - JWT-based secure authentication with role-based access control
- **Patient Management** - Complete patient registration, profiles, and medical history
- **Doctor Management** - Doctor profiles, specializations, and availability
- **Appointment System** - Appointment scheduling, management, and tracking
- **Medical Records** - Digital medical records with secure storage
- **Prescription Management** - Digital prescription creation and management
- **Billing & Payments** - Invoice generation and payment tracking
- **Bed Management** - Hospital bed allocation and availability tracking
- **Admission Management** - Patient admission and discharge workflows

### AI-Powered Features
- **Disease Prediction** - Random Forest ML model for symptom-based disease prediction
- **Smart Chat with Emoji Suggestions** - Naive Bayes algorithm for context-aware emoji recommendations
- **Real-time Chat** - Socket.IO powered real-time messaging between doctors and patients

### Additional Features
- **File Upload** - Profile picture and document upload with multer
- **Real-time Updates** - WebSocket integration for live notifications
- **Rate Limiting** - API rate limiting for security
- **CORS Configuration** - Secure cross-origin resource sharing
- **Input Validation** - Express-validator for request validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Python 3.8+ (for AI services)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db"
JWT_SECRET="your-secret-key-here"
PORT=5000
PYTHON_SERVICE_URL="http://localhost:8000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Seed Database

Create initial admin user and sample data:

```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@gmail.com`
- Password: `12345678`

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # Database configuration
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── patientController.js
│   ├── doctorController.js
│   ├── appointmentController.js
│   ├── chatController.js
│   ├── predictionController.js
│   └── ...
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── roleCheck.js         # Role-based access control
│   ├── profileUpload.js     # File upload handling
│   ├── rateLimiter.js       # API rate limiting
│   └── validator.js         # Input validation
├── routes/                  # API route definitions
│   ├── auth.js
│   ├── patients.js
│   ├── doctors.js
│   ├── appointments.js
│   ├── chat.js
│   ├── predictions.js
│   └── ...
├── prisma/
│   └── schema.prisma        # Database schema
├── storage/                 # File storage
│   └── profile/            # Profile pictures
├── utils/                   # Utility functions
├── index.js                 # Server entry point
├── seed.js                  # Database seeding script
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile/picture` - Update profile picture

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/specialization/:spec` - Get doctors by specialization
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:conversationId` - Get conversation messages
- `POST /api/chat/messages` - Send message
- `POST /api/chat/emoji-suggestions` - Get AI emoji suggestions

### Disease Prediction
- `GET /api/predictions/symptoms` - Get all symptoms
- `POST /api/predictions/predict` - Predict disease from symptoms
- `POST /api/predictions/suggest-symptoms` - Get related symptom suggestions

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🤖 AI Integration

The server integrates with a Python-based AI service for:

### Disease Prediction
- **Algorithm**: Random Forest Classifier (100 trees)
- **Features**: 132 binary symptom features
- **Accuracy**: ~98%
- **Endpoint**: `POST /api/predictions/predict`

### Emoji Suggestions
- **Algorithm**: Multinomial Naive Bayes
- **Features**: TF-IDF vectorization (5000 features)
- **Accuracy**: ~89%
- **Endpoint**: `POST /api/chat/emoji-suggestions`

**Python Service Setup:**
```bash
cd ../serverpy
python app.py
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Include the token in requests:**
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

**User Roles:**
- `ADMIN` - Full system access
- `DOCTOR` - Doctor-specific features
- `PATIENT` - Patient-specific features

## 📤 File Upload

### Profile Picture Upload

**Endpoint:** `PUT /api/auth/profile/picture`

**Configuration:**
- Max file size: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- Storage: `server/storage/profile/`
- Naming: `profile-{userId}-{timestamp}.{extension}`

**Example:**
```javascript
const formData = new FormData();
formData.append('profile', fileInput.files[0]);

fetch('http://localhost:5000/api/auth/profile/picture', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

## 🌐 CORS Configuration

The server is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

Static files are served with cross-origin headers for image loading.

## 🔄 Real-time Features

### Socket.IO Events

**Client → Server:**
- `join_conversation` - Join a chat conversation
- `send_message` - Send a chat message
- `typing` - User typing indicator

**Server → Client:**
- `new_message` - New message received
- `user_typing` - User is typing
- `conversation_updated` - Conversation updated

## 📊 Database Schema

The system uses Prisma ORM with PostgreSQL. Key models include:

- `User` - System users (admin, doctor, patient)
- `Patient` - Patient profiles and medical info
- `Doctor` - Doctor profiles and specializations
- `Appointment` - Appointment records
- `MedicalRecord` - Patient medical records
- `Prescription` - Prescription records
- `Bill` - Billing information
- `Payment` - Payment transactions
- `Bed` - Hospital bed management
- `Admission` - Patient admissions
- `Conversation` - Chat conversations
- `Message` - Chat messages

## 🧪 Testing

### Using the API Collection

Import `HMS_API_Collection.json` into Postman or Thunder Client for pre-configured API requests.

### Manual Testing

1. Start the server: `npm run dev`
2. Start the Python AI service: `cd ../serverpy && python app.py`
3. Start the frontend: `cd ../client && npm run dev`
4. Login with admin credentials
5. Test features through the UI

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API request throttling
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt password encryption
- **Input Validation** - Express-validator sanitization
- **SQL Injection Protection** - Prisma ORM parameterized queries

## 📝 Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
npm run seed           # Seed database with initial data
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Run: npx prisma db push
```

### CORS Errors
- Ensure frontend URL is in CORS origins list
- Check that server is running on correct port
- Verify static file CORS headers

### File Upload Failures
- Check file size (max 5MB)
- Verify file type is allowed
- Ensure `storage/profile/` directory exists
- Check authentication token is valid

### AI Service Connection
- Verify Python service is running on port 8000
- Check PYTHON_SERVICE_URL in .env
- Ensure all Python dependencies are installed

## 📦 Dependencies

### Core
- **express** - Web framework
- **@prisma/client** - Database ORM
- **socket.io** - Real-time communication
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing

### Middleware
- **cors** - CORS handling
- **helmet** - Security headers
- **multer** - File upload
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting

### AI Integration
- **axios** - HTTP client for Python service
- **natural** - NLP utilities

## 🤝 Contributing

1. Follow the existing code structure
2. Use meaningful variable and function names
3. Add comments for complex logic
4. Test all endpoints before committing
5. Update this README for new features

## 📄 License

This project is part of a BCA 8th semester project.

## 👥 Support

For issues or questions, please contact the development team.
