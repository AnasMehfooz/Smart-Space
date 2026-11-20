import { Link } from "react-router";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

/**
 * First screen. Instead of feature cards it shows the product doing its job once: a question, an answer whose
 * fact is marked like a highlighter, and the file it came from. That is the signature the user meets on Home.
 */
export default function WelcomeStep({ onNext }) {
  return (
    <div>
      <Logo size="lg" />
      <h1 className="mt-10 short:mt-5 text-[30px] leading-tight font-semibold tracking-[-0.025em] text-balance">
        Find anything in your files by asking.
      </h1>
      <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-muted-foreground">
        Smart Space reads one folder on this PC and answers questions about it, with the exact file each fact came from.
      </p>

      {/* A sample of an answer, as it looks on Home. */}
      <figure className="mt-8 border-y py-5 short:mt-5 short:py-3" aria-label="Example of an answer">
        <p className="text-sm text-muted-foreground">For example: “How much is my monthly rent?”</p>
        <p className="mt-2 text-[15px] leading-[1.65]">
          <span className="mark">The monthly rent is 950 Euro</span>
          <span className="cite" aria-hidden>
            1
          </span>
          , due on the first of each month.
        </p>
        <figcaption className="mt-3 flex w-fit items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px]">
          <span className="font-medium text-muted-foreground tabular-nums">1</span>
          <FileText className="size-3.5 text-muted-foreground" />
          Mietvertrag_2024.pdf
        </figcaption>
      </figure>

      <dl className="mt-6 text-sm short:mt-3">
        <Fact title="Search by meaning">Find documents, photos and scans by what they say, in German or English.</Fact>
        <Fact title="Answers with sources">Every fact in an answer leads to its file.</Fact>
        <Fact title="Private">
          Runs on this PC. No account, no cloud, and your files are only read.{" "}
          <Link
            to="/privacy"
            state={{ from: "/onboarding" }}
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            How Smart Space handles your data
          </Link>
        </Fact>
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-4 short:mt-5">
        <Button size="lg" onClick={onNext}>
          Let’s get started <ArrowRight />
        </Button>
        <span className="text-sm text-muted-foreground">Takes about 5 minutes, most of it the model download.</span>
      </div>
    </div>
  );
}

function Fact({ title, children }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] gap-4 border-b py-3 last:border-b-0 short:py-2">
      <dt className="font-medium">{title}</dt>
      <dd className="text-muted-foreground">{children}</dd>
    </div>
  );
}
