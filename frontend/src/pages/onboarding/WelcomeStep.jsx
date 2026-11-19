import { ArrowRight, FileSearch, MessageSquareText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    Icon: FileSearch,
    title: "Search by meaning",
    text: "Find documents, photos and scans by what they say, in German or English.",
  },
  {
    Icon: MessageSquareText,
    title: "Chat with your files",
    text: "Ask questions and get answers that cite the exact file.",
  },
  {
    Icon: ShieldCheck,
    title: "Private by design",
    text: "Everything runs on this PC. No cloud, no account, no tracking. Your files are never changed.",
  },
];

export default function WelcomeStep({ onNext }) {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <p className="max-w-md text-lg text-muted-foreground">
          Your local AI assistant for the files on your computer.
        </p>
      </div>

      <ul className="grid w-full gap-4 text-left">
        {FEATURES.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4 rounded-xl border bg-card p-4">
            <div className="rounded-lg bg-muted p-2">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <Button size="lg" onClick={onNext}>
        Let's get started <ArrowRight />
      </Button>
    </div>
  );
}
