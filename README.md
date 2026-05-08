# SnippetMe

**Elevate your developer workflow with SnippetMe, a modern, terminal-inspired code snippet manager.**

![SnippetMe Overview](/assets/screenshot.png) *(Note: Replace with actual screenshot)*

## 🚀 Overview

SnippetMe is a premium developer tool designed to organize, store, and access your most important code fragments. Featuring a sleek **Terminal Midnight** aesthetic, it combines the power of a modern web application with the focused feel of a high-performance terminal.

With an emphasis on speed, clean UI, and robust backend architecture, SnippetMe allows you to save code blocks across multiple languages, categorize them with tags, and assign them to specific projects.

## ✨ Features

- **Seamless Authentication**: Fast and secure JWT-based email authentication. Auto-signup removes friction—just type your email and password, and you're in.
- **Project Organization**: Group snippets logically by project to keep your workspaces distinct and organized.
- **Advanced Code Management**: Store code snippets with metadata including description, programming language, and custom tags.
- **Premium UI/UX**: Built with a "glassmorphism" terminal design, beautiful typography, micro-animations via Framer Motion, and a heavily optimized dark mode.
- **Responsive Design**: fully responsive and usable across desktop, tablet, and mobile devices.

## 🛠️ Technology Stack

SnippetMe has been structured using modern industry standards for scalability and maintainability.

### Frontend
- **React.js** (v18+)
- **Tailwind CSS** (Utility-first styling, custom theme tokens)
- **Framer Motion** (Fluid page transitions and micro-animations)
- **Lucide React** (Crisp, clean iconography)
- **React Router v6** (Client-side routing)

### Backend
- **Node.js & Express.js** (Modular architecture: split into routes, controllers, and middleware)
- **PostgreSQL** (Relational database for secure and structured data storage)
- **JSON Web Tokens (JWT)** (Stateless, secure session management)
- **Bcrypt** (Secure password hashing)

## 📁 Project Structure

The project follows a clean, modular structure:

```text
├── api/                  # Node.js Express Backend
│   ├── config/           # Database connections and configurations
│   ├── middleware/       # JWT authentication middleware
│   ├── routes/           # Express routers (auth, users, snippets, projects)
│   └── index.js          # Entry point for the server
├── src/                  # React Frontend
│   ├── components/       # Reusable UI components (Auth, Profile, Header, etc.)
│   ├── db/               # Frontend API wrapper
│   ├── App.js            # Main React layout and router configuration
│   └── index.css         # Global Tailwind variables and custom animations
├── public/               # Static assets
└── package.json          # Project dependencies and scripts
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imadhurgupta/snippetme.git
   cd snippetme
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/snippetme
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   ```

4. **Start the application**
   Run the development server and backend concurrently:
   ```bash
   npm start
   ```
   *The backend will automatically create the necessary database tables on the first run.*

5. **Open in Browser**
   Navigate to `http://localhost:3000` to start using SnippetMe.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
