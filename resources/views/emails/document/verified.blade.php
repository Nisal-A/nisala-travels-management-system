@extends('emails.layout')

@php
    $preheader = 'Your document has been verified successfully!';
@endphp

@section('content')
    <h1>Document Verified</h1>
    <p>Hi {{ $customerName }},</p>
    <p>Good news! Your <strong>{{ $document->documentType->name ?? 'document' }}</strong> for {{ $travelerName ?? 'your trip' }} has been reviewed and verified by our team.</p>
    
    <p>You're one step closer to your journey! You can check the status of all your documents anytime in your customer portal.</p>

    <div class="button-wrap">
        <a href="{{ url('/portal/documents') }}" class="button">View my documents</a>
    </div>
@endsection
