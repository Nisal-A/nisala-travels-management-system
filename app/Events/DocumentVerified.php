<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\CustomerDocument;

class DocumentVerified
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $document;

    public function __construct(CustomerDocument $document)
    {
        $this->document = $document;
    }
}
