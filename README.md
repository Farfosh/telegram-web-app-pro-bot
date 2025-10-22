# TG Data Inspector 🔍

Complete Telegram Mini App to display and test all Telegram WebApp API capabilities in a live and organized manner.

> ⚠️ **Important:** This app works ONLY inside Telegram. It must be opened through a Telegram bot.

## ✨ Features

### 📱 Mobile-First Interface
- Clean Telegram-like design
- Full Light/Dark theme support
- Responsive design with safe areas
- Organized tabs for easy navigation

### 🎯 10 Main Sections

1. **Overview** - User and app information, quick actions
2. **Theme & Colors** - Display and modify themeParams
3. **Viewport & Safe Areas** - Viewport info and safe zones
4. **Context & Launch Params** - Launch context information
5. **Buttons & Haptics** - Button and haptic feedback control
6. **Permissions & Device** - Permissions and sensors (Biometric, Location, Sensors)
7. **Storage Playground** - CloudStorage/DeviceStorage/SecureStorage
8. **Share & Invoices** - Sharing and invoices
9. **Debug & Event Stream** - Event log and debugging
10. **Security Note** - Persistent security warning

### ⚡ Live Mode Only

This app uses Telegram WebApp API directly:
- Real data from initData and initDataUnsafe
- Real Methods calls
- Real Events
- Real Sensors (GPS, Accelerometer, Gyroscope)
- Automatic `WebApp.ready()` call

### 🎨 Theme Integration

Supports all Telegram theme colors:
- `bg_color`, `text_color`, `hint_color`
- `button_color`, `button_text_color`
- `secondary_bg_color`, `header_bg_color`
- `bottom_bar_bg_color`, `accent_text_color`
- `section_bg_color`, `section_header_text_color`
- `section_separator_color`, `subtitle_text_color`
- `destructive_text_color`

Colors are automatically applied via CSS Variables.

### 🔒 Security Note

The app displays a persistent security banner:
> ⚠️ **Security Note:** initDataUnsafe is not trusted on the frontend. Any authentication/payment/privileges must be verified on the server via HMAC-SHA256 on initData before accepting any action.

## 🚀 How to Use

### 1. Deploy to HTTPS Hosting

The app requires HTTPS. Choose one:

**GitHub Pages (Free):**
```bash
git init
git add .
git commit -m "TG Data Inspector"
git remote add origin https://github.com/username/tg-inspector.git
git push -u origin main

# Enable GitHub Pages in Settings → Pages → Source: main
```

**Vercel (Fastest):**
```bash
npx vercel
```

**Netlify:**
```bash
npx netlify deploy --prod
```

### 2. Create Telegram Bot

1. Open [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow instructions
4. Save your Bot Token (for backend verification)

### 3. Set Web App URL

1. Send `/mybots` to @BotFather
2. Select your bot
3. Bot Settings → Menu Button
4. Enter your URL: `https://yourdomain.com`

### 4. Open in Telegram

1. Open your bot in Telegram
2. Click the Menu Button
3. The app will launch with real data!

## 📁 File Structure

```
web-app/
├── index.html       # Main interface with all tabs
├── style.css        # Styles (theme-aware, responsive)
├── app.js           # Main logic (Live mode only)
├── manifest.json    # PWA manifest
├── icon.svg         # App icon
├── package.json     # npm config
├── .gitignore      # Git ignore
├── LICENSE         # MIT License
└── README.md       # This file
```

## 🛠️ Features by Tab

### 1. Overview
- User information (avatar, name, username, language, premium)
- App information (platform, version, colorScheme)
- Quick actions (Expand, Ready, Fullscreen)
- initData viewer with Copy function

### 2. Theme & Colors
- Display all themeParams as color swatches
- Change colors (Header, Background, Bottom Bar)
- CSS Variables viewer with Copy

### 3. Viewport & Safe Areas
- Viewport dimensions
- Safe Area Insets visual display
- Content Safe Area Insets

### 4. Context & Launch
- Launch parameters (start_param, query_id)
- Chat information
- Launch source detection
- Actions (sendData, openLink, openInvoice)

### 5. Buttons & Haptics
- MainButton control
- SecondaryButton control
- BackButton and SettingsButton toggles
- Haptic feedback testing

### 6. Permissions & Device
- Request permissions (Write Access, Contact, Biometric)
- GPS Location (real coordinates)
- Accelerometer (real device values)
- Gyroscope (real device values)
- Device Orientation control

### 7. Storage Playground
- Cloud Storage (synced across devices)
- Device Storage (local)
- Secure Storage (encrypted)
- Set/Get/Remove operations

### 8. Share & Invoices
- Share to Story
- Share Message
- Open Invoice

### 9. Debug & Event Stream
- Show Popup/Alert/Confirm
- QR Scanner
- Read Clipboard
- Add to Home Screen
- Real-time Event Stream logging

## 🔐 Backend Verification

**Important:** Never trust `initDataUnsafe` on the frontend!

Always verify `initData` on your backend:

```javascript
// Node.js example
const crypto = require('crypto');

function verifyTelegramData(initData, botToken) {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');
    
    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();
    
    const expectedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');
    
    return expectedHash === hash;
}
```

## 📚 References

- [Telegram WebApp API Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 📝 Notes

- App works ONLY in Telegram (shows error otherwise)
- All features use real Telegram APIs
- Event Stream logs every action
- Safe Areas automatically applied
- Location uses browser Geolocation API
- Sensors use DeviceMotion/DeviceOrientation APIs

---

Made with ❤️ for Telegram Mini Apps
