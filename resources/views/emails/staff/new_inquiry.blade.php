@extends('emails.layout')

@php
    $preheader = 'New inquiry received from ' . $lead->name;
@endphp

@section('content')
    <h1>New Inquiry Received</h1>
    <p>Hello Team,</p>
    <p>A new inquiry has been submitted by <strong>{{ $lead->name }}</strong>.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #e2e8f0;">
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Name:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $lead->name }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $lead->email }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Phone:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $lead->phone ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Date:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $lead->created_at->format('M d, Y H:i') }}</td>
        </tr>
    </table>

    <div class="button-wrap">
        <a href="{{ url('/admin/inquiries/' . $lead->id) }}" class="button">Open Lead</a>
    </div>
@endsection
