<?php

namespace App\Services\Messaging;

class MessageResult
{
    public bool $success;
    public ?string $error;
    public ?string $messageId;

    public function __construct(bool $success, ?string $error = null, ?string $messageId = null)
    {
        $this->success = $success;
        $this->error = $error;
        $this->messageId = $messageId;
    }
}
