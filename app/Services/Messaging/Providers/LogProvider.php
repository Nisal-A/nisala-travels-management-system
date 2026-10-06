<?php

namespace App\Services\Messaging\Providers;

use App\Contracts\MessagingProvider;
use App\Services\Messaging\MessageResult;
use Illuminate\Support\Facades\Log;

class LogProvider implements MessagingProvider
{
    public function send(string $to, string $message, array $options = []): MessageResult
    {
        Log::info("SMS/WhatsApp Message to {$to}: {$message}", $options);
        return new MessageResult(true, null, 'log-' . uniqid());
    }
}
