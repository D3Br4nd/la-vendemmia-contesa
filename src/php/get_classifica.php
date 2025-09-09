<?php
/**
 * Get leaderboard endpoint for La Vendemmia Contesa
 */

require_once 'config.php';

// Set JSON content type
header('Content-Type: application/json');

// Handle CORS
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

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get query parameters
    $limit = (int) ($_GET['limit'] ?? 10);
    $offset = (int) ($_GET['offset'] ?? 0);
    
    // Validate parameters
    $limit = max(1, min(100, $limit)); // Between 1 and 100
    $offset = max(0, $offset);
    
    // Read leaderboard file
    if (!file_exists(LEADERBOARD_FILE)) {
        echo json_encode([
            'success' => true,
            'data' => [],
            'total' => 0,
            'message' => 'Nessun punteggio ancora registrato'
        ]);
        exit;
    }
    
    $lines = file(LEADERBOARD_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $scores = [];
    
    // Parse CSV data (skip header)
    foreach ($lines as $i => $line) {
        if ($i === 0) continue; // Skip header
        
        $data = str_getcsv($line);
        if (count($data) >= 3) {
            $scores[] = [
                'nome' => sanitize_input($data[0]),
                'punteggio' => (int) $data[1],
                'data' => $data[2],
                // Don't expose IP addresses
            ];
        }
    }
    
    // Sort by score (descending)
    usort($scores, function($a, $b) {
        if ($a['punteggio'] === $b['punteggio']) {
            // If scores are equal, sort by date (earlier is better)
            return strtotime($a['data']) - strtotime($b['data']);
        }
        return $b['punteggio'] - $a['punteggio'];
    });
    
    $total = count($scores);
    
    // Apply pagination
    $paged_scores = array_slice($scores, $offset, $limit);
    
    // Add position numbers
    foreach ($paged_scores as $index => &$score) {
        $score['posizione'] = $offset + $index + 1;
        // Format date for display
        $score['data_formatted'] = date('d/m/Y H:i', strtotime($score['data']));
    }
    
    // Success response
    echo json_encode([
        'success' => true,
        'data' => $paged_scores,
        'pagination' => [
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total
        ],
        'meta' => [
            'game' => GAME_NAME,
            'version' => GAME_VERSION,
            'generated_at' => date('c')
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Errore nel recuperare la classifica',
        'details' => $e->getMessage()
    ]);
}
?>
