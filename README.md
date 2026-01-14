# FChat - WhatsApp Clone

A modern WhatsApp-like chat application built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- **Real-time Messaging**: WebSocket-based instant messaging
- **Multiple Chat Types**: 1-1, 1-many, and many-to-many (group) conversations
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **User Authentication**: Secure sign-up and login with Supabase Auth
- **Message Features**: 
  - Send/receive messages
  - Reply to messages
  - Delete messages
  - Typing indicators
  - Message status (sent, delivered, read)
- **Modern UI**: WhatsApp-inspired interface with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **WebSockets**: Socket.IO for real-time features
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
chat-app/
├── components/          # React components
│   ├── ChatApp.tsx     # Main chat application
│   ├── ChatList.tsx    # Conversation list sidebar
│   ├── ChatWindow.tsx  # Active chat window
│   ├── ChatBubble.tsx  # Individual message component
│   ├── NewChatModal.tsx # New chat/group creation modal
│   └── LoginScreen.tsx # Authentication screen
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useConversations.ts # Conversation management
│   ├── useMessages.ts  # Message handling
│   └── useProfile.ts   # User profile management
├── lib/                # Utilities and API layer
│   ├── api.ts          # API client with axios
│   └── supabaseClient.ts # Supabase configuration
├── pages/              # Next.js pages
└── supabase-schema.sql # Database schema
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd chat-app
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your:
   - Project URL
   - Anon (public) key
3. Run the provided SQL schema in your Supabase SQL editor:
   ```sql
   -- Copy contents of supabase-schema.sql and run in Supabase SQL editor
   ```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles extending Supabase auth
- **conversations**: Chat conversations (1-1 and groups)
- **conversation_participants**: Many-to-many relationship for participants
- **messages**: Chat messages with threading support
- **message_status**: Read receipts and delivery status
- **typing_indicators**: Real-time typing indicators

## API Architecture

The application follows a clean architecture pattern:

1. **Components** call **custom hooks** with parameters
2. **Hooks** manage state and call **API functions**
3. **API functions** use **axios** and **Supabase client** for data operations
4. **Real-time updates** handled via Supabase subscriptions

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Authenticate with your credentials
3. **Create Chats**: 
   - Click "New Chat" for 1-1 conversations
   - Click "New Group" for group chats
4. **Messaging**: 
   - Send messages in real-time
   - Reply to specific messages
   - Delete your own messages
   - See typing indicators
5. **Responsive**: Works on all device sizes

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Features Implementation

- **Authentication**: Supabase Auth with custom hooks
- **Real-time**: Supabase real-time subscriptions for live updates
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Architecture**: Reusable components with proper props
- **State Management**: React hooks with proper separation of concerns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
