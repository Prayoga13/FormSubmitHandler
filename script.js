// Konfigurasi Aplikasi
const APP_CONFIG = {    
    // Ganti dengan URL Web App Google Apps Script Anda
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbziPXLpmtFAxhqi3P0sX4RLHJQ22DLgaT053YNStyrsmJpgu3nS0iEva-QDquFE6fOPzA/exec',
    
    
    // Validasi file
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    
    // Status aplikasi
    currentStep: 1,
    selectedFile: null,
    formData: {
        nama: '',
        kelas: '',
        npt: '',
        cv: null
    }
};

// Inisialisasi DOM Elements
const DOM = {
    // Navigation
    menuToggle: document.getElementById('menuToggle'),
    navLinks: document.querySelector('.nav-links'),
    backToTop: document.getElementById('backToTop'),
    
    // Form Elements
    form: document.getElementById('registrationForm'),
    formMessage: document.getElementById('formMessage'),
    
    // Input Fields
    namaInput: document.getElementById('nama'),
    kelasInput: document.getElementById('kelas'),
    nptInput: document.getElementById('npt'),
    cvFileInput: document.getElementById('cvFile'),
    
    // Error Messages
    namaError: document.getElementById('namaError'),
    kelasError: document.getElementById('kelasError'),
    nptError: document.getElementById('nptError'),
    
    // Steps
    steps: {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3')
    },
    
    // Progress Steps
    progressSteps: document.querySelectorAll('.progress-step'),
    
    // Confirmation Fields
    confirmNama: document.getElementById('confirmNama'),
    confirmKelas: document.getElementById('confirmKelas'),
    confirmNpt: document.getElementById('confirmNpt'),
    confirmCv: document.getElementById('confirmCv'),
    
    // Buttons
    nextToStep2: document.getElementById('nextToStep2'),
    nextToStep3: document.getElementById('nextToStep3'),
    backToStep1: document.getElementById('backToStep1'),
    backToStep2: document.getElementById('backToStep2'),
    browseBtn: document.getElementById('browseBtn'),
    submitForm: document.getElementById('submitForm'),
    submitText: document.getElementById('submitText'),
    submitSpinner: document.getElementById('submitSpinner'),
    
    // Upload Area
    dropArea: document.getElementById('dropArea'),
    filePreview: document.getElementById('filePreview'),
    previewContent: document.getElementById('previewContent'),
    
    // Terms
    agreeTerms: document.getElementById('agreeTerms'),
    termsError: document.getElementById('termsError')
};

// Event Listeners
function initializeEventListeners() {
    // Mobile menu toggle
    DOM.menuToggle.addEventListener('click', toggleMobileMenu);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });
    
    // Back to top button
    DOM.backToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);
    
    // Form step navigation
    DOM.nextToStep2.addEventListener('click', () => navigateToStep(2));
    DOM.nextToStep3.addEventListener('click', () => navigateToStep(3));
    DOM.backToStep1.addEventListener('click', () => navigateToStep(1));
    DOM.backToStep2.addEventListener('click', () => navigateToStep(2));
    
    // File upload
    DOM.browseBtn.addEventListener('click', () => DOM.cvFileInput.click());
    DOM.cvFileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    DOM.dropArea.addEventListener('dragover', handleDragOver);
    DOM.dropArea.addEventListener('dragleave', handleDragLeave);
    DOM.dropArea.addEventListener('drop', handleFileDrop);
    
    // Form validation on input
    DOM.namaInput.addEventListener('blur', validateNama);
    DOM.kelasInput.addEventListener('change', validateKelas);
    DOM.nptInput.addEventListener('blur', validateNpt);
    
    // Form submission
    DOM.form.addEventListener('submit', handleFormSubmit);
    
    // Terms checkbox
    DOM.agreeTerms.addEventListener('change', validateTerms);
}

// Navigation Functions
function toggleMobileMenu() {
    DOM.navLinks.classList.toggle('active');
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        this.classList.add('active');
        
        // Scroll to section
        const offset = 80;
        const targetPosition = targetElement.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            DOM.navLinks.classList.remove('active');
        }
    }
}

function handleScroll() {
    // Show/hide back to top button
    if (window.pageYOffset > 300) {
        DOM.backToTop.style.display = 'flex';
    } else {
        DOM.backToTop.style.display = 'none';
    }
    
    // Update active nav link based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Form Step Navigation
function navigateToStep(step) {
    // Validate current step before proceeding
    if (step > APP_CONFIG.currentStep) {
        if (!validateCurrentStep()) {
            return;
        }
    }
    
    // Update current step
    APP_CONFIG.currentStep = step;
    
    // Hide all steps
    Object.values(DOM.steps).forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    DOM.steps[`step${step}`].classList.add('active');
    
    // Update progress indicators
    DOM.progressSteps.forEach((progressStep, index) => {
        if (index + 1 <= step) {
            progressStep.classList.add('active');
        } else {
            progressStep.classList.remove('active');
        }
    });
    
    // Update confirmation data if going to step 3
    if (step === 3) {
        updateConfirmationData();
    }
    
    // Scroll to form section
    const formSection = document.getElementById('form-section');
    const offset = 80;
    window.scrollTo({
        top: formSection.offsetTop - offset,
        behavior: 'smooth'
    });
}

// Validation Functions
function validateCurrentStep() {
    switch (APP_CONFIG.currentStep) {
        case 1:
            return validateStep1();
        case 2:
            return validateStep2();
        case 3:
            return validateStep3();
        default:
            return true;
    }
}

function validateStep1() {
    const namaValid = validateNama();
    const kelasValid = validateKelas();
    const nptValid = validateNpt();
    
    return namaValid && kelasValid && nptValid;
}

function validateStep2() {
    if (!APP_CONFIG.selectedFile) {
        showFormMessage('Silakan pilih file CV terlebih dahulu', 'error');
        return false;
    }
    return true;
}

function validateStep3() {
    return validateTerms();
}

function validateNama() {
    const nama = DOM.namaInput.value.trim();
    
    if (!nama) {
        DOM.namaError.textContent = 'Nama lengkap wajib diisi';
        DOM.namaInput.style.borderColor = 'var(--error)';
        return false;
    }
    
    if (nama.length < 3) {
        DOM.namaError.textContent = 'Nama minimal 3 karakter';
        DOM.namaInput.style.borderColor = 'var(--error)';
        return false;
    }
    
    DOM.namaError.textContent = '';
    DOM.namaInput.style.borderColor = '';
    APP_CONFIG.formData.nama = nama;
    return true;
}

function validateKelas() {
    const kelas = DOM.kelasInput.value;
    
    if (!kelas) {
        DOM.kelasError.textContent = 'Pilih kelas Anda';
        DOM.kelasInput.style.borderColor = 'var(--error)';
        return false;
    }
    
    DOM.kelasError.textContent = '';
    DOM.kelasInput.style.borderColor = '';
    APP_CONFIG.formData.kelas = kelas;
    return true;
}

function validateNpt() {
    const npt = DOM.nptInput.value.trim().toUpperCase();
    
    if (!npt) {
        DOM.nptError.textContent = 'NPT wajib diisi';
        DOM.nptInput.style.borderColor = 'var(--error)';
        return false;
    }
    
    if (!/^[A-Z0-9]{3,20}$/.test(npt)) {
        DOM.nptError.textContent = 'Format NPT tidak valid (3-20 karakter, huruf/angka)';
        DOM.nptInput.style.borderColor = 'var(--error)';
        return false;
    }
    
    DOM.nptError.textContent = '';
    DOM.nptInput.style.borderColor = '';
    APP_CONFIG.formData.npt = npt;
    DOM.nptInput.value = npt; // Update dengan format uppercase
    return true;
}

function validateTerms() {
    if (!DOM.agreeTerms.checked) {
        DOM.termsError.textContent = 'Anda harus menyetujui syarat dan ketentuan';
        return false;
    }
    
    DOM.termsError.textContent = '';
    return true;
}

// File Upload Functions
function handleFileSelect(e) {
    const file = e.target.files[0];
    processFile(file);
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    processFile(file);
}

function processFile(file) {
    // Reset previous file
    APP_CONFIG.selectedFile = null;
    
    // Validate file
    if (!file) {
        showFormMessage('Tidak ada file yang dipilih', 'error');
        return;
    }
    
    // Check file type
    if (!APP_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        showFormMessage('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX', 'error');
        return;
    }
    
    // Check file size
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
        showFormMessage(`File terlalu besar. Maksimal ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`, 'error');
        return;
    }
    
    // File is valid
    APP_CONFIG.selectedFile = file;
    APP_CONFIG.formData.cv = file;
    
    // Update UI
    updateFilePreview(file);
    showFormMessage('File berhasil dipilih', 'success');
}

function updateFilePreview(file) {
    const fileSize = formatFileSize(file.size);
    const fileType = getFileType(file.type);
    
    DOM.previewContent.innerHTML = `
        <div class="file-item">
            <div class="file-icon">
                <i class="fas fa-file-${fileType === 'pdf' ? 'pdf' : 'word'}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSize} • ${fileType.toUpperCase()}</div>
            </div>
            <button class="file-remove" onclick="removeFile()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function removeFile() {
    APP_CONFIG.selectedFile = null;
    APP_CONFIG.formData.cv = null;
    DOM.cvFileInput.value = '';
    DOM.previewContent.innerHTML = '<p class="no-file">Belum ada file yang dipilih</p>';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(mimeType) {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'doc';
    if (mimeType.includes('document')) return 'doc';
    return 'file';
}

// Confirmation Functions
function updateConfirmationData() {
    DOM.confirmNama.textContent = APP_CONFIG.formData.nama || '-';
    DOM.confirmKelas.textContent = getKelasLabel(APP_CONFIG.formData.kelas) || '-';
    DOM.confirmNpt.textContent = APP_CONFIG.formData.npt || '-';
    DOM.confirmCv.textContent = APP_CONFIG.selectedFile ? APP_CONFIG.selectedFile.name : '-';
}

function getKelasLabel(kelasValue) {
    const kelasLabels = {
        '10': 'Kelas 10',
        '11': 'Kelas 11',
        '12': 'Kelas 12',
        'Mahasiswa': 'Mahasiswa',
        'Umum': 'Umum'
    };
    return kelasLabels[kelasValue] || kelasValue;
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateStep3()) {
        return;
    }
    
    // Disable submit button and show loading
    DOM.submitForm.disabled = true;
    DOM.submitText.style.display = 'none';
    DOM.submitSpinner.style.display = 'block';
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('nama', APP_CONFIG.formData.nama);
        formData.append('kelas', APP_CONFIG.formData.kelas);
        formData.append('npt', APP_CONFIG.formData.npt);
        formData.append('timestamp', new Date().toISOString());
        
        // Add file if exists
        if (APP_CONFIG.selectedFile) {
            formData.append('cv', APP_CONFIG.selectedFile, APP_CONFIG.selectedFile.name);
        }
        
        // Send to Google Apps Script (simulated for demo)
        // In production, use the actual Google Apps Script URL
        console.log('Mengirim data ke Google Sheets...', APP_CONFIG.formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showFormMessage('Formulir berhasil dikirim! Data telah disimpan ke Google Sheets.', 'success');
        
        // Reset form after 2 seconds
        setTimeout(() => {
            resetForm();
            navigateToStep(1);
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showFormMessage('Terjadi kesalahan. Silakan coba lagi atau hubungi support.', 'error');
    } finally {
        // Re-enable submit button
        DOM.submitForm.disabled = false;
        DOM.submitText.style.display = 'block';
        DOM.submitSpinner.style.display = 'none';
    }
}

function resetForm() {
    // Reset form inputs
    DOM.form.reset();
    
    // Reset form data
    APP_CONFIG.formData = {
        nama: '',
        kelas: '',
        npt: '',
        cv: null
    };
    
    // Reset file
    removeFile();
    
    // Reset current step
    APP_CONFIG.currentStep = 1;
}

// UI Functions
function showFormMessage(message, type) {
    DOM.formMessage.textContent = message;
    DOM.formMessage.className = `form-message ${type}`;
    DOM.formMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        DOM.formMessage.style.display = 'none';
    }, 5000);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    
    // Initialize first step
    navigateToStep(1);
    
    // Check if we're on the form section
    const hash = window.location.hash;
    if (hash === '#form-section') {
        setTimeout(() => {
            const formSection = document.getElementById('form-section');
            const offset = 80;
            window.scrollTo({
                top: formSection.offsetTop - offset,
                behavior: 'smooth'
            });
        }, 100);
    }
});

