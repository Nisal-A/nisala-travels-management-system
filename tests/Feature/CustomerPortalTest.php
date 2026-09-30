<?php

use App\Models\User;
use App\Models\Customer;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\CustomerDocument;
use App\Models\TourPackage;
use App\Models\DocumentType;
use Spatie\Permission\Models\Role;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

function createCustomerUser() {
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
    
    $response = $this->actingAs($user1)->get(route('portal.bookings'));
    $response->assertStatus(200);
    
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
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
    
    $response = $this->actingAs($user1)->get(route('portal.documents'));
    $response->assertStatus(200);
    
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
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
    
    $response = $this->actingAs($user1)->get(route('portal.payments'));
    $response->assertStatus(200);
    
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('Portal/Payments')
        ->has('payments.data', 1)
        ->where('payments.data.0.id', $payment1->id)
    );
});
