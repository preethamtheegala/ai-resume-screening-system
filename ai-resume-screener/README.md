# AI-Based Intelligent Resume Screening System

A complete, modern, and responsive frontend web application for intelligent resume screening with dual-role support (Job Applicants and HR Managers).

## 📁 Project Structure

```
.
├── index.html      # Complete HTML structure (1073 lines)
├── style.css       # Responsive styling with animations (1985 lines)
├── script.js       # Full frontend functionality (767 lines)
└── README.md       # This file
```

## 🎯 Features

### ✅ Login Module
- Email/Username input validation
- Password authentication
- Role selection (User/HR)
- Demo credentials for testing
- Form validation with error messages
- Responsive login card with gradient background

### 👤 User Module (Job Applicants)

#### Dashboard
- Quick action cards for Resume Upload, Match Results, and Selection Status
- Statistics display (Positions Applied, Matched, Average Score)
- Modern card UI with hover effects

#### Resume Upload
- Drag-and-drop file upload area
- File type validation (PDF, DOC, DOCX)
- File preview with size display
- Upload progress simulation
- Animated progress bar
- Form validation for contact information

#### Match Results
- Multiple position results display
- Animated circular progress indicators showing match percentages
- Skills match breakdown
- Experience and education matching
- Status badges (Selected/Pending/Not Selected)
- Skill tags display
- Match score visualization

#### Profile & Status
- User profile information display
- Selection status timeline
- Application progress tracking
- Timeline animation with completion states

### 👔 HR/Admin Module

#### Dashboard
- Key statistics cards (Total Resumes, Selected, Pending, Rejected)
- Match score distribution chart
- Application timeline statistics
- Quick action buttons

#### Resume Management
- Searchable candidates table
- Filter by status and match score
- Pagination support (5 items per page)
- Sort functionality
- Color-coded match scores
- View and action buttons for each candidate

#### Upload Job Description
- Structured form with required fields
- Job title, department, level selection
- Minimum experience input
- Full job description textarea
- Required and preferred skills input
- Education qualification dropdown
- Form validation

#### Sorting & Ranking
- Top 3 candidates cards with rank badges
- Match percentage visualization
- Skill tags display
- Multiple sorting options (High-to-Low, Low-to-High, Recent)
- Extended candidate list with rankings

#### Selected Candidates
- Grid display of selected candidates
- Candidate profile cards with match scores
- Experience and applied date information
- Action buttons (Schedule Interview, View Resume)

#### Pending Reviews
- List of candidates awaiting HR decision
- Match percentage badges
- Position information
- Action buttons (Select, Reject, View Resume)

#### Export Results
- Multiple export formats (CSV, PDF, Plain Text)
- Export selected candidates only
- Customizable export options
- File download functionality

## 🔐 Demo Credentials

### Job Applicant Account
- **Email:** user@example.com
- **Password:** user123
- **Role:** Job Applicant

### HR Manager Account
- **Email:** hr@example.com
- **Password:** hr123
- **Role:** HR Manager

## 🎨 Design Features

### Modern UI/UX
- **Gradient backgrounds:** Professional color gradients
- **Responsive layout:** Mobile-first design
- **Smooth animations:** Fade-in, slide, pulse animations
- **Card-based interface:** Clean, organized layout
- **Color scheme:** Professional blue and teal palette
- **Typography:** Clear hierarchy with multiple font sizes
- **Icons:** Font Awesome 6.4.0 icons throughout

### Responsive Breakpoints
- **Desktop:** Full layout (1024px+)
- **Tablet:** Optimized grid and sidebar (768px-1023px)
- **Mobile:** Single column, hamburger menu (<768px)
- **Small Mobile:** Further optimizations (<480px)

### Interactive Elements
- **Hover effects:** Card lift, color changes
- **Form validation:** Real-time feedback
- **Progress bars:** Animated fill animations
- **Pagination:** Easy navigation through data
- **Toast notifications:** Success/error messages
- **Drag-and-drop:** File upload experience
- **Mobile menu:** Hamburger navigation toggle

## 🚀 How to Use

### 1. Opening the Application
- Save all three files (index.html, style.css, script.js) in the same folder
- Open `index.html` in a modern web browser
- Or drag `index.html` to your browser window

### 2. Login
- Select your role (Job Applicant or HR Manager)
- Use demo credentials provided above
- Click Login

### 3. As a Job Applicant
1. **Dashboard:** View your overview and quick actions
2. **Upload Resume:** 
   - Drag-drop or click to select resume file
   - Fill contact information
   - Click "Upload Resume"
3. **View Results:** Check your match scores across positions
4. **Profile:** View your account information
5. **Status:** Track your application progress

### 4. As an HR Manager
1. **Dashboard:** View recruitment statistics
2. **Upload Job Description:** Add new job openings
3. **Resume Management:** 
   - Search candidates by name/skills
   - Filter by status and match score
   - Use pagination to navigate
4. **Sorting & Ranking:** View top candidates and sort options
5. **Selected Candidates:** Manage accepted candidates
6. **Pending Reviews:** Make accept/reject decisions
7. **Export Results:** Download screening results in CSV/PDF

## 💻 Technologies Used

- **HTML5:** Semantic markup
- **CSS3:** Modern styling with flexbox and grid
- **Vanilla JavaScript:** No dependencies required
- **Font Awesome 6.4.0:** Icon library
- **LocalStorage:** Session persistence

## 📊 Dummy Data

The application includes 10 dummy candidates with:
- Complete profile information
- Skills and experience data
- Match percentage scores
- Status information
- Application dates
- Contact details

All data is stored in JavaScript and loads locally without backend requirements.

## ✨ Key JavaScript Features

- **Login validation:** Email, password, role checking
- **Sidebar toggle:** Responsive navigation
- **File upload:** Drag-drop with preview
- **Search/Filter:** Real-time candidate filtering
- **Sorting:** Multiple sort options
- **Dynamic table:** Pagination with controls
- **Export:** CSV/PDF download functionality
- **Toast notifications:** User feedback system
- **LocalStorage:** Session management
- **Responsive menus:** Mobile hamburger navigation

## 🔄 State Management

The application uses a simple global state object (`appState`) that tracks:
- Current logged-in user
- User role
- Current page/section
- Sorted candidates list
- Pagination state

## 📱 Browser Compatibility

Works on all modern browsers supporting:
- ES6 JavaScript
- CSS3 Flexbox and Grid
- LocalStorage API
- HTML5 File API

Tested on:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## 📝 Notes

- All data is frontend-only (no backend server needed)
- File uploads simulate the process without actual storage
- All styling is responsive and mobile-optimized
- No external backend API calls required
- Ready to run locally in any browser

## 🎓 Learning Resources

- View the clean, well-commented code structure
- Learn modern CSS practices (Grid, Flexbox, Animations)
- Understand form validation patterns
- Study responsive design breakpoints
- See localStorage implementation

## 📄 File Sizes

- **index.html:** 52 KB (1073 lines)
- **style.css:** 36 KB (1985 lines)
- **script.js:** 25 KB (767 lines)
- **Total:** ~113 KB (fully functional, no dependencies)

## ✅ Tested Features

- ✓ Login/logout functionality
- ✓ Role-based navigation
- ✓ File upload with preview
- ✓ Search and filtering
- ✓ Pagination
- ✓ Sorting
- ✓ Export functionality
- ✓ Responsive design
- ✓ Mobile navigation
- ✓ Toast notifications
- ✓ Form validation

---

**Created:** May 9, 2024  
**Version:** 1.0  
**Status:** Production Ready ✨
