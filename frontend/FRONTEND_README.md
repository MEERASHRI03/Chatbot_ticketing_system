# Travel Booking System - Frontend

A comprehensive React-based frontend for the Travel Booking System that works seamlessly with the Spring Boot backend.

## Features

### User Features
- **User Authentication**: Register, Login, and account management
- **Browse Destinations**: View all available tourist places with detailed information
- **Search Places**: Search destinations by name, city, or state
- **Book Tickets**: Create bookings for multiple visitors (adults and children)
- **Payment Processing**: Complete secure payment flow
- **View Tickets**: Download and view digital tickets with QR codes
- **Manage Bookings**: View, track, and cancel bookings
- **Request Refunds**: Request refunds for tickets with reason tracking
- **User Dashboard**: Quick access to bookings and tickets

### Admin Features
- **Admin Dashboard**: Overview with key statistics (places, bookings, revenue, refunds)
- **Manage Places**: Create, update, and delete tourist destinations
  - Set pricing for adults and children
  - Configure opening/closing times
  - Manage available slots
- **Manage Refunds**: Review and approve/reject refund requests
- **View Analytics**: Track bookings and revenue

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.js      # Navigation bar
│   │   └── Navbar.css
│   ├── pages/             # Page components
│   │   ├── Home.js        # Landing page
│   │   ├── Login.js       # Login page
│   │   ├── Register.js    # Registration page
│   │   ├── Places.js      # Browse destinations
│   │   ├── PlaceDetail.js # Place details & booking
│   │   ├── BookingDetail.js # Booking details & payment
│   │   ├── MyBookings.js  # User's bookings
│   │   ├── MyTickets.js   # User's tickets
│   │   ├── AdminDashboard.js # Admin overview
│   │   ├── ManagePlaces.js    # Admin place management
│   │   ├── ManageRefunds.js   # Admin refund management
│   │   └── *.css          # Component styles
│   ├── services/          # API service layer
│   │   ├── api.js         # Axios configuration
│   │   ├── authService.js
│   │   ├── placeService.js
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   ├── ticketService.js
│   │   └── refundService.js
│   ├── context/           # React Context
│   │   └── AuthContext.js # Authentication state
│   ├── utils/             # Utility functions
│   │   ├── constants.js   # App constants and helpers
│   │   └── PrivateRoute.js # Protected routes
│   ├── App.js             # Main app with routing
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Technologies Used

- **React 19**: UI library
- **React Router DOM 6**: Client-side routing
- **Axios**: HTTP client for API calls
- **QRCode.react**: QR code generation for tickets
- **Chart.js**: Data visualization for analytics
- **date-fns**: Date formatting and manipulation
- **CSS3**: Styling with responsive design

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional for custom API URL):
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_BASE_URL=http://localhost:8080
```

## Running the Application

### Development Mode
```bash
npm start
```
The application will run on `http://localhost:3000`

### Build for Production
```bash
npm build
```

### Run Tests
```bash
npm test
```

## API Integration

The frontend communicates with the Spring Boot backend via REST API endpoints:

### Base URL
- Development: `http://localhost:8080/api`

### Key Endpoints
- **Auth**: `/auth/register`, `/auth/login`
- **Places**: `/places` (GET, POST, PUT, DELETE)
- **Bookings**: `/bookings` (CRUD operations)
- **Payments**: `/payments` (Process and track payments)
- **Tickets**: `/tickets` (Generate and manage)
- **Refunds**: `/refunds` (Request and approve refunds)

## Authentication Flow

1. User registers or logs in
2. JWT token is stored in localStorage
3. Token is attached to all API requests via interceptor
4. If token expires (401 response), user is redirected to login

## Key Components

### Navbar
- Shows based on authentication status
- Displays user name and role
- Admin links for administrators

### Protected Routes
- Routes wrapped with `PrivateRoute` component
- Requires authentication
- Admin-only routes check user role

### Form Validation
- Client-side validation for user inputs
- Server-side validation for security
- Clear error messages

## Styling

The application uses a modern gradient theme:
- Primary Color: `#667eea` (Indigo)
- Secondary Color: `#764ba2` (Purple)
- Responsive design with mobile-first approach
- CSS Grid and Flexbox for layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

```
REACT_APP_API_URL    - Backend API base URL (default: http://localhost:8080/api)
REACT_APP_BASE_URL   - Backend base URL (default: http://localhost:8080)
```

## Troubleshooting

### Port 3000 already in use
```bash
# Linux/Mac
sudo kill -9 $(lsof -t -i:3000)

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS Issues
Ensure the backend is configured with proper CORS headers for `http://localhost:3000`

### API Connection Issues
Check that the backend is running on `http://localhost:8080`

## Building for Production

1. Create an optimized production build:
```bash
npm run build
```

2. The build folder contains all the static files ready for deployment

## Support

For issues or questions, please refer to the main README.md in the project root directory.
