# Developer Manifesto

A minimalist Next.js website for publishing developer manifestos with clean typography, interactive 3D animations, and GitHub-based signature system.

## Features

- **Markdown-driven content**: Manifesto content is managed through `.md` files
- **JetBrains Mono typography**: Clean, technical font for optimal readability
- **Interactive 3D animations**: Geometric Three.js animations with mouse interactions
- **GitHub Authentication**: Sign the manifesto with your GitHub account
- **Dynamic Signature System**: Real-time signature tracking with Supabase
- **Public API**: RESTful API for signature data
- **Responsive design**: Works seamlessly across all devices
- **SEO optimized**: Proper meta tags and semantic HTML

## Tech Stack

- **Next.js 15+** (App Router)
- **TailwindCSS** with typography plugin
- **Three.js** with React Three Fiber for 3D animations
- **Supabase** for authentication and database
- **Gray Matter** for frontmatter parsing
- **Remark** for Markdown processing
- **TypeScript** for type safety

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Create the database tables (see Database Setup below)
   - Configure GitHub OAuth provider
   - Copy your project URL and anon key

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```
   Then update `.env` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [https://manifesto.masterfabric.co](https://manifesto.masterfabric.co) in your browser (or http://localhost:3000 for local development)

## Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  github_username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures table
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  location TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
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
CREATE POLICY "Public signatures are viewable by everyone" ON signatures
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert signatures" ON signatures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signatures" ON signatures
  FOR UPDATE USING (auth.uid() = user_id);
```

## GitHub OAuth Setup

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable GitHub provider
4. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL to: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

## Content Management

The manifesto content is located in `content/manifesto.md`. Edit this file to update the manifesto:

```markdown
---
title: "Developer Manifesto"
date: "2025-01-12"
author: "Developer Community"
---

# Your Manifesto Content

Write your manifesto here using standard Markdown syntax.
```

## Customization

### Font
The site uses JetBrains Mono loaded from Google Fonts. To change the font, update the link in `src/app/layout.tsx` and the font family in `tailwind.config.js`.

### Colors
Main colors are defined in `tailwind.config.js`:
- `manifesto-gray`: #222222 (main text color)

### Animation
The Three.js animation can be customized in `src/components/AbstractAnimation.tsx`.

## Deployment

The site is optimized for static export:

```bash
npm run build
npm run export
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── manifesto/      # Manifesto content API
│   │   └── signatures/     # Signatures API
│   ├── auth/
│   │   ├── callback/       # OAuth callback handler
│   │   └── auth-code-error/ # Auth error page
│   ├── layout.tsx          # Root layout with font loading
│   ├── page.tsx            # Main manifesto page
│   └── globals.css         # Global styles
├── components/
│   ├── AbstractAnimation.tsx # Three.js animation component
│   ├── GitHubAuth.tsx      # GitHub authentication component
│   ├── SignatureForm.tsx   # Signature form component
│   ├── SignaturesList.tsx  # Signatures display component
│   ├── UserProfileDialog.tsx # User profile modal
│   ├── AuthHashHandler.tsx # Auth hash handling
│   ├── PrivacyConsentDialog.tsx # Privacy consent modal
│   ├── PrivacyWarningBanner.tsx # Privacy warning banner
│   └── SignatureSuccessDialog.tsx # Success confirmation modal
├── hooks/
│   └── useSignatures.ts    # Custom hook for signatures
└── lib/
    └── supabase.ts         # Supabase client configuration
content/
└── manifesto.md            # Manifesto content
migrations/
└── add_privacy_consent.sql # Database migration for privacy consent
```

## License

This project is open source and available under the MIT License.