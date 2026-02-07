<?php
// proxy.php - Untuk bypass CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $url = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
    
    $data = [
        'nama' => $_POST['nama'] ?? '',
        'kelas' => $_POST['kelas'] ?? '',
        'npt' => $_POST['npt'] ?? '',
        'timestamp' => $_POST['timestamp'] ?? date('c')
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    echo $response ?: json_encode(['status' => 'error', 'message' => 'No response']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
