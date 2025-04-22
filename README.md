# Study Agora

A mobile application for Cambridge, SAT & IELTS preparation, built with React Native and Expo.

## Features

- User authentication (sign up, sign in)
- Live interactive learning sessions
- Pre-recorded educational content
- Study resources (notes, past questions, books)
- Payment processing for subscriptions

## Tech Stack

- **Frontend**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (Authentication, Database, Storage)
- **Payment Processing**: Stripe (to be implemented)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd studyAgora
```

2. Install dependencies:
```
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Supabase URL and anon key:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Update the Supabase configuration:
   - Open `app/services/supabase.js`
   - Replace the placeholder values with your actual Supabase credentials

### Running the App

```
npm start
```

Then, scan the QR code with the Expo Go app on your mobile device, or press 'a' to run on an Android emulator or 'i' for iOS simulator.

## Project Structure

```
studyAgora/
├── app/
│   ├── assets/        # Images, fonts and other static assets
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # App screens
│   ├── services/      # API services (Supabase, etc.)
│   └── utils/         # Utility functions
├── assets/            # Expo assets
├── App.js             # Main App component
└── ...                # Other configuration files
```

## Development Roadmap

1. **Phase 1**: Setup & Authentication
   - Project configuration
   - User registration and login

2. **Phase 2**: Learning Module
   - Pre-recorded sessions
   - Live sessions

3. **Phase 3**: Resources Library
   - Study materials management
   - Content browsing

4. **Phase 4**: Payment Integration
   - Subscription management
   - Secure payment processing

5. **Phase 5**: Notifications
   - Push notifications for live sessions
   - Reminders and updates

## Contributing

[Instructions for contributing to the project]

## License

[License information] 