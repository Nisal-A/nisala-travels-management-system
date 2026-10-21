<?php

use App\Models\Destination;
use App\Models\MemoryMedia;
use App\Models\MemoryYear;
use App\Models\User;
use App\Services\MemoryPublishingService;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
    Storage::fake('private');
});

/* =========================================================================
 * 1. Role Authorization Tests
 * ========================================================================= */

test('super_admin and manager can access admin memories, staff and customer cannot', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $manager = User::factory()->manager()->create();
    $staff = User::factory()->staff()->create();
    $customer = User::factory()->customer()->create();

    // Super Admin: 200
    $this->actingAs($superAdmin)
        ->get('/admin/memories')
        ->assertStatus(200);

    // Manager: 200
    $this->actingAs($manager)
        ->get('/admin/memories')
        ->assertStatus(200);

    // Staff: 403 Forbidden
    $this->actingAs($staff)
        ->get('/admin/memories')
        ->assertStatus(403);

    // Customer: 403 Forbidden
    $this->actingAs($customer)
        ->get('/admin/memories')
        ->assertStatus(403);

    // Guest: 302 Redirect to Login
    $this->app['auth']->logout();
    $this->get('/admin/memories')
        ->assertRedirect('/login');
});

/* =========================================================================
 * 2. Image Limit: The 11th image is rejected
 * ========================================================================= */

test('the 11th image is rejected by the service and form request', function () {
    $manager = User::factory()->manager()->create();
    $service = app(MemoryPublishingService::class);

    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Highland Wonders',
        'summary' => 'Year of peaks and trails.',
        'consent_confirmed_at' => now(),
    ]);

    // Attach 10 valid images
    for ($i = 1; $i <= 10; $i++) {
        $file = UploadedFile::fake()->image("photo_{$i}.jpg", 600, 400);
        $service->addImage($year, $file, "Alt text {$i}", "Caption {$i}");
    }

    expect($year->media()->where('type', 'image')->count())->toBe(10);

    // Service check: 11th image throws ValidationException
    $file11 = UploadedFile::fake()->image('photo_11.jpg', 600, 400);
    try {
        $service->addImage($year, $file11, 'Alt 11');
        $this->fail('Expected ValidationException when uploading the 11th image.');
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('image');
    }

    // Controller/HTTP check: 11th image rejected via POST with 422
    $response = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => UploadedFile::fake()->image('photo_11_http.jpg', 600, 400),
        'alt_text' => '11th Photo via HTTP',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['image']);

    expect($year->media()->where('type', 'image')->count())->toBe(10);
});

/* =========================================================================
 * 3. Video Limit: The third video is rejected
 * ========================================================================= */

test('the third video is rejected by the service and form request', function () {
    $manager = User::factory()->manager()->create();
    $service = app(MemoryPublishingService::class);

    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Coastal Expedition',
        'summary' => 'Scenic shores and blue seas.',
        'consent_confirmed_at' => now(),
    ]);

    // Attach 2 valid videos
    $service->addVideo($year, 'https://www.youtube.com/watch?v=video1', 'Video 1');
    $service->addVideo($year, 'https://www.youtube.com/watch?v=video2', 'Video 2');

    expect($year->media()->where('type', 'video')->count())->toBe(2);

    // Service check: 3rd video throws ValidationException
    try {
        $service->addVideo($year, 'https://www.youtube.com/watch?v=video3', 'Video 3');
        $this->fail('Expected ValidationException when adding the 3rd video.');
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('video');
    }

    // Controller/HTTP check: 3rd video rejected with 422
    $response = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'video',
        'external_url' => 'https://www.youtube.com/watch?v=video3_http',
        'caption' => 'Video 3 HTTP',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['video']);

    expect($year->media()->where('type', 'video')->count())->toBe(2);
});

/* =========================================================================
 * 4. Consent and Media: Publish without consent is rejected
 * ========================================================================= */

test('publish without consent is rejected', function () {
    $manager = User::factory()->manager()->create();
    $service = app(MemoryPublishingService::class);

    // Year with NO consent confirmed
    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Ancient Temples',
        'summary' => 'Sacred sanctuaries.',
        'consent_confirmed_at' => null,
        'is_published' => false,
    ]);

    // Add media so media requirement is satisfied
    $service->addVideo($year, 'https://www.youtube.com/watch?v=ancient', 'Ancient Temples');

    // Service check: publish throws ValidationException
    try {
        $service->publish($year);
        $this->fail('Expected ValidationException when publishing without consent.');
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('consent_confirmed_at');
    }

    expect($year->fresh()->is_published)->toBeFalse();

    // HTTP check: toggle-publish rejected with 422
    $response = $this->actingAs($manager)->patchJson("/admin/memories/{$year->id}/toggle-publish");

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['consent_confirmed_at']);

    expect($year->fresh()->is_published)->toBeFalse();
});

test('publish without media is rejected', function () {
    $manager = User::factory()->manager()->create();
    $service = app(MemoryPublishingService::class);

    // Year with consent, but 0 media items
    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Empty Media Year',
        'summary' => 'No photos or videos yet.',
        'consent_confirmed_at' => now(),
        'is_published' => false,
    ]);

    try {
        $service->publish($year);
        $this->fail('Expected ValidationException when publishing without media items.');
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('media');
    }

    $response = $this->actingAs($manager)->patchJson("/admin/memories/{$year->id}/toggle-publish");
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['media']);

    expect($year->fresh()->is_published)->toBeFalse();
});

/* =========================================================================
 * 5. Disguised PHP File: A PHP file disguised as an image is rejected
 * ========================================================================= */

test('a PHP file disguised as an image is rejected', function () {
    $manager = User::factory()->manager()->create();
    $service = app(MemoryPublishingService::class);

    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Security Test Year',
        'summary' => 'Testing malicious file uploads.',
    ]);

    // Attack vector 1: Real PHP code disguised with .jpg extension
    $maliciousContent = "<?php echo 'malicious code executed'; system(\$_GET['cmd']); ?>";
    $fakePhpJpg = UploadedFile::fake()->createWithContent('backdoor.jpg', $maliciousContent);

    try {
        $service->addImage($year, $fakePhpJpg, 'Alt text');
        $this->fail('Expected ValidationException for PHP file disguised as JPG.');
    } catch (ValidationException $e) {
        expect($e->errors())->toHaveKey('image');
    }

    $response1 = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => $fakePhpJpg,
        'alt_text' => 'Malicious file',
    ]);
    $response1->assertStatus(422);

    // Attack vector 2: Double extension shell.php.jpg
    $doubleExtFile = UploadedFile::fake()->create('shell.php.jpg', 200, 'image/jpeg');
    $response2 = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => $doubleExtFile,
        'alt_text' => 'Double extension file',
    ]);
    $response2->assertStatus(422);

    // Attack vector 3: Direct .php file with image mime type
    $phpFile = UploadedFile::fake()->create('payload.php', 200, 'image/jpeg');
    $response3 = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => $phpFile,
        'alt_text' => 'Direct PHP file',
    ]);
    $response3->assertStatus(422);

    // Verify nothing was stored
    expect($year->media()->count())->toBe(0);
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
    expect(Storage::disk('private')->allFiles())->toBeEmpty();
});

/* =========================================================================
 * 6. Public Disk Storage: Uploads are stored on public disk only
 * ========================================================================= */

test('uploads are stored on the public disk only and never the private document disk', function () {
    $manager = User::factory()->manager()->create();

    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Island Crossing',
        'summary' => 'Journey across emerald tea plantations.',
        'consent_confirmed_at' => now(),
    ]);

    $validImage = UploadedFile::fake()->image('nuwara_eliya.jpg', 1200, 800);

    $response = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => $validImage,
        'alt_text' => 'Misty tea trail in Nuwara Eliya',
        'caption' => 'Early morning tea picker trail',
    ]);

    $response->assertStatus(201);

    $media = $year->media()->first();
    expect($media)->not->toBeNull();
    expect($media->file_path)->toStartWith('memories/');
    expect($media->file_path)->toEndWith('.webp');

    // MUST exist on the public disk
    Storage::disk('public')->assertExists($media->file_path);

    // MUST NOT exist on the private document disk
    Storage::disk('private')->assertMissing($media->file_path);
    expect(Storage::disk('private')->allFiles())->toBeEmpty();
});

/* =========================================================================
 * 7. Resizing and WebP Conversion
 * ========================================================================= */

test('large images are resized to maximum 2000px and converted to webp format', function () {
    $manager = User::factory()->manager()->create();

    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Panoramas of Lanka',
        'summary' => 'High resolution photography.',
    ]);

    // Create 3000 x 1500 wide panorama
    $largeImage = UploadedFile::fake()->image('panorama.png', 3000, 1500);

    $response = $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => $largeImage,
        'alt_text' => 'Wide mountain panorama',
    ]);

    $response->assertStatus(201);

    $media = $year->media()->first();
    expect($media->file_path)->toEndWith('.webp');

    // Retrieve binary and verify dimensions and type via GD
    $binary = Storage::disk('public')->get($media->file_path);
    $info = getimagesizefromstring($binary);

    expect($info[0])->toBe(2000); // Resized down to 2000px width
    expect($info[1])->toBe(1000); // Aspect ratio preserved
    expect($info[2])->toBe(IMAGETYPE_WEBP); // Converted to WebP
});

/* =========================================================================
 * 8. Media Deletion Cleans Up Public Storage
 * ========================================================================= */

test('deleting media removes file from public storage disk', function () {
    $manager = User::factory()->manager()->create();

    $year = MemoryYear::create([
        'year' => 2025,
        'title' => 'Deletion Test Year',
        'summary' => 'Testing file cleanup on deletion.',
    ]);

    $file = UploadedFile::fake()->image('temporary.jpg', 600, 400);

    $this->actingAs($manager)->postJson("/admin/memories/{$year->id}/media", [
        'type' => 'image',
        'image' => $file,
        'alt_text' => 'Temporary photo',
    ]);

    $media = $year->media()->first();
    $filePath = $media->file_path;
    Storage::disk('public')->assertExists($filePath);

    // Delete media
    $this->actingAs($manager)->deleteJson("/admin/memories/{$year->id}/media/{$media->id}")
        ->assertStatus(200);

    expect($year->media()->count())->toBe(0);
    Storage::disk('public')->assertMissing($filePath);
});
