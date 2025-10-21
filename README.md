# Looplly.me - Modern Web Application

> A powerful and intuitive web application built with modern technologies for seamless user experience.

## Project info

**URL**: https://lovable.dev/projects/b924d040-e3a7-4d1f-94fa-b78b84f2f3ff

## 🚀 Quick Start

### Development Setup

There are several ways of editing your application.

### **Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b924d040-e3a7-4d1f-94fa-b78b84f2f3ff) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

### **Use your preferred IDE**

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

### **Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### **Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Tech Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend as a Service)

## 🌍 Environment Configuration

This project uses a hybrid environment management system combining traditional .env files with Supabase-based configuration. Key features:

- 🔐 **Secure by default**: Environment files are excluded from Git
- 🛡️ **Validation**: Automatic validation of environment variables on startup
- 📝 **Templates**: Example files for easy setup
- 🌍 **Multi-environment**: Support for development, production, and test environments
- 📊 **Dynamic Configuration**: Supabase-managed settings that update without redeploy
- 🔒 **Centralized Secrets**: Store sensitive configuration in your Supabase database

### Quick Setup
```sh
# Create your local environment file
npm run env:setup

# Initialize Supabase configuration system
npm run config:init

# View configuration documentation
npm run config:docs
```

### Required Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID

For detailed setup instructions, see:
- [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md) - Traditional .env management
- [Supabase Configuration Management](docs/SUPABASE_CONFIG_MANAGEMENT.md) - Dynamic configuration system

### Admin & Security Documentation
- [Admin Setup Instructions](ADMIN_SETUP_INSTRUCTIONS.md) - Setting up admin access
- [Role Architecture](docs/ROLE_ARCHITECTURE.md) - Understanding the dual-table role system
- [User Type Management](docs/USER_TYPE_MANAGEMENT.md) - Managing office vs Looplly users
- [Warren's Admin Guide](docs/WARREN_ADMIN_GUIDE.md) - Plain-English admin guide for non-technical users

## 🔐 Admin System

The project uses a **dual-table role management system**:
- **Staff Roles** (`user_roles` table): super_admin, admin, user
- **User Types** (`user_types` table): office_user, looplly_user

This separation provides:
- ✅ Clear conceptual separation between staff and platform users
- ✅ Enhanced security with separate RLS policies
- ✅ Role hierarchy enforcement (super_admin > admin > user)
- ✅ Scalable architecture for adding new roles/types
- ✅ Protection against privilege escalation attacks

See [Role Architecture](docs/ROLE_ARCHITECTURE.md) for detailed technical documentation.

## 🚀 Deployment

Simply open [Lovable](https://lovable.dev/projects/b924d040-e3a7-4d1f-94fa-b78b84f2f3ff) and click on Share -> Publish.

## 🌐 Custom Domain

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
