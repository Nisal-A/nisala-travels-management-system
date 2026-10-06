<?php

namespace App\Services\Messaging\Providers;

use App\Contracts\MessagingProvider;
use App\Services\Messaging\MessageResult;

class NullProvider implements MessagingProvider
{
    public function send(string $to, string $message, array $options = []): MessageResult
    {
        // Does nothing
        return new MessageResult(true, null, 'null-' . uniqid());
    }
}
