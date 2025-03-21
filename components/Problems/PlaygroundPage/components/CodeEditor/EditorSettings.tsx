import React from 'react';
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

interface EditorSettingsProps {
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  tabSize: number;
  setTabSize: (size: number) => void;
  minimap: boolean;
  setMinimap: (show: boolean) => void;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;
  lineNumbers: boolean;
  setLineNumbers: (show: boolean) => void;
  autoSave: boolean;
  setAutoSave: (save: boolean) => void;
  bracketPairs: boolean;
  setBracketPairs: (colorize: boolean) => void;
}

export function EditorSettings({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  tabSize,
  setTabSize,
  minimap,
  setMinimap,
  wordWrap,
  setWordWrap,
  lineNumbers,
  setLineNumbers,
  autoSave,
  setAutoSave,
  bracketPairs,
  setBracketPairs,
}: EditorSettingsProps) {
  const t = useTranslations("Playground.editor");
  
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{t("settings")}</SheetTitle>
      </SheetHeader>
      <div className="py-4 space-y-6">
        <div className="space-y-2">
          <Label>{t("fontSize", { size: fontSize })}</Label>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            min={10}
            max={24}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("tabSize")}</Label>
          <Slider
            value={[tabSize]}
            onValueChange={([value]) => setTabSize(value)}
            min={2}
            max={8}
            step={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("showMinimap")}</Label>
          <Switch checked={minimap} onCheckedChange={setMinimap} />
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("wordWrap")}</Label>
          <Switch checked={wordWrap} onCheckedChange={setWordWrap} />
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("lineNumbers")}</Label>
          <Switch
            checked={lineNumbers}
            onCheckedChange={setLineNumbers}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("autoSave")}</Label>
          <Switch checked={autoSave} onCheckedChange={setAutoSave} />
        </div>

        <div className="flex items-center justify-between">
          <Label>{t("bracketPairs")}</Label>
          <Switch
            checked={bracketPairs}
            onCheckedChange={setBracketPairs}
          />
        </div>
      </div>
    </SheetContent>
  );
}

export default EditorSettings;