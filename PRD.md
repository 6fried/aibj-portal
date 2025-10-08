# Product Requirements Document (PRD)
## AIESEC Portal - Analytics & Management Platform

---

## 1. Executive Summary

### 1.1 Product Overview
The AIESEC Portal is a comprehensive web-based analytics and management platform designed for AIESEC entities (Member Committees and Local Committees) to track, analyze, and manage their operational performance, recruitment activities, and exchange programs.

### 1.2 Product Vision
To provide AIESEC leaders and managers with a centralized, data-driven platform that enables real-time insights into organizational performance, streamlines recruitment processes, and facilitates informed decision-making across all AIESEC programs (OGX and ICX).

### 1.3 Target Users
- **MCVP (Member Committee Vice Presidents)**: National-level leaders requiring cross-entity analytics
- **LCVP (Local Committee Vice Presidents)**: Local-level managers focused on their entity's performance
- **Recruitment Managers**: Team members managing member recruitment and lead generation
- **Program Managers**: Leaders overseeing Global Volunteer (GV), Global Talent (GT), and Global Teacher (GTE) programs

---

## 2. Product Architecture

### 2.1 Technology Stack
- **Frontend Framework**: Next.js 15.3.4 (React 19)
- **Styling**: TailwindCSS 4 with shadcn/ui components
- **Authentication**: AIESEC OAuth with custom token management
- **Data Visualization**: Recharts
- **API Integration**: AIESEC GraphQL API
- **Language**: TypeScript 5
- **Date Handling**: date-fns 4.1.0
- **Icons**: Lucide React

### 2.2 Application Structure
```
/dashboard          → Main landing page with app navigation
/apps/performance   → Performance funnel analytics
/apps/e2e-analytics → End-to-end exchange analytics
/apps/recruitment   → Member recruitment management
/apps/leads         → Lead management and tracking
```

---

## 3. Core Features & Modules

### 3.1 Authentication & Authorization

#### 3.1.1 User Authentication
- **Login System**: AIESEC OAuth integration
- **Session Management**: Secure cookie-based sessions with `aiesec_access_token`
- **Token Refresh**: Automatic token refresh via `TokenManager`
- **API Routes**:
  - `/api/auth/callback`: OAuth callback handler
  - `/api/auth/me`: Get current user profile
  - `/api/auth/token`: Get current access token
  - `/api/auth/refresh`: Refresh expired tokens
  - `/api/auth/logout`: Clear session and logout
  - `/api/auth/token-status`: Check token validity
- **Role-Based Access Control (RBAC)**:
  - `mcvp`: Full access to all entities and national-level data
  - `lcvp`: Access restricted to assigned entity and sub-entities
  - Entity-specific permissions based on user profile

#### 3.1.2 User Profile
- User attributes:
  - `id`: Unique identifier
  - `email`: User email address
  - `name`: Full name
  - `role`: User role (mcvp/lcvp)
  - `entityId`: Associated AIESEC entity ID

---

### 3.2 Dashboard Module

#### 3.2.1 Overview
Central navigation hub providing quick access to all applications.

#### 3.2.2 Features
- **Personalized Welcome**: Displays user name
- **Application Cards**: Visual cards for each module with:
  - Icon representation
  - Title and description
  - Enabled/disabled state
  - Hover effects and animations
- **Quick Logout**: Single-click logout functionality

#### 3.2.3 Available Applications
1. **Performance**: Operational performance analysis
2. **E2E Analytics**: Exchange flow between countries
3. **Recruitment**: Member recruitment management
4. **Leads**: Lead tracking and management


---

### 3.3 Performance Module

#### 3.3.1 Purpose
Analyze and visualize operational performance across AIESEC programs (OGX and ICX) with funnel-based metrics.

#### 3.3.2 Key Features

**Filters & Controls**
- **Date Range Selection**: Custom date picker for start and end dates
- **Entity Selection**: Dropdown for MC/LC selection (MCVP can select any entity, LCVP restricted to their entity)
- **Apply Filters Button**: Explicit action to trigger data fetch
- **Cache System**: Client-side caching to avoid redundant API calls

**Data Visualization**
- **Dual Tabs**: Separate views for OGX (Outgoing Exchange) and ICX (Incoming Exchange)
- **Program Breakdown**: 4 cards per tab:
  - Total (all programs combined)
  - Global Volunteer (GV)
  - Global Talent (GTA)
  - Global Teacher (GTE)

**OGX Metrics (Outgoing Exchange)**
- Signup
- Applied
- Accepted
- Approved
- Realized
- Finished
- Completed

**ICX Metrics (Incoming Exchange)**
- Open (opportunities)
- Applied
- Accepted
- Approved
- Realized
- Finished
- Completed

**Performance Cards**
- Color-coded borders per program (Blue/Red/Cyan/Orange)
- Funnel visualization with percentage conversion rates
- Total count display for each metric
- Responsive grid layout (1 col mobile, 2 col tablet, 4 col desktop)

**Debug Mode**
- GraphQL query display card for technical debugging

#### 3.3.3 Data Flow
1. User selects entity and date range
2. Client checks cache for existing data
3. If not cached, API call to `/api/performance` with parameters:
   - `entityId`: Selected entity
   - `from`: Start date (yyyy-MM-dd)
   - `to`: End date (yyyy-MM-dd)
4. Backend constructs and executes multiple GraphQL queries in parallel
5. Results aggregated and returned to frontend
6. Data cached with key: `{entityId}-{from}-{to}`
7. Visualizations rendered with Recharts

#### 3.3.4 Error Handling
- Loading skeleton during data fetch
- Error alert with retry button
- Graceful fallback for missing data

---

### 3.4 E2E Analytics Module

#### 3.4.1 Purpose
Analyze end-to-end exchange flows between sending and hosting entities, tracking applications through all statuses.

#### 3.4.2 Key Features

**Filters**
- **Date Range**: From/To date selection
- **Sending Entity**: Country/entity sending the exchange participant
- **Hosting Entity**: Country/entity hosting the exchange participant
- **Status Filter**: Dropdown to filter by application status:
  - All
  - Applied
  - Accepted
  - Approved
  - Realized
  - Finished
  - Completed

**Office Selection**
- CSV-based office list (`List of Office IDs.csv`)
- Hierarchical structure: MC (Member Committee) and LC (Local Committee)
- Parent-child relationships tracked via `parent_id`

**Data Display**
- Search functionality to trigger data fetch
- Results count display
- Detailed table view (implementation in progress)

#### 3.4.3 Data Sources
- **Static CSV**: Office list loaded server-side
- **GraphQL API**: Exchange application data

---

### 3.5 Recruitment Module

#### 3.5.1 Purpose
Manage and track member recruitment leads (memberLeads) with filtering, search, and export capabilities.

#### 3.5.2 Key Features

**Filters & Search**
- **Date Range**: Created_at filter (default: last 15 days)
- **Search Bar**: Search by name or email (query parameter `q`)
- **Office Selection**: Dropdown for home committee selection
- **Apply Filters Button**: Explicit trigger for data fetch (prevents auto-refresh on every keystroke)

**Data Table**
- **Columns**:
  - ID
  - Nom (Last Name)
  - Email (clickable to copy)
  - Téléphone (Phone - formatted with '01' prefix for Benin numbers)
  - Date de Naissance (Date of Birth)
  - Niveau Académique (Academic Level)
  - Domaines (Backgrounds/Fields of Interest)
  - Date de Création (Created At)
  - Comité Local (Home LC)
  - Actions (Contact button)

**Phone Number Formatting**
- Automatic '01' prefix for Benin numbers (country_code 229, 8-digit numbers)
- Displayed consistently in table and CSV export

**Contact Functionality**
- "Contacter" button per lead
- Triggers GraphQL mutation `contactMemberLead(id)`
- Updates lead status to "contacted"
- Loading state during mutation
- Success/error feedback

**CSV Export**
- **Dialog-based Export**: Button opens modal to specify number of results
- **Configurable Count**: User inputs desired number of leads (1-10,000)
- **Export Columns**:
  - Nom (Last Name)
  - Prénom (First Name)
  - Email
  - Téléphone (formatted)
- **Empty Cell Handling**: "N/A" for null/empty values
- **Encoding**: UTF-8 with BOM for Excel compatibility
- **Filter Preservation**: Exports respect current filters (date, search, office)
- **API Route**: `/apps/recruitment/csv?from={date}&to={date}&home_committee={id}&q={search}&page=1&per_page={count}`

**Pagination**
- Previous/Next buttons
- Page indicator (e.g., "Page 2 of 10")
- Total items count display (e.g., "150 leads found")
- 15 items per page (default)

#### 3.5.3 GraphQL Query
```graphql
query MemberLead {
  memberLeads(
    filters: {
      created_at: { from: "...", to: "..." }
      q: "search term"
      home_committee: 175
    },
    pagination: { page: 1, per_page: 15 }
  ) {
    data {
      id
      lead_name
      date_of_birth
      email
      status
      academic_level { name }
      backgrounds { constant_name }
      country_code
      phone
      allow_phone_communication
      created_at
      home_lc { name }
    }
    paging {
      total_items
      total_pages
    }
  }
}
```

---

### 3.6 Leads Module

#### 3.6.1 Purpose
Track and manage general leads (people) registered in the AIESEC system, distinct from member recruitment leads.

#### 3.6.2 Key Features

**Filters**
- **Date Range**: Registered date filter (default: last 15 days)
- **Office Selection**: Home committee dropdown
- **Search Button**: Explicit trigger (no auto-fetch on filter change)

**Data Table**
- **Columns**:
  - Nom Complet (Full Name)
  - Email (clickable to copy)
  - Téléphone (Phone from contact_detail)
  - Date de Naissance (Date of Birth)
  - Genre (Gender)
  - Comité Local (Home LC)
  - Date de Création (Created At)
  - Statut (Status: "Contacté" or "Non Contacté" based on `contacted_at`)

**CSV Export**
- **Dialog-based Export**: Modal to specify export count
- **Export Columns**:
  - ID
  - Name
  - Email
  - Date of Birth
  - Signed Up On (created_at)
  - Contacted By (not available - shows "N/A")
  - First contacted (contacted_at)
  - Home LC
- **Empty Cell Handling**: "N/A" for null/empty values
- **API Route**: `/apps/leads/csv?start_date={date}&end_date={date}&home_committee={id}&page=1&per_page={count}`

**Pagination**
- Previous/Next buttons
- Page indicator
- Total items count display
- 100 items per page (default)

**Infinite Fetch Prevention**
- Fixed useEffect dependencies to prevent loop
- Fetch only triggered on:
  - Initial load
  - Page change
  - Explicit "Rechercher" button click

#### 3.6.3 GraphQL Query
```graphql
query People {
  people(
    filters: {
      registered: {
        from: "2025-08-01T00:00:00+01:00"
        to: "2025-10-07T23:59:59+01:00"
      }
      home_committee: [175]
    }
    pagination: { per_page: 100, page: 1 }
  ) {
    data {
      id
      full_name
      dob
      contact_detail {
        country_code
        phone
      }
      email
      created_at
      gender
      home_lc { name }
      contacted_at
    }
    paging {
      total_items
      total_pages
    }
  }
}
```

---

### 3.7 Reports Module

#### 3.7.1 Purpose
Visualize status progression over time for OGX and ICX programs using monthly breakdown analytics.

#### 3.7.2 Key Features
- **Date Range Selection**: Custom period for analysis
- **Entity Selection**: MC/LC dropdown
- **Dual Tabs**: OGX and ICX views
- **Monthly Breakdown Charts**: Line/bar charts showing progression of:
  - Applied
  - Accepted
  - Approved
  - Realized
  - Finished
  - Completed
- **French Month Labels**: Janvier, Février, Mars, etc.

#### 3.7.3 GraphQL Query
Uses AIESEC Analytics API with `breakdown_by: "month"` parameter.

---

## 4. Technical Implementation Details

### 4.1 API Routes

#### 4.1.1 `/api/performance`
- **Method**: GET
- **Parameters**: `entityId`, `from`, `to`
- **Response**: Aggregated OGX and ICX performance data
- **Backend Logic**:
  - Constructs multiple GraphQL queries (8 total: 4 for OGX, 4 for ICX)
  - Executes queries in parallel
  - Aggregates results by program and metric
  - Returns structured JSON

#### 4.1.2 `/api/recruitment`
- **Method**: GET
- **Parameters**: `from`, `to`, `home_committee`, `q`, `page`, `per_page`
- **Response**: MemberLeads data with pagination
- **Special Handling**:
  - Supports `type=suboffices` query to fetch office list
  - Default committee: 459 (AIESEC in Côte d'Ivoire)

#### 4.1.3 `/api/leads`
- **Method**: GET
- **Parameters**: `start_date`, `end_date`, `home_committee`, `page`, `per_page`
- **Response**: People data with pagination

#### 4.1.4 `/apps/recruitment/csv`
- **Method**: GET
- **Parameters**: Same as `/api/recruitment`
- **Response**: CSV file download
- **Headers**:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="leads.csv"`
- **Encoding**: UTF-8 with BOM (`\uFEFF`)

#### 4.1.5 `/apps/leads/csv`
- **Method**: GET
- **Parameters**: Same as `/api/leads`
- **Response**: CSV file download with same headers

### 4.2 GraphQL Integration

#### 4.2.1 Configuration
- **Environment Variable**: `AIESEC_GRAPHQL_URL`
- **Authentication**: Bearer token from `aiesec_access_token` cookie
- **Error Handling**: Detailed error messages with status codes

#### 4.2.2 Query Builders
- `buildOgxProgramQuery()`: OGX funnel queries
- `buildIcxProgramQuery()`: ICX funnel queries
- `buildMemberLeadQuery()`: Recruitment leads
- `buildPeopleQuery()`: General leads
- `buildStatusProgressionQuery()`: Monthly analytics
- `buildCommitteeQuery()`: Office/suboffice data
- `buildContactMemberLeadMutation()`: Contact lead action

#### 4.2.3 Fetcher Functions
- `fetchPerformanceFunnel()`: Performance data
- `fetchRecruitmentData()`: Member leads
- `fetchPeopleData()`: General leads
- `fetchSubOffices()`: Office list
- `fetchStatusProgression()`: Monthly reports
- `contactMemberLead()`: Execute contact mutation

### 4.3 State Management

#### 4.3.1 Client-Side State
- **React useState**: Local component state
- **React useCallback**: Memoized fetch functions
- **React useEffect**: Side effects and data fetching
- **React useRef**: Prevent infinite loops (e.g., `isInitialMount`)

#### 4.3.2 Caching Strategy
- **Performance Module**: In-memory cache with key `{entityId}-{from}-{to}`
- **Cache Invalidation**: Force refresh option available
- **Benefits**: Reduced API calls, faster navigation

### 4.4 UI Components

#### 4.4.1 shadcn/ui Components
- `Button`: Primary actions
- `Card`: Content containers
- `Table`: Data display
- `Select`: Dropdowns
- `Dialog`: Modals (CSV export)
- `Tabs`: OGX/ICX switching
- `DatePicker`: Date selection
- `Alert`: Error messages
- `Skeleton`: Loading states

#### 4.4.2 Custom Components
- `PerformanceFunnelCard`: Funnel visualization
- `AnalyticsFilters`: Shared filter UI
- `RecruitmentTable`: Member leads table
- `LeadsTable`: General leads table
- `DebugQueryCard`: GraphQL query display

### 4.5 Data Formatting

#### 4.5.1 Date Formatting
- **Display Format**: `dd MMM yyyy` (e.g., "07 Oct 2025")
- **API Format**: `yyyy-MM-dd` (e.g., "2025-10-07")
- **Timezone**: `+01:00` (West Africa Time)
- **Library**: date-fns with French locale

#### 4.5.2 Phone Number Formatting
- **Benin Numbers**: Automatic '01' prefix for 8-digit numbers with country_code 229
- **Logic**: `if (country_code === '229' && phone.length === 8) { phone = '01' + phone }`
- **Applied In**: Table display and CSV export

#### 4.5.3 CSV Formatting
- **Delimiter**: Comma (`,`)
- **Quoting**: All values wrapped in double quotes (`"value"`)
- **Empty Values**: Replaced with `"N/A"`
- **Encoding**: UTF-8 with BOM for Excel compatibility
- **Line Breaks**: `\n`

---

## 5. User Workflows

### 5.1 Performance Analysis Workflow
1. User logs in and navigates to Dashboard
2. Clicks "Performance" card
3. System loads default entity (MC for MCVP, user's entity for LCVP)
4. User adjusts date range and/or entity
5. User clicks "Apply Filters"
6. System checks cache, fetches if needed
7. Performance cards render with funnel data
8. User switches between OGX and ICX tabs
9. User analyzes conversion rates and totals

### 5.2 Recruitment Management Workflow
1. User navigates to "Recruitment" module
2. System loads last 15 days of leads for default office
3. User adjusts filters (date, search, office)
4. User clicks "Apply Filters"
5. Table displays leads with pagination
6. User clicks email to copy to clipboard
7. User clicks "Contacter" to mark lead as contacted
8. User clicks "Télécharger CSV" to export
9. Dialog opens, user specifies count (e.g., 1000)
10. User clicks "Télécharger" in dialog
11. CSV file downloads with filtered results

### 5.3 Lead Management Workflow
1. User navigates to "Leads" module
2. System loads last 15 days of leads
3. User adjusts filters and clicks "Rechercher"
4. Table displays leads with contact status
5. User reviews "Contacté" vs "Non Contacté" status
6. User exports CSV with specified count
7. CSV includes all lead details and contact status

---

## 6. Data Models

### 6.1 User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'mcvp' | 'lcvp';
  entityId: string;
}
```

### 6.2 MemberLead
```typescript
interface MemberLead {
  id: string;
  lead_name: string;
  date_of_birth: string;
  email: string;
  status: string;
  academic_level: { name: string };
  backgrounds: { constant_name: string }[];
  country_code: string;
  phone: string;
  allow_phone_communication: boolean;
  created_at: string;
  home_lc: { name: string };
}
```

### 6.3 Person (Lead)
```typescript
interface Person {
  id: string;
  full_name: string;
  dob: string;
  email: string;
  contact_detail: {
    country_code: string;
    phone: string;
  };
  created_at: string;
  gender: string;
  home_lc: { name: string };
  contacted_at: string | null;
}
```

### 6.4 SubOffice
```typescript
interface SubOffice {
  id: number;
  name: string;
}
```

### 6.5 Office
```typescript
interface Office {
  id: number;
  name: string;
  type: 'MC' | 'LC';
  parent_id: number | null;
}
```

### 6.6 Performance Metric
```typescript
interface PerformanceMetric {
  paging: { total_items: number };
}

interface ProgramData {
  [metric: string]: PerformanceMetric;
}

interface DepartmentData {
  total: ProgramData;
  gv: ProgramData;
  gta: ProgramData;
  gte: ProgramData;
}

interface PerformanceData {
  ogx: DepartmentData;
  icx: DepartmentData;
  query?: string;
}
```

---

## 7. Security & Privacy

### 7.1 Authentication
- **AIESEC OAuth**: Integration with AIESEC's authentication system
- **Secure Cookies**: HttpOnly cookies for access tokens (`aiesec_access_token`)
- **Token Auto-Refresh**: `TokenManager` handles automatic token renewal
- **Session Expiry**: Automatic logout on token expiration

### 7.2 Authorization
- **Role-Based Access**: MCVP vs LCVP permissions
- **Entity Restriction**: LCVP users cannot access other entities
- **Server-Side Validation**: All API routes validate user permissions

### 7.3 Data Protection
- **HTTPS Only**: All traffic encrypted (dev server uses `--experimental-https`)
- **No Client-Side Secrets**: API keys stored in environment variables
- **GraphQL Token**: Passed via Authorization header, not exposed to client

### 7.4 Input Validation
- **Type Safety**: TypeScript ensures type correctness
- **Query Sanitization**: GraphQL queries parameterized to prevent injection
- **Date Validation**: Date inputs validated before API calls

---

## 8. Performance Optimization

### 8.1 Frontend Optimization
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js Image component (if used)
- **Caching**: Client-side cache for performance data

### 8.2 Backend Optimization
- **Parallel Queries**: Multiple GraphQL queries executed concurrently
- **Server Components**: Next.js 15 server components for reduced client bundle
- **Static Data**: Office list loaded once at build/request time

### 8.3 Network Optimization
- **Compression**: Gzip/Brotli compression (Next.js default)
- **Minimal Payloads**: Only required fields fetched from GraphQL
- **Pagination**: Large datasets paginated to reduce response size

---

## 9. Error Handling & Logging

### 9.1 Frontend Error Handling
- **Try-Catch Blocks**: All async operations wrapped
- **User-Friendly Messages**: Technical errors translated to user language
- **Retry Mechanisms**: "Réessayer" buttons on error states
- **Loading States**: Skeletons and spinners during data fetch

### 9.2 Backend Error Handling
- **GraphQL Errors**: Detailed error messages from API
- **HTTP Status Codes**: Proper status codes (401, 500, etc.)
- **Error Logging**: Console errors for debugging (production logging TBD)

### 9.3 Validation Errors
- **Form Validation**: Client-side validation before submission
- **API Validation**: Server-side validation of all inputs
- **Feedback**: Clear error messages for invalid inputs

---

## 10. Accessibility

### 10.1 WCAG Compliance
- **Semantic HTML**: Proper use of headings, lists, tables
- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: All actions accessible via keyboard
- **Focus Management**: Visible focus indicators

### 10.2 Responsive Design
- **Mobile-First**: Layouts adapt from mobile to desktop
- **Breakpoints**: sm, md, lg, xl breakpoints
- **Touch Targets**: Minimum 44x44px for touch interactions

### 10.3 Internationalization
- **French UI**: All labels and messages in French
- **Date Localization**: French month names and date formats
- **Number Formatting**: European number formats (if applicable)

---

## 11. Future Enhancements

### 11.1 Planned Features
- **Team Management Module**: Manage team members and roles
- **Advanced Reports**: Custom report builder
- **Notifications**: Email/in-app notifications for key events
- **Dashboards**: Customizable dashboard widgets
- **Mobile App**: Native iOS/Android apps

### 11.2 Technical Improvements
- **Real-Time Updates**: WebSocket integration for live data
- **Offline Support**: PWA with offline capabilities
- **Advanced Caching**: Redis/Memcached for server-side caching
- **Analytics**: User behavior tracking (Google Analytics, Mixpanel)
- **Monitoring**: Error tracking (Sentry) and performance monitoring

### 11.3 Data Enhancements
- **Export Formats**: PDF, Excel (XLSX) exports
- **Bulk Actions**: Batch operations on leads
- **Advanced Filters**: More granular filtering options
- **Saved Searches**: Save and reuse filter combinations

---

## 12. Deployment & DevOps

### 12.1 Development Environment
- **Local Server**: `npm run dev` with Turbopack and HTTPS
- **Hot Reload**: Automatic page refresh on code changes
- **Environment Variables**: `.env.local` for local config

### 12.2 Build & Deployment
- **Build Command**: `npm run build`
- **Production Server**: `npm start`
- **Hosting**: Vercel (recommended) or custom Node.js server
- **CI/CD**: GitHub Actions (TBD)

### 12.3 Environment Variables
```
AIESEC_GRAPHQL_URL=https://gis-api.aiesec.org/graphql
AIESEC_OAUTH_CLIENT_ID=...
AIESEC_OAUTH_CLIENT_SECRET=...
AIESEC_OAUTH_REDIRECT_URI=...
```

### 12.4 Monitoring & Maintenance
- **Health Checks**: API endpoint health monitoring
- **Error Tracking**: Sentry integration (TBD)
- **Performance Monitoring**: Vercel Analytics or custom solution
- **Backup Strategy**: Database backups (Supabase handles this)

---

## 13. Dependencies

### 13.1 Core Dependencies
- `next`: 15.3.4
- `react`: 19.0.0
- `react-dom`: 19.0.0
- `typescript`: 5.x

### 13.2 UI & Styling
- `tailwindcss`: 4.x
- `@radix-ui/*`: Various UI primitives
- `lucide-react`: 0.525.0 (icons)
- `class-variance-authority`: 0.7.1
- `clsx`: 2.1.1
- `tailwind-merge`: 3.3.1

### 13.3 Data & API
- `date-fns`: 4.1.0
- `papaparse`: 5.5.3

### 13.4 Visualization
- `recharts`: 3.1.0

### 13.5 Development
- `@tailwindcss/postcss`: 4.x
- `eslint`: 9.x
- `eslint-config-next`: 15.3.4

---

## 14. Success Metrics

### 14.1 User Adoption
- **Target**: 80% of AIESEC Benin/Côte d'Ivoire leaders using the platform monthly
- **Measurement**: Monthly active users (MAU)

### 14.2 Performance
- **Target**: Page load time < 2 seconds
- **Measurement**: Lighthouse scores, Core Web Vitals

### 14.3 Data Accuracy
- **Target**: 99.9% accuracy in data sync with AIESEC GIS
- **Measurement**: Data validation checks, user-reported discrepancies

### 14.4 User Satisfaction
- **Target**: 4.5/5 average user rating
- **Measurement**: User surveys, feedback forms

---

## 15. Support & Documentation

### 15.1 User Documentation
- **User Guide**: Step-by-step tutorials for each module
- **FAQ**: Common questions and answers
- **Video Tutorials**: Screen recordings for key workflows

### 15.2 Technical Documentation
- **API Documentation**: GraphQL schema and endpoint docs
- **Code Comments**: Inline comments for complex logic
- **Architecture Diagrams**: System architecture and data flow

### 15.3 Support Channels
- **Email Support**: Dedicated support email
- **Slack Channel**: Real-time support for urgent issues
- **Issue Tracker**: GitHub Issues for bug reports and feature requests

---

## 16. Compliance & Standards

### 16.1 Data Privacy
- **GDPR Compliance**: User data handling per GDPR (if applicable)
- **Data Retention**: Clear policies on data storage and deletion
- **User Consent**: Explicit consent for data collection

### 16.2 Code Standards
- **ESLint**: Enforced code quality rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (TBD)
- **Git Workflow**: Feature branches, pull requests, code reviews

### 16.3 Testing (Future)
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright or Cypress
- **Coverage Target**: 80% code coverage

---

## 17. Glossary

- **AIESEC**: International youth organization focused on leadership development
- **MC**: Member Committee (national entity)
- **LC**: Local Committee (city/regional entity)
- **MCVP**: Member Committee Vice President
- **LCVP**: Local Committee Vice President
- **OGX**: Outgoing Exchange (sending participants abroad)
- **ICX**: Incoming Exchange (hosting participants from abroad)
- **GV**: Global Volunteer
- **GTA**: Global Talent (internships)
- **GTE**: Global Teacher
- **GIS**: Global Information System (AIESEC's main database)
- **Funnel**: Step-by-step progression of participants through statuses
- **Lead**: Potential member or participant
- **MemberLead**: Recruitment lead for AIESEC membership

---

## 18. Revision History

| Version | Date       | Author | Changes                          |
|---------|------------|--------|----------------------------------|
| 1.0     | 2025-10-08 | AI     | Initial PRD based on codebase    |

---

## 19. Appendix

### 19.1 Sample GraphQL Queries

**Performance Query (OGX Total)**
```graphql
query {
  signup_total: people(
    filters: {
      registered: {
        from: "2025-01-01T00:00:00+01:00"
        to: "2025-10-07T23:59:59+01:00"
      }
    }
  ) {
    paging { total_items }
  }
  applied_total: allOpportunityApplication(
    filters: {
      created_at: {
        from: "2025-01-01T00:00:00+01:00"
        to: "2025-10-07T23:59:59+01:00"
      }
      person_home_lc: 175
    }
  ) {
    paging { total_items }
  }
  # ... additional metrics
}
```

**Recruitment Query**
```graphql
query MemberLead {
  memberLeads(
    filters: {
      created_at: {
        from: "2025-09-22T00:00:00+01:00"
        to: "2025-10-07T23:59:59+01:00"
      }
      q: ""
      home_committee: 175
    }
    pagination: { page: 1, per_page: 15 }
  ) {
    data {
      id
      lead_name
      email
      phone
      # ... additional fields
    }
    paging {
      total_items
      total_pages
    }
  }
}
```

### 19.2 Committee Queries

**Get All Committees**
```graphql
query Committees {
  committees {
    data {
      id
      name
    }
  }
}
```

**Get Specific Committee with Suboffices**
```graphql
query Committee {
  committee(id: 459) {
    id
    name
    suboffices {
      id
      name
    }
  }
}
```

**Search Committees**
```graphql
query SearchCommittees {
  committees(q: "Bénin") {
    data {
      id
      name
    }
  }
}
```

### 19.3 Color Scheme
- **Primary (AIESEC Blue)**: `#037EF3`
- **Program Colors**:
  - Total: Blue (`border-blue-500`)
  - Global Volunteer: Red (`border-red-500`)
  - Global Talent: Cyan (`border-cyan-500`)
  - Global Teacher: Orange (`border-orange-500`)

---

**End of PRD**
