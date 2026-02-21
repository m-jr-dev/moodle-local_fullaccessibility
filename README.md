# Full Accessibility (local_fullaccessibility)

Adds an accessibility menu to Moodle pages and provides user-level accessibility controls.

![Accessibility menu](pix/screenshots/01-menu.png)

---

## Requirements

- Moodle 5.0+.
- Compatible with Boost and non-Boost themes.

---

## Installation

1. Copy this folder to: `local/fullaccessibility`
2. Visit **Site administration → Notifications**
3. Configure at  
   **Site administration → Plugins → Local plugins → Full Accessibility**

---

## Features

### Text
- Font size increase / decrease
- Readable font toggle

### Contrast / Vision
- High contrast
- Invert colors
- Grayscale

### Image / Screen
- Saturation + / −
- Brightness + / −

### Reading
- Letter spacing + / −
- Line height + / −
- Underline links toggle

### Navigation
- Focus highlight
- Reduce motion

### Audio (optional — browser dependent)
- Text-to-speech  
  - Read selection  
  - Read page  
  - Stop audio
- Speech-to-text transcription

![Controls](pix/screenshots/02-controls.png)

---

## Configuration

Global enable / disable:

- Enable plugin

Feature groups can be toggled independently:

- Text
- Image / Screen
- Reading
- Navigation
- Audio
- Text-to-speech
- Speech-to-text

---

## Capabilities

- `local/fullaccessibility:use` — Use accessibility controls
- `local/fullaccessibility:manage` — Manage plugin settings

---

## Data and Privacy (GDPR)

The plugin stores accessibility preferences as a user preference:

- `local_fullaccessibility_state`

No custom database tables are created.

### Privacy API

Implements:

- `\core_privacy\local\metadata\provider`
- `\core_privacy\local\request\plugin\provider`
- `\core_privacy\local\request\core_userlist_provider`