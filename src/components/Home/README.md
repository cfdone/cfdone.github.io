# Home Page Components

This directory contains all the components that make up the Home page of the CFD application. The original monolithic `Home.jsx` has been broken down into smaller, more manageable components.

## Components

### Core Components

- **`Header.jsx`** - The main header section with greeting, time, progress bar, and logo
- **`CurrentClassCard.jsx`** - Card displaying the currently active class
- **`NextClassCard.jsx`** - Card displaying the next upcoming class
- **`StatusCard.jsx`** - Status messages (free time, all classes complete, no classes today)
- **`ViewToggle.jsx`** - Toggle button to switch between Today and Weekly views

### Schedule Components

- **`TodaySchedule.jsx`** - Today's classes view with individual class cards
- **`WeeklySchedule.jsx`** - Weekly schedule view with all days
- **`ClassCard.jsx`** - Individual class card component used in today's schedule

### Utility Components

- **`NoTimetableData.jsx`** - Fallback component when no timetable data is available

## Component Structure

```
Home.jsx (main page)
├── NoTimetableData.jsx (fallback)
└── Main Layout
    ├── Header.jsx
    ├── CurrentClassCard.jsx
    ├── NextClassCard.jsx
    ├── StatusCard.jsx
    ├── ViewToggle.jsx
    └── Schedule Views
        ├── TodaySchedule.jsx
        │   └── ClassCard.jsx (multiple)
        └── WeeklySchedule.jsx
```

## Props Structure

Each component receives only the props it needs to function, promoting better separation of concerns and making the components more predictable and testable.

## Usage

All components are exported through the `index.js` file for easy importing:

```javascript
import {
  Header,
  CurrentClassCard,
  NextClassCard,
  StatusCard,
  TodaySchedule,
  WeeklySchedule,
  NoTimetableData,
  ViewToggle,
} from '../components/Home'
```
