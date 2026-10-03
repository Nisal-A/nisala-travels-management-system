<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'notification_id',
        'notifiable_type',
        'notifiable_id',
        'type',
        'channel',
        'status',
        'error',
        'sent_at'
    ];

    public function notifiable()
    {
        return $this->morphTo();
    }
}
