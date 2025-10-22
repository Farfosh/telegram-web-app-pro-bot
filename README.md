# 🔍 TG Data Inspector

**Complete Telegram Mini App Data Inspector** - Display and test all Telegram WebApp API capabilities in real-time.

> ⚠️ **Important:** This app works ONLY inside Telegram. It must be opened through a Telegram bot.

---

## 🚀 Quick Start (Choose Your Method)

### 1️⃣ Local Testing (30 seconds)
```bash
# Just open index.html in your browser
# ✅ App shows error message (expected - needs Telegram)
# ✅ Perfect for checking files are ready
```

### 2️⃣ Deploy to GitHub Pages (5 minutes) - **FREE HTTPS**
```bash
git init
git add .
git commit -m "TG Data Inspector"
git remote add origin https://github.com/username/tg-inspector.git
git push -u origin main

# Then: GitHub → Settings → Pages → Source: main → Save
# URL: https://username.github.io/tg-inspector/
```

### 3️⃣ Quick Deploy with Vercel (1 minute) - **FASTEST**
```bash
npx vercel
# ✅ Gives you instant HTTPS URL: https://project.vercel.app
```

### 4️⃣ Connect to Telegram Bot (2 minutes)
```
1. Open @BotFather in Telegram
2. /mybots → Select Your Bot → Bot Settings → Menu Button
3. Enter URL: https://your-deployed-url.com
4. Open bot → Click Menu Button → App launches! 🎉
```

---

## ✨ Features

### 📱 Mobile-First Interface
- Clean Telegram-like design
- Full Light/Dark theme support
- Responsive design with safe areas
- Organized tabs for easy navigation

### 🎯 10 Main Sections

1. **Overview** - User info, app info, initData viewer, quick actions
2. **Theme & Colors** - All themeParams display, color customization, CSS variables
3. **Viewport & Safe Areas** - Viewport dimensions, safe area insets (visual display)
4. **Context & Launch** - Launch params, chat info, launch source, context actions
5. **Buttons & Haptics** - Main/Secondary/Back/Settings buttons, haptic feedback
6. **Permissions & Device** - Write access, Contact, Biometric, GPS Location, Sensors
7. **Storage Playground** - Cloud Storage + Secure Storage (real Telegram APIs)
8. **Share & Invoices** - Share to Story, Share Message, Open Invoice
9. **Debug & Event Stream** - Popups, QR Scanner, Clipboard, Event logging
10. **Security Banner** - Persistent warning about initDataUnsafe verification

### ⚡ Live Mode Only (No Demo Data)

This app now works **ONLY inside Telegram** (Demo mode removed):
- ✅ Real data from `window.Telegram.WebApp`
- ✅ Real API calls (CloudStorage, SecureStorage, BiometricManager)
- ✅ Real Events (viewportChanged, themeChanged, etc.)
- ✅ Real Sensors (Accelerometer, Gyroscope, Location)
- ✅ Automatic `WebApp.ready()` call
- ❌ Shows error screen if opened outside Telegram

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

## 💡 Quick Tips

- ✅ Deploy to HTTPS first (required by Telegram)
- ✅ Test opening from Telegram (not browser)
- ✅ Check Event Stream in Debug tab for all actions
- ✅ Use "Load All Keys" in Cloud Storage to see saved data
- ✅ Click "Check Status" for Biometric before authenticating
- ✅ Try sensors on a real mobile device (not desktop)
- ✅ Copy CSS Variables from Theme tab for your own projects

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
- **Cloud Storage** - Synced across devices via Telegram Cloud
- **Secure Storage** - Encrypted storage for sensitive data
- **Operations:** Set/Get/Remove keys
- **Load All Keys** - Fetch all existing cloud storage data

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

## 🐛 Common Issues & Solutions

### ❓ "Telegram WebApp Not Found"
**Solution:** This is normal! The app only works inside Telegram. Deploy it and open through a Telegram bot.

### ❓ "Bot Menu Button Not Working"
**Solution:** Make sure your URL uses HTTPS. GitHub Pages and Vercel provide free HTTPS.

### ❓ "Theme Not Applied"
**Solution:** Open the app from inside Telegram, not from a regular browser. Telegram themes only work in Telegram.

### ❓ "Sensors Not Working"
**Solution:** 
- Requires Telegram version 7.2+
- Device must have physical sensors
- User must grant permission when prompted

### ❓ "Cloud Storage Empty"
**Solution:** Click the "Load All Keys" button to fetch existing data from Telegram Cloud Storage.

### ❓ "Biometric Not Available"
**Solution:** 
- Check if your device supports biometric (fingerprint/face ID)
- Make sure Telegram has permission to use biometric sensors
- Click "Check Status" to see availability

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Lines of Code** | ~1,300 lines |
| **Total Size** | ~80 KB (uncompressed) |
| **Load Time** | < 1 second |
| **Dependencies** | Zero! Pure vanilla JS |
| **Browser Support** | Chrome, Firefox, Safari, Telegram WebView |
| **Telegram API Version** | 7.2+ (for sensors) |

---

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

## 🌟 Key Features Summary

| Feature | Status |
|---------|--------|
| ✅ **10 Organized Tabs** | All WebApp API features covered |
| ✅ **Live Mode Only** | Real Telegram data (no demo) |
| ✅ **Event Stream** | Real-time logging of all actions |
| ✅ **Theme-Aware** | Auto Dark/Light theme support |
| ✅ **Mobile-First** | Optimized for mobile devices |
| ✅ **Safe Areas** | Full safe area inset support |
| ✅ **Copy Features** | Copy initData, CSS vars, etc. |
| ✅ **Zero Dependencies** | Pure vanilla JavaScript |
| ✅ **Security-Aware** | Persistent security warnings |
| ✅ **Real Storage APIs** | CloudStorage + SecureStorage |
| ✅ **Real Sensors** | Accelerometer + Gyroscope + Location |
| ✅ **Biometric Auth** | Fingerprint/Face ID support |

## 📝 Technical Notes

- **Requirements:** Telegram WebApp API 6.1+ (7.2+ for sensors)
- **Error Handling:** Global error handlers + try-catch blocks
- **Storage:** Uses Telegram Cloud Storage (not localStorage)
- **Sensors:** Uses Telegram's native Accelerometer/Gyroscope APIs
- **Location:** Uses browser Geolocation API
- **Theme:** Automatically applies via CSS variables
- **Safe Areas:** Respects env(safe-area-inset-*)

---

**Made with ❤️ for Telegram Mini Apps**

**Need help?** Check the [Common Issues](#-common-issues--solutions) section above.
