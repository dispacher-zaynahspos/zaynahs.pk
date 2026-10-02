import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getEmailTemplate, updateEmailTemplate, resetEmailTemplate } from '@/lib/services/emailTemplates';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;
  try {
    const { type } = await params;
    const template = await getEmailTemplate(type);
    
    if (!template) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    const { type } = await params;
    console.error(`[API email-templates] GET for '${type}' failed:`, error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;
  try {
    const { type } = await params;
    const body = await request.json();
    
    const { subject, customHtml, custom_html, enabled } = body;
    
    const updated = await updateEmailTemplate(type, {
      subject,
      custom_html: custom_html !== undefined ? custom_html : customHtml,
      enabled
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error: any) {
    const { type } = await params;
    console.error(`[API email-templates] PATCH for '${type}' failed:`, error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST endpoint used for actions like resetting to default template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;
  try {
    const { type } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'reset') {
      const reset = await resetEmailTemplate(type);
      return NextResponse.json({ success: true, template: reset });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    const { type } = await params;
    console.error(`[API email-templates] POST action for '${type}' failed:`, error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
