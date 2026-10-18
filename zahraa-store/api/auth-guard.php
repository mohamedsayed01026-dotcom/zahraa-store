<?php
/**
 * ZAHRA (زهرة) - Authentication Guard
 * Protects administrative endpoints against unauthenticated access.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireAdminAuth() {
    header('Content-Type: application/json; charset=utf-8');

    if (empty($_SESSION['zahra_admin_auth']) || $_SESSION['zahra_admin_auth'] !== true) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'غير مصرح: يجب تسجيل الدخول كمدير للوصول إلى هذه الصفحة أو تنفيذ الإجراء.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
