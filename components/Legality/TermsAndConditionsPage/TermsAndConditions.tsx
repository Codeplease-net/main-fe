import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';

export default function TermsAndConditions() {
  const t = useTranslations('Legality.TermsAndConditions');
  
  const sections = [
    { label: 'Acceptance of Terms', content: t('StaticText.1') },
    { label: 'Description of Services', content: t('StaticText.2') },
    { label: 'User Accounts', content: t('StaticText.3') },
    { label: 'User Conduct', content: [t('StaticText.4'), t('StaticText.5'), t('StaticText.6'), t('StaticText.7'), t('StaticText.8')] },
    { label: 'Intellectual Property', content: t('StaticText.9') },
    { label: 'Limitation of Liability', content: t('StaticText.10') },
    { label: 'Indemnification', content: t('StaticText.11') },
    { label: 'Governing Law', content: t('StaticText.12') },
    { label: 'Changes to Terms and Conditions', content: t('StaticText.13') },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto p-6 sm:p-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          {t('title')}
        </h1>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-start">
                <span className="text-xl font-semibold text-primary mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                <h2 className="text-xl font-semibold">{t(section.label)}:</h2>
              </div>

              <div className="ml-8 space-y-3">
                {Array.isArray(section.content) ? (
                  section.content.map((item, idx) => (
                    <p key={idx} className="text-muted-foreground">
                      {item}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">{section.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
