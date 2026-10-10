<tr>
<td>
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center">
{{ Illuminate\Mail\Markdown::parse($slot) }}
<p style="margin-top: 20px;">
    <strong>{{ config('branding.company_name', 'Nisala Travels') }}</strong><br>
    {{ config('branding.address', '') }}<br>
    Phone: {{ config('branding.phone', '') }} | WhatsApp: {{ config('branding.whatsapp', '') }}
</p>
</td>
</tr>
</table>
</td>
</tr>
