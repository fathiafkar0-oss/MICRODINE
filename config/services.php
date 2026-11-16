<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway (Modul F)
    |--------------------------------------------------------------------------
    |
    | driver: 'simulated' (default, demo offline) atau 'midtrans' (sandbox QRIS).
    | Lihat ARCHITECTURE.md Bab 8 & API_CONTRACT.md Bab 5.1.
    |
    */
    'midtrans' => [
        'driver' => env('PAYMENT_GATEWAY_DRIVER', 'simulated'),
        'server_key' => env('MIDTRANS_SERVER_KEY', ''),
        'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),
    ],

];
