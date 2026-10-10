@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ asset(config('branding.logos.full', '/brand/logo-full.svg')) }}" class="logo" alt="{{ config('branding.company_name', 'Nisala Travels') }}" style="max-width: 180px; width: 100%; height: auto;">
</a>
</td>
</tr>
