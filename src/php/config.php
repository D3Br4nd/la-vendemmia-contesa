<?php
/**
 * Configuration file for La Vendemmia Contesa
 */

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Game configuration
define('GAME_NAME', 'La Vendemmia Contesa');
define('GAME_VERSION', '1.0');
define('MAX_SCORE_LENGTH', 10);
define('MAX_NAME_LENGTH', 20);

// File paths
define('DATA_DIR', '../data/');
define('LEADERBOARD_FILE', DATA_DIR . 'classifica.csv');

// Security settings
define('CSRF_TOKEN_LENGTH', 32);
define('MAX_SCORES_PER_IP', 5);
define('SCORE_COOLDOWN', 60); // seconds

// Ensure data directory exists
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Initialize leaderboard file if not exists
if (!file_exists(LEADERBOARD_FILE)) {
    file_put_contents(LEADERBOARD_FILE, "Nome,Punteggio,Data,IP\n");
}

/**
 * Sanitize input string
 */
function sanitize_input($input, $max_length = 255) {
    $input = trim($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return substr($input, 0, $max_length);
}

/**
 * Validate score value
 */
function validate_score($score) {
    return is_numeric($score) && $score >= 0 && $score <= 9999999;
}

/**
 * Get client IP address
 */
function get_client_ip() {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Generate CSRF token
 */
function generate_csrf_token() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(CSRF_TOKEN_LENGTH));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verify_csrf_token($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
?>
