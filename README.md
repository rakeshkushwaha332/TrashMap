# TrashMap - Smart Waste Management Platform

TrashMap is a web-based platform that bridges the gap between citizens and municipal authorities. It enables users to report waste locations in real-time, while empowering authorities to manage, track, and optimize waste collection using an interactive dashboard, map-based tracking, and AI-supported insights.

## 🧱 Core Components & Features

### 1️⃣ Citizen Web Portal:
- User Registration/Login with email verification
- Waste Reporting Form with image upload and location selection
- Track Report Status (Pending / Assigned / Resolved)
- Mobile Responsive design with PWA support for offline functionality

### 2️⃣ Municipal Dashboard:
- Login for Admin/Municipal Team
- Live Map Dashboard showing pinned garbage spots
- Reports Management with filtering, assignment, and resolution
- Export data as CSV for offline analysis

### 3️⃣ Technical Architecture
- **Frontend**: React with TypeScript, Material UI
- **Map**: React Leaflet with OpenStreetMap
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Hosting**: Deployment-ready for Firebase Hosting, Netlify, or Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/trashmap.git
cd trashmap
```

2. Install dependencies:
```
npm install
```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Update Firebase config in `src/firebase/config.ts` with your credentials

4. Start the development server:
```
npm start
```

5. The app will be available at `http://localhost:3000`

## 🔐 Firebase Configuration

To use this application, you need to set up a Firebase project and update the config in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout/       # Layout components (Header, Footer)
│   ├── Map/          # Map-related components
│   └── ReportForm/   # Report form components
├── context/          # React context providers
├── firebase/         # Firebase configuration and services
├── pages/            # Application pages
│   └── admin/        # Admin/municipal pages
├── services/         # Business logic and data services
└── utils/            # Utility functions and helpers
```

## 🛠️ Technologies Used

- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Firebase**: Authentication, Database, Storage
- **React Router**: Client-side routing
- **Material UI**: Component library for consistent design
- **Leaflet**: Interactive maps
- **PWA**: Progressive Web App for offline access

## 📱 PWA Support

TrashMap includes Progressive Web App (PWA) support, allowing users to install it on their devices and access some features offline. The service worker caches assets and provides a better mobile experience.

## 📄 License

MIT License

## 🙏 Acknowledgements

- OpenStreetMap for map data
- Firebase for backend services
- Material UI for the component library
- React and TypeScript communities "# TrashMap" 
