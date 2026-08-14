import { HelpArticlesList } from "@/components/help/HelpArticlesList";

export default function PublicHelpPage() {
  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <HelpArticlesList showLoginHint />
      </div>
    </div>
  );
}
