@extends('emails.layout')

@php
    $preheader = 'A new document has been uploaded for ' . ($document->customer->full_name ?? 'a customer');
@endphp

@section('content')
    <h1>Document Uploaded</h1>
    <p>Hello Team,</p>
    <p>A customer has uploaded a new document that requires verification.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #e2e8f0;">
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Customer:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $document->customer->full_name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Traveler:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $document->traveler->full_name ?? 'Primary Customer' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Document Type:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $document->documentType->name ?? 'Unknown' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Uploaded At:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $document->created_at->format('M d, Y H:i') }}</td>
        </tr>
    </table>

    <div class="button-wrap">
        <a href="{{ url('/admin/documents/' . $document->id) }}" class="button">Review Document</a>
    </div>
@endsection
