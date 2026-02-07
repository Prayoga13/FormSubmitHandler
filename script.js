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
        const formData = {
            nama: APP_CONFIG.formData.nama,
            kelas: APP_CONFIG.formData.kelas,
            npt: APP_CONFIG.formData.npt,
            timestamp: new Date().toISOString()
        };
        
        // Kirim ke Google Apps Script
        const response = await sendToGoogleSheets(formData);
        
        if (response.success) {
            showFormMessage('✅ Formulir berhasil dikirim! Data telah disimpan ke Google Sheets.', 'success');
            
            // Reset form setelah 2 detik
            setTimeout(() => {
                resetForm();
                navigateToStep(1);
            }, 2000);
        } else {
            throw new Error(response.message || 'Gagal mengirim data');
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        showFormMessage(`❌ ${error.message}`, 'error');
    } finally {
        // Re-enable submit button
        DOM.submitForm.disabled = false;
        DOM.submitText.style.display = 'block';
        DOM.submitSpinner.style.display = 'none';
    }
}

// Function untuk mengirim data ke Google Sheets
async function sendToGoogleSheets(data) {
    // GANTI INI DENGAN URL WEB APP ANDA
    const SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
    
    // Buat parameter URL
    const params = new URLSearchParams();
    params.append('nama', data.nama);
    params.append('kelas', data.kelas);
    params.append('npt', data.npt);
    params.append('timestamp', data.timestamp);
    
    // Kirim dengan fetch
    const response = await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'GET', // atau 'POST' tergantung Apps Script
        mode: 'no-cors' // untuk bypass CORS
    });
    
    // Karena mode 'no-cors', kita tidak bisa membaca response
    // Tapi kita anggap berhasil jika tidak ada error jaringan
    return { success: true, message: 'Data terkirim' };
    
    // ALTERNATIF: Jika ingin membaca response, gunakan proxy
    // return await sendViaProxy(SCRIPT_URL, data);
}
