<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RevalidateNextJs implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $tags;

    public function __construct(array $tags)
    {
        $this->tags = $tags;
    }

    public function backoff(): array
    {
        return [10, 60, 300];
    }

    public function handle(): void
    {
        $url = config('services.nextjs.revalidate_url');

        if (empty($url)) {
            Log::info('Next.js revalidate URL is empty. Skipping revalidation.');

            return;
        }

        $secret = config('services.nextjs.revalidate_secret');

        $response = Http::timeout(10)
            ->withHeader('X-Nisala-Secret', $secret ?? '')
            ->post($url, [
                'tags' => $this->tags,
            ]);

        if ($response->failed()) {
            $jobId = $this->job ? $this->job->getJobId() : 'unknown';
            Log::error("Next.js revalidation failed with status {$response->status()} for job id {$jobId}.");

            throw new \RuntimeException("Next.js revalidation request failed with status {$response->status()}");
        }
    }
}
