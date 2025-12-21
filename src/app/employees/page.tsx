import { Suspense } from "react";
import { getEmployees } from "./actions";
import { getDepartments } from "../bonus-periods/actions";
import { EmployeesClient } from "./employees-client";
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton shown during streaming
function EmployeesTableSkeleton() {
  return (
    <div className="p-6 flex flex-col h-full space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {/* Table skeleton */}
      <div className="flex-1 space-y-4">
        <div className="rounded-md border">
          {/* Table header */}
          <div className="border-b bg-muted/50 p-4">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          {/* Table rows */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-b p-4">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Server Component - fetches data on the server before sending to client
export default async function EmployeesPage() {
  // Parallel fetch on the server - no client-side waterfall!
  const [employees, departments] = await Promise.all([
    getEmployees(),
    getDepartments()
  ]);

  return (
    <Suspense fallback={<EmployeesTableSkeleton />}>
      <EmployeesClient
        initialEmployees={employees}
        initialDepartments={departments}
      />
    </Suspense>
  );
}