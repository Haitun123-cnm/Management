# Service Management System

A comprehensive client management system for Service Department and Support Coordination teams.

## Features

### Service Department Mode
- Complete client information management
- Coordinators & Stakeholders tracking
- Family & Primary Contact management
- Caregiver Contacts
- Document management
- Progress notes and alerts
- Reminder system

### Support Coordination Mode
- Simplified NDIS client management
- Stakeholder tracking (OT, Physio, etc.)
- Family contact management
- Plan Manager information
- General notes

### Common Features
- Quick Tasks (Todo list)
- Edit Mode (Lock/Unlock for data protection)
- Client filtering (All, NDIS, iCare)
- Search functionality
- Data persistence with localStorage

## Usage

1. **Service Department**: Default mode for comprehensive client management
2. **Support Coordination**: Simplified mode for NDIS coordination
3. **Switch Modes**: Use the "Switch to Support Coordination" button in the header

## Data Storage

- All data is stored locally in your browser's localStorage
- Data is automatically saved as you type
- Each mode (Service/Coordination) has separate client lists

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

## Setup

1. Download all files
2. Open `index.html` in your web browser
3. Start managing your clients!

## File Structure

```
├── index.html          # Main application file
├── index-cloud.html    # Cloud version (if using Firebase)
├── firebase-config.js  # Firebase configuration
├── cloud-storage.js    # Cloud storage functions
├── storage.js          # Local storage functions
├── main.js            # Main application logic
└── README.md          # This file
```

## Support

For issues or questions, please contact the system administrator.
