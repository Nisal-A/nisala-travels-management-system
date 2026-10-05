@extends('emails.layout')

@php
    $preheader = 'Action required: Document rejected for your booking';
@endphp

@section('content')
    <h1>Document Needs Update</h1>
    <p>Hi {{ $customerName }},</p>
    <p>We've reviewed the <strong>{{ $document->documentType->name ?? 'document' }}</strong> you uploaded for {{ $travelerName ?? 'your trip' }}, but unfortunately we cannot accept it in its current form.</p>
    
    <div class="callout">
        <strong>Reason for rejection:</strong><br>
        {{ $document->verification_notes ?? 'The document is unclear or invalid. Please provide a clearer copy.' }}
    </div>

    <h2>How to re-upload</h2>
    <ol style="margin-bottom: 24px; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Click the button below to go to your portal.</li>
        <li style="margin-bottom: 10px;">Locate the rejected document in the Documents section.</li>
        <li style="margin-bottom: 10px;">Upload a new file that addresses the reason mentioned above.</li>
    </ol>

    <div class="button-wrap">
        <a href="{{ url('/portal/documents') }}" class="button">Go to Documents</a>
    </div>

    <p>Please resolve this as soon as possible to avoid any delays with your booking processing. If you need help, feel free to reply to this email.</p>
@endsection
