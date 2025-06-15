# KeyFrame Wingman for Premiere Pro

A powerful UXP plugin that simplifies keyframe easing control in Adobe Premiere Pro. Apply custom cubic-bezier easing curves to your keyframes with an intuitive 2-slider interface.

## ✨ Features

- **🎛️ Dual Slider Control**: Easy-to-use Ease In & Ease Out sliders (0-100%)
- **📊 Real-time Preview**: Live cubic-bezier display as you adjust
- **🎯 Smart Detection**: Automatically detects keyframed properties in timeline
- **⚡ One-Click Apply**: Apply easing to multiple keyframes simultaneously
- **🔧 Debug Mode**: Built-in debugging for development and troubleshooting
- **🎨 Modern UI**: Dark theme optimized for Premiere Pro workflow

## 🚀 Installation & Setup

### Prerequisites

- **Adobe Premiere Pro Beta 25.0+** (UXP support required)
- **UXP Developer Tool (UDT) v2.1+**

### Installation Steps

1. Download and install UXP Developer Tool (UDT)
2. Launch Premiere Pro Beta
3. In UDT, click **"Add Plugin"**
4. Navigate to this folder and select `manifest.json`
5. Click **"Load"** to load the plugin
6. Access via **Window → Extensions → KeyFrame Wingman**

## 🎯 How to Use

### Basic Workflow

1. **Create keyframes** in Effect Controls (Motion > Scale, Position, etc.)
2. **Open KeyFrame Wingman** panel
3. **Click "Refresh Selection"** to detect keyframes
4. **Adjust sliders** to desired easing values
5. **Click "Apply Easing"** to update keyframes

### Slider Values

- **Ease In**: Controls entry curve (0% = sharp, 100% = smooth)
- **Ease Out**: Controls exit curve (0% = sharp, 100% = smooth)
- **Reset to Linear**: Sets both sliders to 50% (linear motion)

## 🧪 Testing

Detailed testing instructions available in `TEST_GUIDE.md`. Quick test:

1. Load plugin into Premiere Pro
2. Create keyframes on a clip's Scale property
3. Use plugin to apply easing
4. Verify keyframes change from Linear to Bezier in Effect Controls

**Success criteria**: UI works smoothly + keyframe detection functions correctly.

## 🔧 Development

Built with:

- **UXP 8.1** (Adobe's modern extensibility platform)
- **Vanilla JavaScript** (no build process required)
- **Premiere Pro UXP APIs** for keyframe manipulation

### Project Structure

```
KFW-Pr/
├── index.html          # UI layout
├── main.js            # Core functionality & API integration
├── Styles/
│   ├── style.css      # Compiled styles
│   └── style.scss     # SCSS source
├── manifest.json      # Plugin configuration
└── TEST_GUIDE.md      # Comprehensive testing guide
```
