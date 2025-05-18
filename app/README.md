# StudyAgora App Structure

This document outlines the structure of the StudyAgora app codebase after the restructuring to improve maintainability.

## Directory Structure

```
app/
├── screens/
│   ├── curriculums/      # Curriculum listing and management
│   ├── subjects/         # Subject listing and management
│   ├── courses/          # Course listing and management
│   └── legacy/           # (Optional) Old screen files for reference
├── components/
│   ├── common/           # Shared UI components
│   ├── courses/          # Course-specific components
│   ├── subjects/         # Subject-specific components
│   └── curriculums/      # Curriculum-specific components
├── navigation/           # Navigation configuration
├── services/
│   ├── api/              # API services for data fetching
│   └── utils/            # Utility functions
└── ...
```

## Key Components

### Common Components
- `ThumbnailPicker.js`: Reusable component for selecting and uploading thumbnail images
- `Breadcrumbs.js`: Navigation breadcrumb component
- `Button.js`: Custom button component

### Screen Components
- Curriculum screens: For managing learning pathways
- Subject screens: For managing subjects within curriculums
- Course screens: For managing courses within subjects

### Service Layer
- Each entity has its own service file (courseService.js, subjectService.js, etc.)
- File upload functionality is centralized in fileUploadService.js

## Implementation Notes

1. Each screen is focused on a single responsibility
2. Common functionality is extracted into reusable components
3. API calls are handled through service modules
4. File upload uses direct binary approach to prevent file corruption

## Migration Plan

1. Update imports in the app entry point to use the new MainNavigator
2. Test all functionality to ensure it works as expected
3. Remove any unused legacy files
