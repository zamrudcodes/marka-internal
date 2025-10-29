# Employee Detail Page

**Version:** 1.0  
**Date:** 2025-10-29  
**Status:** Implemented

## Overview

The Employee Detail Page provides a comprehensive view of employee information organized into multiple tabs, inspired by the Football Manager Player Analytics interface. This design allows managers and HR personnel to quickly access and manage all employee-related information in a clean, organized manner.

## Page Structure

### Header Section
- **Employee Avatar**: Large circular avatar with hover-to-upload functionality
  - Supports image cropping before upload
  - Accepts JPEG, PNG, and WebP formats (max 5MB)
- **Employee Name**: Full name displayed prominently
- **Nickname**: Preferred nickname (if available)
- **Status Badge**: Current employment status
- **Department**: Employee's department
- **Role**: Job title/role

### Tab Navigation

The page features 6 main tabs:

#### 1. Overview Tab
Quick summary of the most important employee information:
- **Basic Information**
  - Email
  - Phone Number
  - Gender
- **Employment Summary**
  - Department
  - Hire Date
  - Tenure (calculated in years and months)
- **Personal Information**
  - Birth Date
  - Age
  - Marital Status
- **Emergency Contact**
  - Phone
  - Name & Relationship

#### 2. Contract & Compensation Tab
All employment contract and payment details:
- **Contract Details**
  - Contract Status (Permanent/Contract/Probation)
  - Hire Date
  - PKWT (Indonesian employment contract)
  - PKWT Sync Status
- **Compensation**
  - Base Salary (formatted in IDR)
  - PTKP Status (Indonesian tax status)
- **Banking Information**
  - BCA Account Number
  - BPJS TK ID (Indonesian social security)
- **Lark Integration**
  - Lark User ID
  - Lark Work Email
  - Lark Status

#### 3. Performance & Tasks Tab
*Future Implementation*
- Task management
- Performance metrics
- Goals and OKRs
- 360-degree feedback

#### 4. Development & Skills Tab
*Future Implementation*
- Skills matrix with proficiency levels
- Training history
- Certifications
- Development plans
- Career milestones

#### 5. Documents Tab
Document management and additional information:
- **Identity Documents**
  - KTP Photo (Indonesian ID)
  - NPWP Photo (Indonesian tax ID)
  - Kartu Keluarga Number (Family card)
- **Additional Information**
  - Birthplace
  - Current Address
  - Instagram Handle

#### 6. History Tab
*Future Implementation*
- Timeline of employee events
- Promotions
- Salary changes
- Department transfers
- Contract renewals

## Features

### Edit Functionality
- Comprehensive edit dialog with all employee fields
- Organized into sections matching the tab structure
- Form validation
- Success/error notifications

### Avatar Management
- Click-to-upload functionality
- Image cropping tool for proper sizing
- Automatic upload to Supabase storage
- Real-time preview updates

### Responsive Design
- Mobile-friendly layout
- Adaptive grid system
- Proper scrolling on all screen sizes

## Technical Implementation

### Components Used
- **UI Components**: Card, Tabs, Dialog, Avatar, Badge, Button, Input, Select, Separator
- **Icons**: Tabler Icons for consistent visual language
- **State Management**: React hooks for local state
- **Data Fetching**: Server actions for Supabase integration

### File Structure
```
src/app/employees/[id]/
├── page.tsx          # Main employee detail page component
└── ...
```

### Key Functions
- `loadData()`: Fetches employee and department data
- `handleUpdateEmployee()`: Updates employee information
- `handleAvatarUpload()`: Manages avatar upload with cropping
- `handleCropComplete()`: Processes cropped image and uploads to storage

## Design Principles

1. **Information Hierarchy**: Most important information in Overview tab
2. **Logical Grouping**: Related information grouped together
3. **Progressive Disclosure**: Detailed information available in specific tabs
4. **Visual Consistency**: Consistent card-based layout throughout
5. **Accessibility**: Clear labels, proper contrast, keyboard navigation

## Future Enhancements

### Performance & Tasks Tab
- Integration with task management system
- Performance review history
- Goal tracking with progress indicators
- Peer feedback collection

### Development & Skills Tab
- Interactive skills radar chart (similar to FM attribute analysis)
- Training course catalog integration
- Certification tracking
- Career path visualization

### History Tab
- Comprehensive audit log
- Timeline visualization
- Event filtering and search
- Export functionality

## Related Documentation
- [Product Requirements Document](../PRODUCT_REQUIREMENTS.md)
- [Bonus Calculation Design](../bonus-calculation-design.md)