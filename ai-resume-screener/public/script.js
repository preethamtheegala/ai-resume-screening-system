// ===========================
// GLOBAL STATE & DATA
// ===========================

const appState = {
    currentUser: null,
    userRole: null,
    currentPage: 1,
    currentHRPage: 'dashboard',
    sortedCandidates: [],
    itemsPerPage: 5
};

// Dummy candidate data
const candidatesData = [
    {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1 (555) 123-4567',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'REST API'],
        matchPercentage: 92,
        status: 'selected',
        experience: 6,
        position: 'Senior Software Engineer',
        appliedDate: 'March 15, 2024'
    },
    {
        id: 2,
        name: 'Michael Chen',
        email: 'michael@example.com',
        phone: '+1 (555) 234-5678',
        skills: ['JavaScript', 'React', 'Python', 'PostgreSQL', 'Docker'],
        matchPercentage: 88,
        status: 'selected',
        experience: 5,
        position: 'Full Stack Developer',
        appliedDate: 'March 14, 2024'
    },
    {
        id: 3,
        name: 'Emily Davis',
        email: 'emily@example.com',
        phone: '+1 (555) 345-6789',
        skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Vue.js'],
        matchPercentage: 85,
        status: 'selected',
        experience: 4,
        position: 'Frontend Developer',
        appliedDate: 'March 13, 2024'
    },
    {
        id: 4,
        name: 'James Wilson',
        email: 'james@example.com',
        phone: '+1 (555) 456-7890',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'REST API'],
        matchPercentage: 73,
        status: 'pending',
        experience: 3,
        position: 'Software Engineer',
        appliedDate: 'March 12, 2024'
    },
    {
        id: 5,
        name: 'Jessica Martinez',
        email: 'jessica@example.com',
        phone: '+1 (555) 567-8901',
        skills: ['Python', 'SQL', 'Excel', 'Tableau', 'R'],
        matchPercentage: 68,
        status: 'pending',
        experience: 2,
        position: 'Data Analyst',
        appliedDate: 'March 11, 2024'
    },
    {
        id: 6,
        name: 'Robert Thompson',
        email: 'robert@example.com',
        phone: '+1 (555) 678-9012',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Jenkins'],
        matchPercentage: 71,
        status: 'pending',
        experience: 4,
        position: 'DevOps Engineer',
        appliedDate: 'March 10, 2024'
    },
    {
        id: 7,
        name: 'Lisa Anderson',
        email: 'lisa@example.com',
        phone: '+1 (555) 789-0123',
        skills: ['JavaScript', 'Vue.js', 'Webpack', 'CSS', 'Bootstrap'],
        matchPercentage: 82,
        status: 'selected',
        experience: 3,
        position: 'Frontend Developer',
        appliedDate: 'March 9, 2024'
    },
    {
        id: 8,
        name: 'David Garcia',
        email: 'david@example.com',
        phone: '+1 (555) 890-1234',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
        matchPercentage: 64,
        status: 'rejected',
        experience: 5,
        position: 'Backend Developer',
        appliedDate: 'March 8, 2024'
    },
    {
        id: 9,
        name: 'Amanda White',
        email: 'amanda@example.com',
        phone: '+1 (555) 901-2345',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas'],
        matchPercentage: 79,
        status: 'selected',
        experience: 4,
        position: 'AI Engineer',
        appliedDate: 'March 7, 2024'
    },
    {
        id: 10,
        name: 'Chris Brown',
        email: 'chris@example.com',
        phone: '+1 (555) 012-3456',
        skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
        matchPercentage: 87,
        status: 'selected',
        experience: 5,
        position: 'Senior Frontend Developer',
        appliedDate: 'March 6, 2024'
    }
];

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkAuthStatus();
});

function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Navbar toggle
    const navbarToggle = document.getElementById('navbarToggle');
    if (navbarToggle) {
        navbarToggle.addEventListener('click', () => toggleNavbar());
    }

    // HR navbar toggle
    const hrNavbarToggle = document.getElementById('hrNavbarToggle');
    if (hrNavbarToggle) {
        hrNavbarToggle.addEventListener('click', () => toggleHRNavbar());
    }

    // Upload area drag and drop
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => document.getElementById('fileInput').click());
    }

    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Job description form
    const jobDescForm = document.getElementById('jobDescForm');
    if (jobDescForm) {
        jobDescForm.addEventListener('submit', handleJobDescSubmit);
    }

    // Search and filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterResumes);
    }

    const filterStatus = document.getElementById('filterStatus');
    const filterMatch = document.getElementById('filterMatch');
    if (filterStatus) filterStatus.addEventListener('change', filterResumes);
    if (filterMatch) filterMatch.addEventListener('change', filterResumes);

    // Initialize candidates table
    populateResumesTable();
}

// ===========================
// AUTHENTICATION
// ===========================

function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');

    if (user && role) {
        appState.currentUser = user;
        appState.userRole = role;
        showDashboard(role);
    } else {
        showLoginPage();
    }
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const role = document.getElementById('roleSelect').value;

    // Clear error messages
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';

    // Validation
    let isValid = true;

    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        isValid = false;
    }

    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        isValid = false;
    }

    if (!role) {
        showToast('Please select a role', 'error');
        isValid = false;
    }

    if (!isValid) return;

    // Dummy validation
    if ((email === 'user@example.com' && password === 'user123' && role === 'user') ||
        (email === 'hr@example.com' && password === 'hr123' && role === 'hr')) {

        // Save to localStorage
        localStorage.setItem('currentUser', email);
        localStorage.setItem('userRole', role);

        appState.currentUser = email;
        appState.userRole = role;

        showToast('Login successful!', 'success');
        showDashboard(role);
    } else {
        showToast('Invalid credentials', 'error');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    appState.currentUser = null;
    appState.userRole = null;
    showLoginPage();
    showToast('Logged out successfully', 'success');
}

// ===========================
// PAGE NAVIGATION
// ===========================

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('userSection').classList.add('hidden');
    document.getElementById('hrSection').classList.add('hidden');
}

function showDashboard(role) {
    document.getElementById('loginPage').classList.add('hidden');

    if (role === 'user') {
        document.getElementById('userSection').classList.remove('hidden');
        document.getElementById('hrSection').classList.add('hidden');
        document.getElementById('userName').textContent = appState.currentUser.split('@')[0];
        openUserPage('dashboard');
    } else if (role === 'hr') {
        document.getElementById('userSection').classList.add('hidden');
        document.getElementById('hrSection').classList.remove('hidden');
        openHRPage('dashboard');
    }
}

function openUserPage(pageName) {
    // Hide all user pages
    document.querySelectorAll('.user-page').forEach(page => {
        page.classList.add('hidden');
    });

    // Show selected page
    document.getElementById('user' + pageName.charAt(0).toUpperCase() + pageName.slice(1)).classList.remove('hidden');
    appState.currentPage = pageName;

    // Close mobile menu
    const navbarMenu = document.getElementById('navbarMenu');
    if (navbarMenu) navbarMenu.classList.remove('active');
}

function openHRPage(pageName) {
    // Hide all HR pages
    document.querySelectorAll('.hr-page').forEach(page => {
        page.classList.add('hidden');
    });

    // Show selected page
    const pageElement = document.getElementById('hr' + pageName.charAt(0).toUpperCase() + pageName.slice(1));
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }

    // Update active sidebar link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[onclick*="openHRPage('${pageName}')"]`);
    if (activeLink) {
        const sidebarLink = activeLink.closest('.sidebar-link');
        if (sidebarLink) sidebarLink.classList.add('active');
    }

    appState.currentHRPage = pageName;

    // Close mobile menu
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) sidebarNav.classList.remove('active');
}

// ===========================
// NAVBAR FUNCTIONS
// ===========================

function toggleNavbar() {
    const navbarMenu = document.getElementById('navbarMenu');
    if (navbarMenu) {
        navbarMenu.classList.toggle('active');
    }
}

function toggleHRNavbar() {
    const hrNavbarMenu = document.getElementById('hrNavbarMenu');
    if (hrNavbarMenu) {
        hrNavbarMenu.classList.toggle('active');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('hrSidebar');
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebar && sidebarNav) {
        sidebarNav.classList.toggle('active');
    }
}

// ===========================
// FILE UPLOAD FUNCTIONS
// ===========================

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').style.borderColor = '#4f46e5';
    document.getElementById('uploadArea').style.background = 'rgba(99, 102, 241, 0.1)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').style.borderColor = '#6366f1';
    document.getElementById('uploadArea').style.background = '';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('uploadArea').style.borderColor = '#6366f1';
    document.getElementById('uploadArea').style.background = '';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files: files } });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        showToast('Please upload a PDF or Word document', 'error');
        return;
    }

    // Show preview
    document.getElementById('filePreview').classList.remove('hidden');
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';

    // Simulate progress
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = '0%';
    document.getElementById('uploadStatus').textContent = 'Uploading...';

    setTimeout(() => {
        progressFill.style.width = '100%';
        document.getElementById('uploadStatus').textContent = 'Upload complete!';
    }, 2000);

    // Store file data
    window.uploadedFile = file;
}

function clearFile() {
    document.getElementById('fileInput').value = '';
    document.getElementById('filePreview').classList.add('hidden');
    window.uploadedFile = null;
}

function uploadResume() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!fullName || !email || !phone) {
        showToast('Please fill all fields', 'error');
        return;
    }

    if (!window.uploadedFile) {
        showToast('Please upload a resume', 'error');
        return;
    }

    // Simulate upload
    showToast('Resume uploaded successfully!', 'success');
    document.getElementById('fullName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    clearFile();

    setTimeout(() => {
        openUserPage('dashboard');
    }, 1000);
}

// ===========================
// HR FUNCTIONS
// ===========================

function handleJobDescSubmit(e) {
    e.preventDefault();

    const jobTitle = document.getElementById('jobTitle').value.trim();
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const requiredSkills = document.getElementById('requiredSkills').value.trim();

    if (!jobTitle || !jobDescription || !requiredSkills) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    showToast('Job description uploaded successfully!', 'success');
    document.getElementById('jobDescForm').reset();

    setTimeout(() => {
        openHRPage('resumes');
    }, 1000);
}

// ===========================
// RESUME MANAGEMENT
// ===========================

function populateResumesTable() {
    appState.sortedCandidates = [...candidatesData].sort((a, b) => b.matchPercentage - a.matchPercentage);
    displayResumesTable(appState.sortedCandidates);
}

function displayResumesTable(candidates) {
    const tableBody = document.getElementById('resumesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Pagination
    const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
    const endIndex = startIndex + appState.itemsPerPage;
    const paginatedCandidates = candidates.slice(startIndex, endIndex);

    paginatedCandidates.forEach(candidate => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${candidate.name}</td>
            <td>${candidate.email}</td>
            <td>${candidate.skills.slice(0, 3).join(', ')}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="background: var(--bg-secondary); width: 60px; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="background: ${getMatchColor(candidate.matchPercentage)}; width: ${candidate.matchPercentage}%; height: 100%;"></div>
                    </div>
                    <span style="font-weight: 600; color: ${getMatchColor(candidate.matchPercentage)};">${candidate.matchPercentage}%</span>
                </div>
            </td>
            <td>
                <span style="padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background: ${getStatusColor(candidate.status)}20; color: ${getStatusColor(candidate.status)};">
                    ${candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="action-buttons-table">
                    <button class="btn btn-small btn-tertiary" onclick="viewCandidate(${candidate.id})">View</button>
                    <button class="btn btn-small btn-secondary" onclick="updateCandidateStatus('${candidate.status}')">Action</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Pagination controls
    displayPagination(candidates.length);
}

function displayPagination(totalItems) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;

    const totalPages = Math.ceil(totalItems / appState.itemsPerPage);
    container.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '← Previous';
    prevBtn.disabled = appState.currentPage === 1;
    prevBtn.onclick = () => {
        if (appState.currentPage > 1) {
            appState.currentPage--;
            displayResumesTable(appState.sortedCandidates);
        }
    };
    container.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn' + (i === appState.currentPage ? ' active' : '');
        btn.textContent = i;
        btn.onclick = () => {
            appState.currentPage = i;
            displayResumesTable(appState.sortedCandidates);
        };
        container.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = appState.currentPage === totalPages;
    nextBtn.onclick = () => {
        if (appState.currentPage < totalPages) {
            appState.currentPage++;
            displayResumesTable(appState.sortedCandidates);
        }
    };
    container.appendChild(nextBtn);
}

function filterResumes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const matchFilter = document.getElementById('filterMatch').value;

    let filtered = candidatesData.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm) ||
                             candidate.email.toLowerCase().includes(searchTerm) ||
                             candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm));

        const matchesStatus = !statusFilter || candidate.status === statusFilter;

        let matchesMatch = true;
        if (matchFilter) {
            const threshold = parseInt(matchFilter);
            if (matchFilter === '90') matchesMatch = candidate.matchPercentage >= 90;
            else if (matchFilter === '70') matchesMatch = candidate.matchPercentage >= 70 && candidate.matchPercentage < 90;
            else if (matchFilter === '50') matchesMatch = candidate.matchPercentage >= 50 && candidate.matchPercentage < 70;
            else if (matchFilter === '0') matchesMatch = candidate.matchPercentage < 50;
        }

        return matchesSearch && matchesStatus && matchesMatch;
    });

    appState.currentPage = 1;
    appState.sortedCandidates = filtered;
    displayResumesTable(appState.sortedCandidates);
}

function sortResumes(type) {
    if (type === 'match') {
        appState.sortedCandidates.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
    displayResumesTable(appState.sortedCandidates);
    showToast('Sorted by match score', 'info');
}

function sortCandidates(type) {
    if (type === 'match-desc') {
        appState.sortedCandidates.sort((a, b) => b.matchPercentage - a.matchPercentage);
    } else if (type === 'match-asc') {
        appState.sortedCandidates.sort((a, b) => a.matchPercentage - b.matchPercentage);
    } else if (type === 'recent') {
        appState.sortedCandidates.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    }

    displayRankedCandidates();
    showToast('Candidates sorted', 'info');
}

function displayRankedCandidates() {
    const container = document.getElementById('moreRankedCandidates');
    if (!container) return;

    container.innerHTML = '';

    // Display candidates 4-10
    appState.sortedCandidates.slice(3, 10).forEach((candidate, index) => {
        const row = document.createElement('div');
        row.className = 'candidate-row';
        row.innerHTML = `
            <div class="candidate-info">
                <div class="candidate-name">#${index + 4} ${candidate.name}</div>
                <div class="candidate-position">${candidate.position}</div>
            </div>
            <div class="candidate-match">
                <div class="match-percentage">${candidate.matchPercentage}%</div>
            </div>
        `;
        container.appendChild(row);
    });
}

// ===========================
// CANDIDATE ACTIONS
// ===========================

function viewCandidate(id) {
    const candidate = candidatesData.find(c => c.id === id);
    if (candidate) {
        showToast(`Viewing ${candidate.name}'s resume`, 'info');
    }
}

function updateCandidateStatus(status) {
    if (status === 'selected') {
        showToast('Candidate marked as selected!', 'success');
    } else if (status === 'rejected') {
        showToast('Candidate marked as rejected', 'info');
    }
}

// ===========================
// EXPORT FUNCTIONS
// ===========================

function exportData(format) {
    if (format === 'csv') {
        exportToCSV();
    } else if (format === 'pdf') {
        exportToPDF();
    } else if (format === 'selected') {
        exportSelected();
    }
}

function exportToCSV() {
    let csv = 'Name,Email,Skills,Match %,Status,Experience\n';

    candidatesData.forEach(candidate => {
        csv += `"${candidate.name}","${candidate.email}","${candidate.skills.join('; ')}",${candidate.matchPercentage},"${candidate.status}",${candidate.experience}\n`;
    });

    downloadFile(csv, 'candidates.csv', 'text/csv');
    showToast('CSV exported successfully!', 'success');
}

function exportToPDF() {
    let content = 'RESUME SCREENING RESULTS\n';
    content += '========================\n\n';

    candidatesData.forEach(candidate => {
        content += `Name: ${candidate.name}\n`;
        content += `Email: ${candidate.email}\n`;
        content += `Skills: ${candidate.skills.join(', ')}\n`;
        content += `Match: ${candidate.matchPercentage}%\n`;
        content += `Status: ${candidate.status}\n`;
        content += `---\n`;
    });

    downloadFile(content, 'resume-screening.txt', 'text/plain');
    showToast('Report exported successfully!', 'success');
}

function exportSelected() {
    const selected = candidatesData.filter(c => c.status === 'selected');
    let csv = 'Name,Email,Skills,Match %,Experience\n';

    selected.forEach(candidate => {
        csv += `"${candidate.name}","${candidate.email}","${candidate.skills.join('; ')}",${candidate.matchPercentage},${candidate.experience}\n`;
    });

    downloadFile(csv, 'selected-candidates.csv', 'text/csv');
    showToast('Selected candidates exported!', 'success');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function getMatchColor(percentage) {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
}

function getStatusColor(status) {
    if (status === 'selected') return '#10b981';
    if (status === 'pending') return '#f59e0b';
    return '#ef4444';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
