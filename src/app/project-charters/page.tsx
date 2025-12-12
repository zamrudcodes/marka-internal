import { SmartProjectCharterForm } from "@/components/smart-project-charter-form";

export default function ProjectChartersPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Project Charter</h1>
        <p className="text-muted-foreground mt-1">
          Create TikTok video package proposals with real-time feasibility validation
        </p>
      </div>
      
      <SmartProjectCharterForm />
    </div>
  );
}