<?php

namespace App\Contracts;

use App\Services\Messaging\MessageResult;

interface MessagingProvider
{
    /**
     * Send a message to a given phone number.
     *
     * @param string $to The recipient phone number.
     * @param string $message The message content.
     * @param array $options Additional options (e.g. channel specific templates).
     * @return MessageResult
     */
    public function send(string $to, string $message, array $options = []): MessageResult;
}
