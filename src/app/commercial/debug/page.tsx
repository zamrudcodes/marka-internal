import { testDatabaseAccess } from "../debug-db";

export default async function DebugPage() {
    const result = await testDatabaseAccess();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Database Debug</h1>
            <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
