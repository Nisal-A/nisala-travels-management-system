<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\DocumentType;
use App\Models\Payment;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function createCustomerUser()
{
    $user = User::factory()->create();
    Role::firstOrCreate(['name' => 'customer']);
    $user->assignRole('customer');
    $customer = Customer::factory()->create([
        'user_id' => $user->id,
    ]);

    return [$user, $customer];
}

it('allows customer to view portal dashboard', function () {
    [$user, $customer] = createCustomerUser();

    $response = $this->actingAs($user)->get(route('portal.dashboard'));
    $response->assertStatus(200);
});

it('restricts portal access for non-customers', function () {
    $admin = User::factory()->create();
    Role::firstOrCreate(['name' => 'super_admin']);
    $admin->assignRole('super_admin');

    $response = $this->actingAs($admin)->get(route('portal.dashboard'));
    $response->assertStatus(403);
});

it('shows only the customer\'s own bookings', function () {
    [$user1, $customer1] = createCustomerUser();
    [$user2, $customer2] = createCustomerUser();

    $tour = TourPackage::factory()->create();

    $booking1 = Booking::factory()->create(['customer_id' => $customer1->id, 'tour_package_id' => $tour->id]);
    $booking2 = Booking::factory()->create(['customer_id' => $customer2->id, 'tour_package_id' => $tour->id]);

    $response = $this->actingAs($user1)->get(route('portal.bookings.index'));
    $response->assertStatus(200);

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Portal/Bookings')
        ->has('bookings.data', 1)
        ->where('bookings.data.0.id', $booking1->id)
    );
});

it('shows only the customer\'s own documents', function () {
    [$user1, $customer1] = createCustomerUser();
    [$user2, $customer2] = createCustomerUser();

    $docType = DocumentType::first() ?? DocumentType::factory()->create();

    $doc1 = CustomerDocument::factory()->create(['customer_id' => $customer1->id, 'document_type_id' => $docType->id]);
    $doc2 = CustomerDocument::factory()->create(['customer_id' => $customer2->id, 'document_type_id' => $docType->id]);

    $response = $this->actingAs($user1)->get(route('portal.documents.index'));
    $response->assertStatus(200);

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Portal/Documents')
        ->has('documents.data', 1)
        ->where('documents.data.0.id', $doc1->id)
    );
});

it('shows only the customer\'s own payments', function () {
    [$user1, $customer1] = createCustomerUser();
    [$user2, $customer2] = createCustomerUser();

    $tour = TourPackage::factory()->create();
    $booking1 = Booking::factory()->create(['customer_id' => $customer1->id, 'tour_package_id' => $tour->id]);
    $booking2 = Booking::factory()->create(['customer_id' => $customer2->id, 'tour_package_id' => $tour->id]);

    $payment1 = Payment::factory()->create(['customer_id' => $customer1->id, 'booking_id' => $booking1->id]);
    $payment2 = Payment::factory()->create(['customer_id' => $customer2->id, 'booking_id' => $booking2->id]);

    $response = $this->actingAs($user1)->get(route('portal.payments.index'));
    $response->assertStatus(200);

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Portal/Payments')
        ->has('payments.data', 1)
        ->where('payments.data.0.id', $payment1->id)
    );
});

it('downloads itinerary and payment receipt PDFs for the customer\'s own booking and payment', function () {
    [$user, $customer] = createCustomerUser();

    $tour = TourPackage::factory()->create([
        'package_name' => 'Sigiriya & Kandy Cultural Tour',
        'itinerary' => [
            ['day' => 1, 'title' => 'Arrival & Transfer to Sigiriya', 'description' => 'Check in and evening climb.'],
            ['day' => 2, 'title' => 'Sigiriya to Kandy', 'description' => 'Temple of the Tooth visit.'],
        ],
    ]);

    $booking = Booking::factory()->create([
        'customer_id' => $customer->id,
        'tour_package_id' => $tour->id,
        'final_amount' => 1500,
        'balance_amount' => 1000,
    ]);

    $payment = Payment::factory()->create([
        'customer_id' => $customer->id,
        'booking_id' => $booking->id,
        'amount' => 500,
        'currency' => 'USD',
    ]);

    $itineraryResponse = $this->actingAs($user)->get(route('portal.bookings.itinerary', $booking));
    $itineraryResponse->assertStatus(200);
    $itineraryResponse->assertHeader('content-type', 'application/pdf');

    $receiptResponse = $this->actingAs($user)->get(route('portal.payments.receipt', $payment));
    $receiptResponse->assertStatus(200);
    $receiptResponse->assertHeader('content-type', 'application/pdf');
});

