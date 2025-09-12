# 🚀 Supabase Setup Guide

This guide explains the necessary steps to run the Developer Manifesto project with a real Supabase connection.

## 📋 Step 1: Create Supabase Project

1. Go to [Supabase.com](https://supabase.com)
2. Click "Start your project" button
3. Sign in with GitHub
4. Click "New Project" button
5. Fill in project information:
   - **Name**: `developer-manifesto`
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to you

## 🔑 Step 2: Get API Keys

1. After the project is created, select **Settings** → **API** from the left menu
2. Copy the following values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public** key

## ⚙️ Step 3: Set Environment Variables

Edit the `.env.local` file:

```bash
# Paste your actual Supabase values here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 🗄️ Step 4: Create Database Tables

Go to **SQL Editor** in Supabase Dashboard and run the following SQL:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  github_username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures table
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  location TEXT,
  privacy_consent BOOLEAN NOT NULL DEFAULT true,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to the privacy_consent column
COMMENT ON COLUMN signatures.privacy_consent IS 'User consent for public display of their signature information (GDPR compliance)';

-- Create index for privacy consent queries
CREATE INDEX IF NOT EXISTS idx_signatures_privacy_consent ON signatures(privacy_consent);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Signatures policies
CREATE POLICY "Signatures are viewable by everyone" ON signatures
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert signatures" ON signatures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, github_username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatars.githubusercontent.com/u/1?v=4')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🔐 Step 5: GitHub OAuth Setup

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App" button
3. Fill in the following information:
   - **Application name**: `Developer Manifesto`
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`

### Enable GitHub Provider in Supabase

1. Go to **Authentication** → **Providers** page in Supabase Dashboard
2. Find **GitHub** provider and **Enable** it
3. Enter the information from your GitHub OAuth App:
   - **Client ID**: Your GitHub OAuth App's Client ID
   - **Client Secret**: Your GitHub OAuth App's Client Secret

## 🧪 Step 6: Test the Setup

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000` in your browser

3. You should now see real GitHub authentication instead of demo mode:
   - ✅ "Sign in with GitHub" button
   - ✅ Real GitHub OAuth flow
   - ✅ Real signature saving with privacy consent
   - ✅ Real signature list display
   - ✅ GDPR-compliant privacy consent system

## 🚀 Production Deployment

For production:

1. Update **Authorization callback URL** in your GitHub OAuth App to your production domain
2. Update **Site URL** in Supabase Dashboard under **Authentication** → **URL Configuration**
3. Add environment variables to your production server

## 🔒 Privacy & GDPR Compliance

This setup includes a complete GDPR-compliant privacy consent system:

- **Privacy Consent Dialog**: Users must consent before their information is displayed publicly
- **Privacy Warning Banner**: Shown when users decline consent
- **Database Field**: `privacy_consent` boolean field tracks user consent
- **Compliance**: Full GDPR compliance for EU users

### Privacy Features:
- ✅ Explicit consent required before signing
- ✅ Clear information about what data will be public
- ✅ Option to withdraw consent
- ✅ Warning system for non-consenting users

## 🔧 Troubleshooting

### "Demo Mode" Still Showing
- Make sure `.env.local` file has correct values
- Restart development server
- Clear browser cache

### GitHub OAuth Not Working
- Ensure GitHub OAuth App callback URL is correct
- Verify Supabase GitHub provider settings are correct
- Check console for error messages

### Database Errors
- Make sure SQL script ran completely
- Verify Row Level Security policies were created correctly
- Check that `privacy_consent` column exists in signatures table

### Privacy Consent Issues
- Verify localStorage is working in browser
- Check console logs for privacy consent flow
- Ensure privacy consent dialogs are displaying correctly

## 📞 Support

If you encounter any issues:
1. Check console for error messages
2. Check **Logs** page in Supabase Dashboard
3. Report issues on GitHub Issues

---

**Note**: After following this guide, the project will be completely production-ready with real GitHub authentication and GDPR-compliant privacy consent system! 🎉
