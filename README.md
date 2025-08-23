# ElderCare Connect - Elderly Health Care Platform

A comprehensive health and charity platform dedicated to supporting our senior community with accessible medical services, community events, and volunteer support.

## ♿ Accessibility

This application is built to meet **WCAG 2.1 AA accessibility standards**. Key features include:

- 🔤 **Keyboard Navigation**: Full support for keyboard-only users
- 🔍 **Skip Links**: Quick navigation to main content
- 🏷️ **Semantic HTML**: Proper use of headings, landmarks, and ARIA labels
- 🎨 **High Contrast**: Sufficient color contrast ratios
- 📱 **Responsive Design**: Works on all devices and screen sizes
- 🔊 **Screen Reader Support**: Compatible with assistive technologies

### Testing Accessibility

1. **Automated Testing**: Run the accessibility test script in browser console:
   ```javascript
   // Accessibility testing can be performed using browser developer tools
   // or third-party accessibility testing tools like axe-core
   ```

2. **Manual Testing**:
   - Use Tab key to navigate through all interactive elements
   - Test with screen readers (NVDA, JAWS, VoiceOver)
   - Verify 200% zoom functionality
   - Check keyboard shortcuts and focus indicators

3. **Compliance Report**: See `ACCESSIBILITY_COMPLIANCE.md` for detailed compliance information

## 🚀 Features

- 🩺 **Medical Equipment Lending**: Browse and reserve medical devices
- 📅 **Community Events**: Health seminars and social gatherings
- 🤝 **Volunteer Support**: Connect with community volunteers
- 📍 **Interactive Map**: Find local healthcare facilities
- 👥 **User Management**: Separate interfaces for elders, volunteers, and admins
- 🔐 **Firebase Authentication**: Secure user authentication and data management

## 📁 Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
├── router/             # Vue Router configuration
├── firebase/           # Firebase configuration
├── utils/              # Utility functions including accessibility helpers
└── assets/             # Static assets and global styles
```

## 🛠️ Technology Stack

- **Frontend**: Vue 3, Vite, Bootstrap 5
- **Backend**: Firebase (Authentication, Firestore)
- **Maps**: Leaflet.js
- **Charts**: Chart.js, vue-chartjs
- **Data**: Papa Parse for CSV handling
- **Accessibility**: WCAG 2.1 AA compliant

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 🧪 Testing

### Accessibility Testing
This application meets WCAG 2.1 AA accessibility standards. For detailed compliance information, see `ACCESSIBILITY_COMPLIANCE.md`.

### Manual Testing Checklist
- [x] All pages load without errors
- [x] Navigation works with keyboard only (Tab, Enter, Space keys)
- [x] Forms can be filled and submitted via keyboard
- [x] Skip links are functional
- [x] Text maintains readability at 200% zoom
- [x] Color information is not the only way to convey meaning
- [x] All interactive elements have proper focus indicators
- [x] Screen reader compatible with ARIA labels and semantic HTML

## 📝 License

This project is developed for educational purposes as part of a university assignment.

---

**Contact**: mhee0033@student.monash.edu  
**Institution**: Monash University  
**Course**: Web Development & Accessibility
