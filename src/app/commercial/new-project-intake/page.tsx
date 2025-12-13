import { NewProjectIntakeForm } from "@/components/commercial/new-project-intake-form";
import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
    title: "New Project Intake | Marka Internal",
    description: "Submit a new commercial project intake form.",
};

export default async function NewProjectIntakePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">New Project Intake</h2>
            </div>
            <div className="hidden flex-1 flex-col space-y-8 md:flex">
                <NewProjectIntakeForm isAuthenticated={!!user} />
            </div>
        </div>
    );
}
