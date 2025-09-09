<?php
/**
 * Save score endpoint for La Vendemmia Contesa
 */

require_once 'config.php';

// Set JSON content type
header('Content-Type: application/json');

// Handle CORS for game domain
$allowed_origins = [
    'http://localhost',
    'http://localhost:8080',
    'https://rm.prolocoventicano.com',
    'http://rm.prolocoventicano.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields
    if (empty($input['nome']) || empty($input['punteggio'])) {
        throw new Exception('Nome e punteggio sono richiesti');
    }
    
    // Verify CSRF token
    if (empty($input['csrf_token']) || !verify_csrf_token($input['csrf_token'])) {
        throw new Exception('Token di sicurezza non valido');
    }
    
    // Sanitize and validate input
    $nome = sanitize_input($input['nome'], MAX_NAME_LENGTH);
    $punteggio = (int) $input['punteggio'];
    
    if (empty($nome)) {
        throw new Exception('Nome non valido');
    }
    
    if (!validate_score($punteggio)) {
        throw new Exception('Punteggio non valido');
    }
    
    // Get client info
    $client_ip = get_client_ip();
    $timestamp = date('Y-m-d H:i:s');
    
    // Rate limiting check
    $recent_scores = 0;
    if (file_exists(LEADERBOARD_FILE)) {
        $lines = file(LEADERBOARD_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $cutoff_time = time() - SCORE_COOLDOWN;
        
        foreach ($lines as $line) {
            $data = str_getcsv($line);
            if (count($data) >= 4) {
                $line_ip = $data[3] ?? '';
                $line_time = strtotime($data[2] ?? '');
                
                if ($line_ip === $client_ip && $line_time > $cutoff_time) {
                    $recent_scores++;
                }
            }
        }
    }
    
    if ($recent_scores >= MAX_SCORES_PER_IP) {
        throw new Exception('Troppi tentativi. Riprova tra qualche minuto.');
    }
    
    // Prepare CSV line
    $csv_line = [
        $nome,
        $punteggio,
        $timestamp,
        $client_ip
    ];
    
    // Lock file for writing
    $lock_file = DATA_DIR . '.leaderboard.lock';
    $lock_handle = fopen($lock_file, 'w');
    
    if (!$lock_handle || !flock($lock_handle, LOCK_EX)) {
        throw new Exception('Impossibile salvare il punteggio. Riprova.');
    }
    
    // Write to CSV
    $csv_handle = fopen(LEADERBOARD_FILE, 'a');
    if (!$csv_handle) {
        throw new Exception('Errore nel salvare il punteggio');
    }
    
    fputcsv($csv_handle, $csv_line);
    fclose($csv_handle);
    
    // Release lock
    flock($lock_handle, LOCK_UN);
    fclose($lock_handle);
    unlink($lock_file);
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Punteggio salvato con successo!',
        'data' => [
            'nome' => $nome,
            'punteggio' => $punteggio,
            'posizione' => get_leaderboard_position($punteggio)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Get position in leaderboard for given score
 */
function get_leaderboard_position($score) {
    if (!file_exists(LEADERBOARD_FILE)) {
        return 1;
    }
    
    $lines = file(LEADERBOARD_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $scores = [];
    
    foreach ($lines as $i => $line) {
        if ($i === 0) continue; // Skip header
        
        $data = str_getcsv($line);
        if (count($data) >= 2) {
            $scores[] = (int) $data[1];
        }
    }
    
    rsort($scores); // Sort descending
    
    $position = 1;
    foreach ($scores as $existing_score) {
        if ($score > $existing_score) {
            break;
        }
        $position++;
    }
    
    return $position;
}
?>
