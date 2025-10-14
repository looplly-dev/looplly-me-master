# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b924d040-e3a7-4d1f-94fa-b78b84f2f3ff

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b924d040-e3a7-4d1f-94fa-b78b84f2f3ff) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Set up environment variables.
npm run env:setup
# Edit .env file with your actual Supabase credentials

# Step 4: Install the necessary dependencies.
npm i

# Step 5: Validate your environment setup.
npm run env:validate

# Step 6: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend as a Service)

## Environment Configuration

This project uses a secure environment variable management system. Key features:

- 🔐 **Secure by default**: Environment files are excluded from Git
- 🛡️ **Validation**: Automatic validation of environment variables on startup
- 📝 **Templates**: Example files for easy setup
- 🌍 **Multi-environment**: Support for development, production, and test environments

### Quick Setup
```sh
# Create your local environment file
npm run env:setup

# Validate your environment configuration
npm run env:validate
```

### Required Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID

For detailed setup instructions, see: [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b924d040-e3a7-4d1f-94fa-b78b84f2f3ff) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
