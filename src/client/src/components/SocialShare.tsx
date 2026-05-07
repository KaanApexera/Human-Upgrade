import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { SiInstagram, SiTiktok, SiFacebook, SiX } from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  performanceAge: number;
  chronologicalAge?: number;
}

export function SocialShare({ performanceAge, chronologicalAge = 35 }: SocialShareProps) {
  const { toast } = useToast();
  const ageDifference = chronologicalAge - performanceAge;
  const isYounger = ageDifference > 0;

  const shareText = isYounger
    ? `Just discovered my Performance Age is ${performanceAge} - that's ${ageDifference} years younger than my actual age! Find out your biological age with Human Upgrade OS`
    : `Just got my Performance Age analyzed with Human Upgrade OS. Find out how your body is really performing!`;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://humanupgrade.replit.app";
  const hashtags = "#HumanUpgrade #PerformanceAge #Biohacking #HealthOptimization";

  const handleShare = (platform: string) => {
    let url = "";

    switch (platform) {
      case "x":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=HumanUpgrade,PerformanceAge,Biohacking`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "instagram":
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}\n\n${hashtags}`);
        toast({
          title: "Copied to clipboard!",
          description: "Open Instagram and paste in your story or post caption.",
        });
        return;
      case "tiktok":
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}\n\n${hashtags}`);
        toast({
          title: "Copied to clipboard!",
          description: "Open TikTok and paste in your video caption.",
        });
        return;
      case "copy":
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        toast({
          title: "Copied to clipboard!",
          description: "Share your Performance Age anywhere you like.",
        });
        return;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          data-testid="button-share"
        >
          <Share2 className="w-4 h-4" />
          Share Results
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleShare("instagram")}
          className="cursor-pointer gap-2"
          data-testid="share-instagram"
        >
          <SiInstagram className="w-4 h-4 text-pink-500" />
          Share on Instagram
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare("tiktok")}
          className="cursor-pointer gap-2"
          data-testid="share-tiktok"
        >
          <SiTiktok className="w-4 h-4" />
          Share on TikTok
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare("x")}
          className="cursor-pointer gap-2"
          data-testid="share-x"
        >
          <SiX className="w-4 h-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare("facebook")}
          className="cursor-pointer gap-2"
          data-testid="share-facebook"
        >
          <SiFacebook className="w-4 h-4 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare("copy")}
          className="cursor-pointer gap-2"
          data-testid="share-copy"
        >
          <Share2 className="w-4 h-4" />
          Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
