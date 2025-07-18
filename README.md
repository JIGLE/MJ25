# MJ25 Wedding Website 💒

A modern, responsive wedding website built with React and Vite, designed for Marlene & Jose's special day.

[![Build Status](https://github.com/JIGLE/MJ25/workflows/Build%20and%20Deploy%20Wedding%20Website/badge.svg)](https://github.com/JIGLE/MJ25/actions)
[![Docker Image](https://ghcr-badge.egpl.dev/jigle/mj25/latest_tag?trim=major&label=Latest%20Image)](https://github.com/JIGLE/MJ25/pkgs/container/mj25)

## ✨ Features

- **🎨 Responsive Design**: Beautiful on all devices
- **📝 RSVP Management**: Guest response tracking
- **📸 Photo Gallery**: Wedding photo showcase
- **🌐 Multi-language Support**: English and Spanish
- **⚙️ Admin Panel**: Content management
- **🔥 Firebase Integration**: Real-time data sync
- **🚀 TrueNAS SCALE App**: Custom Kubernetes deployment
- **🔄 CI/CD Pipeline**: Automated builds and deployments

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/JIGLE/MJ25.git
cd MJ25

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run dev:network  # Start dev server accessible from network
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run clean        # Clean build artifacts
```

## 🏗️ Tech Stack

- **Frontend**: React 18, React Router
- **Build Tool**: Vite
- **Styling**: CSS Modules, SASS
- **Internationalization**: i18next
- **Backend**: Firebase
- **Deployment**: Docker, Kubernetes (TrueNAS SCALE)
- **CI/CD**: GitHub Actions

## 📦 Deployment

### TrueNAS SCALE Custom App

This project includes a custom Helm chart for deployment on TrueNAS SCALE:

1. **Install through TrueNAS UI**:
   - Apps → Discover Apps → Custom App
   - Repository URL: `https://github.com/JIGLE/MJ25`
   - Chart Path: `charts/mj25-wedding`

2. **Configure**:
   - Port: 30080 (or your preference)
   - Storage: 1Gi persistent volume
   - Resources: 512Mi memory limit

3. **Access**: `http://your-truenas-ip:30080`

### Docker Deployment

```bash
# Build image
docker build -t mj25-wedding .

# Run container
docker run -p 30080:80 mj25-wedding

# Or use docker-compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build for production
npm run build

# Serve the dist folder with any web server
```

## 🔧 Configuration

### Environment Variables

Create `.env.production` for production settings:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Configure authentication (optional)
4. Add your config to environment variables

## 📁 Project Structure

```
mj25-wedding/
├── .github/workflows/     # CI/CD pipelines
├── charts/mj25-wedding/   # Helm chart for TrueNAS
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── styles/          # CSS/SASS styles
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── docs/                # Documentation
├── scripts/             # Build scripts
├── Dockerfile           # Container configuration
├── docker-compose.yml   # Local development
└── package.json         # Dependencies
```

## 🎨 Customization

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation in `src/components/Navbar.jsx`

### Styling

- Global styles: `src/index.css`
- Component styles: `src/components/ComponentName.module.css`
- Theme variables: `src/styles/themes.css`

### Internationalization

- Add translations in `public/i18n/lang/`
- Supported languages: English (en-UK), Spanish (es-ES)

## 📊 Performance

- **Lighthouse Score**: 95+
- **Bundle Size**: < 500KB gzipped
- **Load Time**: < 2s on 3G

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is private and proprietary for Marlene & Jose's wedding.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/JIGLE/MJ25/issues)
- **Documentation**: See `/docs` folder
- **Migration Guide**: See `MIGRATION.md`

---

Made with ❤️ for Marlene & Jose's special day 💕
