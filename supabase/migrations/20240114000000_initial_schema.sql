-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table (for both 1-1 and group chats)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT, -- null for 1-1 chats, name for group chats
  is_group BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'file', 'voice', 'video'
  reply_to_id UUID REFERENCES messages(id), -- for threaded replies
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message status tracking
CREATE TABLE IF NOT EXISTS message_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Typing indicators
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_message_status_user ON message_status(user_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT USING (
  id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (created_by = auth.uid());

-- Conversation participants
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
);

-- Messages
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert messages in their conversations" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND 
  conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
);

-- Message status
CREATE POLICY "Users can manage their own message status" ON message_status FOR ALL USING (user_id = auth.uid());

-- Typing indicators
CREATE POLICY "Users can manage typing indicators" ON typing_indicators FOR ALL USING (user_id = auth.uid());

-- Functions for real-time updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create 1-1 conversation
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conversation_uuid UUID;
BEGIN
  -- Try to find existing direct conversation
  SELECT c.id INTO conversation_uuid
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.is_group = false
    AND cp1.user_id = user1_id
    AND cp2.user_id = user2_id
    AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id) = 2;
  
  -- If not found, create new one
  IF conversation_uuid IS NULL THEN
    INSERT INTO conversations (is_group, created_by)
    VALUES (false, user1_id)
    RETURNING id INTO conversation_uuid;
    
    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_uuid, user1_id),
      (conversation_uuid, user2_id);
  END IF;
  
  RETURN conversation_uuid;
END;
$$ LANGUAGE plpgsql;
