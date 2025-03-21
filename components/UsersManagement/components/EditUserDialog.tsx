// EditUserDialog.tsx
import React, { useState, useEffect } from 'react';
import { User, Shield, Calendar, Globe, Check, Mail } from 'lucide-react';
import { useTranslations } from "next-intl"; // Added internationalization
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from 'countries-list';

// Transform countries object into a sorted array for easier use in the select input
const countriesArray = Object.entries(countries).map(([code, country]) => ({
  code,
  name: country.name
})).sort((a, b) => a.name.localeCompare(b.name));

interface User {
  id: string;
  email?: string;
  emailVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
  photoURL?: string;
  fullName?: string;
  handle?: string;
  birthdate?: string;
  country?: string;
  'problem-setter'?: boolean;
  admin?: boolean;
  profileCompleted?: boolean;
}

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (userData: Partial<User>) => void;
  loading: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  loading
}) => {
  // Initialize translations for UsersManagement namespace
  const t = useTranslations("UsersManagement");
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        emailVerified: user.emailVerified || false,
        fullName: user.fullName || '',
        handle: user.handle || '',
        birthdate: user.birthdate || '',
        country: user.country || '',
        'problem-setter': user['problem-setter'] || false,
        admin: user.admin || false,
        profileCompleted: user.profileCompleted || false,
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("errors.invalidEmail");
    }
    
    if (formData.handle && formData.handle.length < 3) {
      newErrors.handle = t("errors.handleTooShort");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("editUser.title")}</DialogTitle>
            <DialogDescription>
              {t("editUser.description")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right flex items-center justify-end gap-2">
                <Mail className="h-4 w-4" /> {t("fields.email")}
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="col-span-3"
              />
              {errors.email && (
                <p className="text-destructive text-sm col-span-3 col-start-2">{errors.email}</p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right flex items-center justify-end gap-2">
                <User className="h-4 w-4" /> {t("fields.fullName")}
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="handle" className="text-right flex items-center justify-end gap-2">
                <User className="h-4 w-4" /> {t("fields.handle")}
              </Label>
              <Input
                id="handle"
                name="handle"
                value={formData.handle || ''}
                onChange={handleChange}
                className="col-span-3"
              />
              {errors.handle && (
                <p className="text-destructive text-sm col-span-3 col-start-2">{errors.handle}</p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthdate" className="text-right flex items-center justify-end gap-2">
                <Calendar className="h-4 w-4" /> {t("fields.birthdate")}
              </Label>
              <Input
                id="birthdate"
                name="birthdate"
                type="date"
                value={formData.birthdate || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right flex items-center justify-end gap-2">
                <Globe className="h-4 w-4" /> {t("fields.country")}
              </Label>
              <Select
                value={formData.country || 'none'}
                onValueChange={(value) => handleSelectChange('country', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("placeholders.selectCountry")} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none">{t("options.noCountry")}</SelectItem>
                  {countriesArray.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right flex items-center justify-end gap-2">
                <Shield className="h-4 w-4" /> {t("fields.roles")}
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="problem-setter"
                    checked={formData['problem-setter'] || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('problem-setter', checked === true)
                    }
                  />
                  <Label htmlFor="problem-setter">{t("roles.problemSetter")}</Label>
                </div>
                
              </div>
            </div>
            
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("buttons.saving") : t("buttons.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;