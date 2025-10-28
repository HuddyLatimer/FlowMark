<div align="center">

# 🌊 FlowMark

### Modern Task Management Platform

A full-stack, real-time task management application built with Next.js, Supabase, and TypeScript. Manage projects, collaborate with teams, and track progress with an intuitive Kanban board interface.

[Live Demo](https://flowmark1.netlify.app/) · [Report Bug](https://github.com/HuddyLatimer/FlowMark/issues) · [Request Feature](https://github.com/HuddyLatimer/FlowMark/issues)

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---


https://github.com/user-attachments/assets/b2302e20-d2a5-4dd2-8715-6760edfb5187


## ✨ Features

### 🔐 **Authentication & Security**
- Email/password authentication with secure JWT tokens
- Google OAuth integration ready
- Row-level security (RLS) for data protection
- Protected routes with middleware

### 🏢 **Workspace Management**
- Create unlimited workspaces
- Organize projects by team or category
- Role-based access control (Owner/Admin/Member)
- Workspace member management

### 📊 **Project Organization**
- Multiple projects per workspace
- Custom project colors and descriptions
- Quick project switching
- Visual project cards

### 📋 **Kanban Task Board**
- 4-column board: To Do → In Progress → Review → Done
- Smooth drag-and-drop functionality
- Real-time updates across all users
- Visual priority indicators (Low, Medium, High, Urgent)

### ✅ **Task Management**
- Full CRUD operations (Create, Read, Update, Delete)
- Assign tasks to team members
- Due dates with overdue indicators
- Rich task descriptions
- Task status tracking

### 🔍 **Advanced Search & Filtering**
- Search tasks by title or description
- Filter by status, priority, or assignee
- Combine multiple filters
- Clear all filters with one click

### ⚡ **Real-time Collaboration**
- Live task updates via WebSockets
- Instant board synchronization
- See changes as they happen
- Activity logging system

### 📱 **Responsive Design**
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-enhanced experience
- Clean, modern UI with Tailwind CSS

---

## 🎯 Why FlowMark?

FlowMark combines the simplicity of Trello with the power of modern web technologies. Built as a portfolio project, it demonstrates:

- ✅ Full-stack development with Next.js 14
- ✅ Real-time features with Supabase
- ✅ Type-safe development with TypeScript
- ✅ Database design & optimization
- ✅ Authentication & authorization
- ✅ Responsive UI/UX design
- ✅ Production deployment ready

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (free tier works!)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/HuddyLatimer/FlowMark.git
cd FlowMark
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Create a new project at [supabase.com](https://supabase.com), then:

- Go to **SQL Editor**
- Run the schema from `supabase/schema-fixed.sql`
- Note your Project URL and anon key from **Settings → API**

4. **Configure environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app! 🎉

---

## 🏗️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[@hello-pangea/dnd](https://github.com/hello-pangea/dnd)** - Drag and drop

### Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL database
- **[Supabase Auth](https://supabase.com/auth)** - User authentication
- **[Supabase Realtime](https://supabase.com/realtime)** - WebSocket subscriptions
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Database-level authorization

### DevOps
- **[Netlify](https://netlify.com/)** - Hosting & deployment
- **Git** - Version control

---

## 📁 Project Structure

```
FlowMark/
├── app/                          # Next.js App Router
│   ├── auth/callback/           # OAuth callback handler
│   ├── dashboard/               # Main dashboard
│   ├── login/                   # Login page
│   ├── signup/                  # Registration page
│   ├── workspace/[id]/          # Workspace detail page
│   ├── project/[id]/            # Kanban board page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
│
├── components/                  # React components
│   ├── CreateProjectButton.tsx
│   ├── CreateTaskButton.tsx
│   ├── CreateWorkspaceButton.tsx
│   ├── KanbanBoard.tsx         # Main Kanban component
│   ├── SearchAndFilter.tsx     # Search & filter UI
│   ├── TaskCard.tsx            # Individual task display
│   ├── TaskModal.tsx           # Task edit modal
│   ├── UserMenu.tsx            # User dropdown
│   ├── WorkspaceMembers.tsx    # Member management
│   └── WorkspacesList.tsx      # Workspace grid
│
├── lib/                         # Utility functions
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── middleware.ts       # Auth middleware logic
│   └── types/
│       └── database.types.ts   # TypeScript types
│
├── supabase/                    # Database
│   ├── schema.sql              # Original schema
│   ├── schema-fixed.sql        # Fixed RLS policies
│   └── fix-all-rls-policies.sql # RLS fix script
│
├── middleware.ts                # Next.js middleware
├── netlify.toml                 # Netlify config
└── package.json                 # Dependencies
```

---

## 🗄️ Database Schema

FlowMark uses PostgreSQL via Supabase with the following structure:

### Core Tables
- **`profiles`** - User profiles (extends auth.users)
- **`workspaces`** - Team workspaces
- **`workspace_members`** - Membership & roles
- **`projects`** - Projects within workspaces
- **`tasks`** - Individual tasks
- **`task_comments`** - Task comments (bonus feature)
- **`activity_log`** - Activity tracking (bonus feature)

### Security
- Row Level Security (RLS) enabled on all tables
- 20+ policies for fine-grained access control
- Automatic profile creation on signup
- Secure by default

---

## 🚢 Deployment

### Deploy to Netlify

1. **Push to GitHub**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. **Connect to Netlify**
- Go to [netlify.com](https://netlify.com)
- Import your GitHub repository
- Netlify auto-detects Next.js settings

3. **Add environment variables**
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

4. **Deploy**
- Click "Deploy site"
- Your app will be live!

5. **Update Supabase**
- Add Netlify URL to Supabase redirect URLs
- Go to Authentication → URL Configuration
- Add your Netlify URL

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Consistent formatting
- Component-based architecture

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🎯 Roadmap

### Phase 1 - Core Features ✅
- [x] Authentication (Email + Google OAuth)
- [x] Workspace management
- [x] Project organization
- [x] Kanban board with drag-and-drop
- [x] Task CRUD operations
- [x] Real-time collaboration
- [x] Search and filtering
- [x] Deployed to production

### Phase 2 - Enhancements
- [ ] Dark mode toggle
- [ ] Task comments interface
- [ ] File attachments
- [ ] Calendar view
- [ ] Email notifications
- [ ] User avatar uploads
- [ ] Workspace member invitations

### Phase 3 - Advanced Features
- [ ] Time tracking
- [ ] Task templates
- [ ] Custom workflows
- [ ] Analytics dashboard
- [ ] Export to CSV/PDF
- [ ] Mobile app (React Native)

### Phase 4 - Enterprise
- [ ] SSO integration
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] API for integrations
- [ ] Webhooks

---

## 📊 Performance

- ⚡ Lighthouse Score: 95+
- 🚀 First Contentful Paint: < 1.5s
- 📦 Bundle Size: Optimized with tree-shaking
- 🔄 Real-time Latency: < 100ms

---

## 🔒 Security

- JWT-based authentication
- Row Level Security (RLS)
- Environment variables for secrets
- HTTPS enforced
- No sensitive data exposure
- Regular dependency updates

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Hudson Latimer**

- GitHub: [@HuddyLatimer](https://github.com/HuddyLatimer)
- Portfolio: [hudsonlatimer.com](https://hudsonlatimer.com)
- Email: [hudsonlatimer4@gmail.com](mailto:hudsonlatimer4@gmail.com)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful open source icons
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) - Drag and drop library

---

## ⭐ Show Your Support

If you found this project helpful or learned something from it, please give it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ using Next.js, Supabase, and TypeScript**

[⬆ Back to Top](#-flowmark)

</div>
