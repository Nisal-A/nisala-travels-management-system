<?php

namespace App\Services\Messaging\Providers;

use App\Contracts\MessagingProvider;
use App\Services\Messaging\MessageResult;
use Illuminate\Support\Facades\Http;

class TwilioProvider implements MessagingProvider
{
    protected string $sid;
    protected string $token;
    protected string $from;

    public function __construct()
    {
        $this->sid = config('messaging.providers.twilio.sid');
        $this->token = config('messaging.providers.twilio.token');
        $this->from = config('messaging.providers.twilio.from');
    }

    public function send(string $to, string $message, array $options = []): MessageResult
    {
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json";
        
        $response = Http::withBasicAuth($this->sid, $this->token)
            ->asForm()
            ->post($url, [
                'To' => $to,
                'From' => $this->from,
                'Body' => $message,
            ]);

        if ($response->successful()) {
            return new MessageResult(true, null, $response->json('sid'));
        }

        return new MessageResult(false, $response->json('message', 'Unknown Twilio Error'));
    }
}
