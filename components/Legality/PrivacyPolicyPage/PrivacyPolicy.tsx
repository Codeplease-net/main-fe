import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const t = useTranslations('Legality.PrivacyPolicy');
  
  const sections = [
    {
      title: t('Privacy Policy of CodePlease'),
      content: ['StaticText.1', 'StaticText.2', 'StaticText.3', 'StaticText.4']
    },
    {
      title: t('Information Collection and Use'),
      content: ['StaticText.5']
    },
    {
      title: t('Log Data'),
      content: ['StaticText.6']
    },
    {
      title: t('Cookies'),
      content: ['StaticText.7', 'StaticText.8']
    },
    {
      title: t('Service Providers'),
      content: ['StaticText.9'],
      list: ['StaticText.10', 'StaticText.11', 'StaticText.12', 'StaticText.13'],
      footer: ['StaticText.14']
    },
    {
      title: t('Security'),
      content: ['StaticText.15']
    },
    {
      title: t('Links to Other Sites'),
      content: ['StaticText.16', 'StaticText.17', 'StaticText.18']
    },
    {
      title: t('Changes to This Privacy Policy'),
      content: ['StaticText.19']
    },
    {
      title: t('Contact Us'),
      content: ['StaticText.20']
    }
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
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>

              <div className="ml-8 space-y-3">
                {section.content.map((text, i) => (
                  <p key={i} className="text-muted-foreground">
                    {t(text)}
                  </p>
                ))}

                {section.list && (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="text-muted-foreground">
                        {t(item)}
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && section.footer.map((text, i) => (
                  <p key={i} className="text-muted-foreground mt-3">
                    {t(text)}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
