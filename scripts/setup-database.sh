#!/bin/bash

# Supabase CLI Migration Setup Script
# This script sets up the database using Supabase CLI

set -e

echo "🚀 Setting up Personal Assistant Database with Supabase CLI"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if Supabase is initialized
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please log in to Supabase:"
    supabase login
fi

# Link to remote project (if not already linked)
if [ ! -f "supabase/.temp/project-ref" ]; then
    echo "🔗 Linking to remote Supabase project..."
    echo "Please enter your Supabase project reference ID:"
    read -p "Project Reference: " PROJECT_REF
    
    if [ -z "$PROJECT_REF" ]; then
        echo "❌ Project reference is required"
        exit 1
    fi
    
    supabase link --project-ref "$PROJECT_REF"
fi

# Pull latest schema from remote
echo "📥 Pulling latest schema from remote..."
supabase db pull

# Apply migrations
echo "🔄 Applying migrations..."
supabase db push

# Generate TypeScript types
echo "📝 Generating TypeScript types..."
supabase gen types typescript --local > src/types/supabase.ts

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the correct Supabase credentials"
echo "2. Start your backend server: npm run dev"
echo "3. Test the API endpoints"
echo ""
echo "🔗 Supabase Dashboard: https://supabase.com/dashboard/project/$(cat supabase/.temp/project-ref)"