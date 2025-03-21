import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenderMathJaxText } from "@/components/ui/description/mathjax";
import { MdContentCopy, MdDone } from "react-icons/md";
import { useTranslations } from "next-intl";

export const CommandsList: React.FC = () => {
  const t = useTranslations("MathJax.commands"); // Get translations from the commands namespace
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Get command categories from translations
  const commandCategories = [
    {
      name: t("categories.textFormatting.name"),
      description: t("categories.textFormatting.description"),
      commands: [
        { 
          cmd: "\\textbf{text}", 
          description: t("categories.textFormatting.commands.bold.description"),
          example: t("categories.textFormatting.commands.bold.example"),
          notes: t("categories.textFormatting.commands.bold.notes") 
        },
        { 
          cmd: "\\bf{text}", 
          description: t("categories.textFormatting.commands.boldAlt.description"),
          example: t("categories.textFormatting.commands.boldAlt.example"),
          notes: t("categories.textFormatting.commands.boldAlt.notes")
        },
        { 
          cmd: "\\textit{text}", 
          description: t("categories.textFormatting.commands.italic.description"),
          example: t("categories.textFormatting.commands.italic.example"),
          notes: t("categories.textFormatting.commands.italic.notes")
        },
        { 
          cmd: "\\it{text}", 
          description: t("categories.textFormatting.commands.italicAlt.description"),
          example: t("categories.textFormatting.commands.italicAlt.example"),
          notes: t("categories.textFormatting.commands.italicAlt.notes")
        },
        { 
          cmd: "\\underline{text}", 
          description: t("categories.textFormatting.commands.underline.description"),
          example: t("categories.textFormatting.commands.underline.example"),
          notes: t("categories.textFormatting.commands.underline.notes")
        },
        { 
          cmd: "\\emph{text}", 
          description: t("categories.textFormatting.commands.emph.description"),
          example: t("categories.textFormatting.commands.emph.example"),
          notes: t("categories.textFormatting.commands.emph.notes")
        },
        { 
          cmd: "\\sout{text}", 
          description: t("categories.textFormatting.commands.strikethrough.description"),
          example: t("categories.textFormatting.commands.strikethrough.example"),
          notes: t("categories.textFormatting.commands.strikethrough.notes")
        },
        { 
          cmd: "\\texttt{text}", 
          description: t("categories.textFormatting.commands.monospace.description"),
          example: t("categories.textFormatting.commands.monospace.example"),
          notes: t("categories.textFormatting.commands.monospace.notes") 
        },
        { 
          cmd: "\\tt{text}", 
          description: t("categories.textFormatting.commands.monospaceAlt.description"),
          example: t("categories.textFormatting.commands.monospaceAlt.example"),
          notes: t("categories.textFormatting.commands.monospaceAlt.notes")
        },
        { 
          cmd: "\\t{text}", 
          description: t("categories.textFormatting.commands.monospaceShort.description"),
          example: t("categories.textFormatting.commands.monospaceShort.example"),
          notes: t("categories.textFormatting.commands.monospaceShort.notes")
        },
        { 
          cmd: "\\textsc{text}", 
          description: t("categories.textFormatting.commands.smallcaps.description"),
          example: t("categories.textFormatting.commands.smallcaps.example"),
          notes: t("categories.textFormatting.commands.smallcaps.notes")
        },
        { 
          cmd: "\\fbox{text}", 
          description: t("categories.textFormatting.commands.boxed.description"),
          example: t("categories.textFormatting.commands.boxed.example"),
          notes: t("categories.textFormatting.commands.boxed.notes")
        },
        { 
          cmd: "\\boxed{text}", 
          description: t("categories.textFormatting.commands.boxedAlt.description"),
          example: t("categories.textFormatting.commands.boxedAlt.example"),
          notes: t("categories.textFormatting.commands.boxedAlt.notes")
        }
      ]
    },
    {
      name: t("categories.textSize.name"),
      description: t("categories.textSize.description"),
      commands: [
        { 
          cmd: "\\tiny{text}", 
          description: t("categories.textSize.commands.tiny.description"),
          example: t("categories.textSize.commands.tiny.example"),
          notes: t("categories.textSize.commands.tiny.notes")
        },
        { 
          cmd: "\\scriptsize{text}", 
          description: t("categories.textSize.commands.scriptsize.description"),
          example: t("categories.textSize.commands.scriptsize.example"),
          notes: t("categories.textSize.commands.scriptsize.notes")
        },
        { 
          cmd: "\\small{text}", 
          description: t("categories.textSize.commands.small.description"),
          example: t("categories.textSize.commands.small.example"),
          notes: t("categories.textSize.commands.small.notes")
        },
        { 
          cmd: "\\normalsize{text}", 
          description: t("categories.textSize.commands.normalsize.description"),
          example: t("categories.textSize.commands.normalsize.example"),
          notes: t("categories.textSize.commands.normalsize.notes")
        },
        { 
          cmd: "\\large{text}", 
          description: t("categories.textSize.commands.large.description"),
          example: t("categories.textSize.commands.large.example"),
          notes: t("categories.textSize.commands.large.notes")
        },
        { 
          cmd: "\\Large{text}", 
          description: t("categories.textSize.commands.Large.description"),
          example: t("categories.textSize.commands.Large.example"),
          notes: t("categories.textSize.commands.Large.notes")
        },
        { 
          cmd: "\\LARGE{text}", 
          description: t("categories.textSize.commands.LARGE.description"),
          example: t("categories.textSize.commands.LARGE.example"),
          notes: t("categories.textSize.commands.LARGE.notes")
        },
        { 
          cmd: "\\huge{text}", 
          description: t("categories.textSize.commands.huge.description"),
          example: t("categories.textSize.commands.huge.example"),
          notes: t("categories.textSize.commands.huge.notes")
        },
        { 
          cmd: "\\HUGE{text}", 
          description: t("categories.textSize.commands.HUGE.description"),
          example: t("categories.textSize.commands.HUGE.example"),
          notes: t("categories.textSize.commands.HUGE.notes")
        }
      ]
    },
    {
      name: t("categories.layout.name"),
      description: t("categories.layout.description"),
      commands: [
        { 
          cmd: "\\epigraph{quote}{attribution}", 
          description: t("categories.layout.commands.epigraph.description"),
          example: t("categories.layout.commands.epigraph.example"),
          notes: t("categories.layout.commands.epigraph.notes")
        },
      ]
    },
    // Only showing two categories for brevity, but you would continue with the rest
    // (headings, colors, links, special symbols, math, environments, code blocks, tables, examples)
  ];

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
      <p className="mb-6">{t("description")}</p>
      
      {/* Simple Navigation Menu */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <h3 className="text-sm font-medium mb-3">{t("jumpToCategory")}</h3>
        <div className="flex flex-wrap gap-2">
          {commandCategories.map((category) => (
            <a 
              key={category.name}
              href={`#${category.name.toLowerCase().replace(/\s+/g, '-')}`} 
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-md text-sm transition-colors"
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      {/* Show categories and their commands */}
      {commandCategories.map((category) => (
        <section 
          key={category.name}
          id={category.name.toLowerCase().replace(/\s+/g, '-')}
          className="mb-12 scroll-mt-20"
        >
          <div className="mb-4 pb-2 border-b">
            <h3 className="text-xl font-medium">{category.name}</h3>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="space-y-4">
            {category.commands.map((command, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-4 bg-muted border-b flex justify-between items-center">
                  <div>
                    <code className="font-mono text-primary text-sm font-semibold">{command.cmd}</code>
                    <p className="text-sm text-muted-foreground mt-1">{command.description}</p>
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(command.cmd)} 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {copiedCommand === command.cmd ? (
                      <>
                        <MdDone className="h-4 w-4" />
                        <span>{t("copied")}</span>
                      </>
                    ) : (
                      <>
                        <MdContentCopy className="h-4 w-4" />
                        <span>{t("copy")}</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  <div className="p-4">
                    <h4 className="text-sm font-medium mb-1">{t("exampleCode")}</h4>
                    <pre className="text-sm bg-muted/50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                      {command.example}
                    </pre>
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-medium mb-1">{t("renderedResult")}</h4>
                    <div className="border rounded p-3 min-h-[60px] bg-card">
                      <RenderMathJaxText content={command.example} />
                    </div>
                    {command.notes && (
                      <p className="mt-3 text-sm text-muted-foreground italic">
                        <span className="font-medium">{t("note")}</span> {command.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
        </section>
      ))}
    </div>
  );
};

export default CommandsList;