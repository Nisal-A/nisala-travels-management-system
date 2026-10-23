<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>{{ $subject ?? '' }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust: none; height: 100%; margin: 0; padding: 0; width: 100% !important; }
        .preheader { display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
        table { border-spacing: 0; border-collapse: collapse; }
        td { word-break: break-word; }
        .wrapper { background-color: #f8fafc; padding: 0; margin: 0; width: 100%; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; }
        
        .header { padding: 25px 0; text-align: center; }
        .header img { max-width: 150px; height: auto; }
        
        .content { background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
        .content-body { padding: 32px; color: #334155; font-size: 16px; line-height: 1.6; }
        
        h1 { font-size: 24px; font-weight: 600; margin-top: 0; margin-bottom: 20px; color: #0f172a; }
        h2 { font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #0f172a; }
        p { margin-top: 0; margin-bottom: 16px; }
        a { color: {{ company_setting('brand_color') }}; text-decoration: underline; }
        
        .button-wrap { text-align: center; margin: 30px 0; }
        .button { background-color: {{ company_setting('brand_color') }}; border-radius: 6px; color: #ffffff !important; display: inline-block; font-size: 16px; font-weight: 600; padding: 12px 24px; text-decoration: none; border: 1px solid {{ company_setting('brand_color') }}; }
        
        .footer { padding: 32px 24px; text-align: center; color: #64748b; font-size: 13px; line-height: 1.5; }
        .footer a { color: #64748b; text-decoration: underline; }
        .footer p { margin-bottom: 10px; }

        .callout { background-color: #fff8f1; border-left: 4px solid #f97316; padding: 16px; margin-bottom: 20px; border-radius: 4px; }
        
        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
            .wrapper { background-color: #0f172a !important; }
            .content { background-color: #1e293b !important; }
            .content-body { color: #cbd5e1 !important; }
            h1, h2 { color: #f8fafc !important; }
            .footer { color: #94a3b8 !important; }
            .footer a { color: #94a3b8 !important; }
            .callout { background-color: #332115 !important; border-left-color: #ea580c !important; }
        }

        /* Mobile */
        @media only screen and (max-width: 600px) {
            .main { width: 100% !important; }
            .content-body { padding: 24px !important; }
        }
    </style>
</head>
<body style="background-color: #f8fafc;">
    <!-- Preheader -->
    <span class="preheader">{{ $preheader ?? '' }}</span>

    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center" style="padding: 24px 0;">
                <table class="main" width="600" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                    <!-- Header -->
                    <tr>
                        <td class="header" align="center" style="padding: 25px 0;">
                            <a href="{{ config('app.url') }}" style="display: inline-block;">
                                <img src="{{ company_setting('logo_url') }}" alt="{{ company_setting('name') }}" style="max-width: 150px; border: none; display: block;" border="0">
                            </a>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="content" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                            <div class="content-body" style="color: #334155; font-size: 16px; line-height: 1.6;">
                                @yield('content')
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer" align="center" style="padding: 32px 24px; color: #64748b; font-size: 13px; line-height: 1.5; text-align: center;">
                            <p style="margin: 0 0 10px 0;">
                                <strong>{{ company_setting('name') }}</strong><br>
                                {{ company_setting('address') }}<br>
                                Phone: {{ company_setting('phone') }} | 
                                <a href="{{ company_setting('whatsapp_url') }}">WhatsApp</a> | 
                                <a href="mailto:{{ company_setting('support_email') }}">{{ company_setting('support_email') }}</a>
                            </p>
                            <p style="margin: 0;">
                                {{ $footer_note ?? 'You received this email because you are a registered user of ' . company_setting('name') . '.' }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
