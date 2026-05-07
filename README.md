#  CodeSnippets

**Elevate your developer workflow with CodeSnippets, a modern, terminal-inspired code snippet manager.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![GCP](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
---

## ✨ Overview

CodeSnippets is a premium developer tool designed to organize, store, and access your most important code snippets. Featuring a sleek **Terminal Midnight** aesthetic, it combines the power of a modern web application with the focused feel of a high-performance terminal.

Managed through a procedural dot-grid background and high-contrast "Matrix Emerald" accents, CodeSnippets isn't just a manager—it's your technical workspace.

## 🚀 Key Features

-   **🔐 Secure Authentication**: Integrated with Google Cloud Platform Identity (GCP Auth) via OAuth 2.0.
-   **📁 Project-Based Organization**: Group snippets into focused projects with custom color accents and descriptions.
-   **🛡️ Syntax Highlighting**: Premium code rendering for 50+ languages using `react-syntax-highlighter`.
-   **🔍 Instantly Searchable**: Lightning-fast search across projects and snippet titles.
-   **⚡ Terminal Midnight UI**: A technical, high-performance aesthetic featuring scanline effects, glassmorphic components, and fluid Framer Motion animations.
-   **📱 Responsive Design**: Fully optimized for desktop and mobile developers.

---

## 🛠️ Tech Stack

-   **Frontend**: React.js 18
-   **Styling**: Tailwind CSS (Custom Developer Theme)
-   **Database**: PostgreSQL
-   **Auth**: Google Cloud Identity Platform (OAuth 2.0)
-   **Backend**: Node.js & Express
-   **Icons**: Lucide React
-   **Animations**: Framer Motion

---

## 🏁 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16.0.0 or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Google Cloud Project](https://console.cloud.google.com/)
-   [PostgreSQL](https://www.postgresql.org/) running locally or in cloud

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/imadhurgupta/codesnippets.git
    cd codesnippets
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your credentials:
    ```env
    REACT_APP_GOOGLE_CLIENT_ID=your_gcp_oauth_client_id
    DATABASE_URL=postgres://user:password@localhost:5432/codesnippets
    ```

4.  **Start the development server**:
    ```bash
    npm start
    ```

---

## 📂 Project Structure

```text
src/
├── components/       # UI Components (Header, Auth, SnippetCard, etc.)
├── db/               # Database logic and SQL.js integration
├── server.js         # Express Backend Server and Database queries
├── App.js            # Main application routing and theme setup
├── index.css         # Global styles and Tailwind directives
└── App.css           # Component-specific styles and animations
```

---

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`
Builds the app for production to the `build` folder.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with 💻 by <b>Madhur Gupta</b>
</p>
