import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getEmailTemplates, resetAllEmailTemplates } from '@/lib/services/emailTemplates';

export async function GET() {
  const _denied = await requireAdmin();
  if (_denied) return _denied;
  try {
    const templates = await getEmailTemplates();
    
    // Group templates by category
    const grouped = templates.reduce((acc, template) => {
      const cat = template.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(template);
      return acc;
    }, {} as Record<string, typeof templates>);

    return NextResponse.json({ success: true, templates: grouped });
  } catch (error: unknown) {
    console.error('[API email-templates] GET failed:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const _denied = await requireAdmin(request);
  if (_denied) return _denied;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === 'reset-all') {
      const resetTemplates = await resetAllEmailTemplates(body.category);
      return NextResponse.json({
        success: true,
        message: body.category ? `All ${body.category} templates reset to default` : 'All email templates reset to defaults',
        templates: resetTemplates
      });
    }
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('[API email-templates] POST failed:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
