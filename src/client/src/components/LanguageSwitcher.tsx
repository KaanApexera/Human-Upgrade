import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { languages, type LanguageCode } from '@/i18n';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User } from '@shared/schema';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  useEffect(() => {
    if (user?.preferredLanguage && user.preferredLanguage !== i18n.language) {
      i18n.changeLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage, i18n]);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (code: LanguageCode) => {
    i18n.changeLanguage(code);
    
    if (user) {
      queryClient.setQueryData(["/api/user"], (oldData: User | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, preferredLanguage: code };
      });
      
      try {
        await apiRequest("PATCH", "/api/user/language", { language: code });
      } catch (error) {
        console.error("Failed to save language preference:", error);
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-language-switcher">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={lang.code === currentLanguage.code ? 'bg-accent' : ''}
            data-testid={`menu-item-lang-${lang.code}`}
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
