# LingoBoost - Language Learning Web App

A responsive React web application that helps users practice sentence construction in their target language (Vietnamese) using their known language (English) as guidance.

## Features

- 🎯 **Sentence Building**: Arrange scrambled words to form correct sentences
- 🔊 **Text-to-Speech**: Pronunciation support for Vietnamese words
- 📊 **Statistics Tracking**: Monitor your progress and accuracy
- 📱 **Mobile-First Design**: Optimized for mobile browsers
- 🚀 **PWA Support**: Install as a native app on mobile devices
- 🎨 **Responsive Layout**: Works seamlessly across all screen sizes

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

## Deploying on Github pages
npm run build
npx gh-pages -d dist -f

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Vite** for fast development and building
- **PWA** capabilities with service worker

## Game Mechanics

1. **English Reference**: Display the English sentence at the top
2. **Scrambled Words**: Show Vietnamese words as clickable buttons
3. **Construction Area**: Click words to build your sentence
4. **Audio Feedback**: Hear pronunciation when clicking words
5. **Progress Tracking**: Statistics saved locally

## Mobile Optimization

- Touch-friendly interface (44px minimum tap targets)
- Fast tap response (eliminated 300ms delay)
- Responsive design for portrait/landscape orientations
- PWA installation capability
- Offline functionality with cached content

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS Safari and Android Chrome optimized
- Progressive enhancement approach

## License

MIT License
