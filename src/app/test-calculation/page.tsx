"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/currency";

export default function TestCalculationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test data for manual calculation verification
  const testScenario = {
    bonusPool: 50000000, // Rp 50 juta
    totalDepartmentRevenue: 1000000000, // Rp 1 miliar
    maxDepartmentSalary: 100000000, // Rp 100 juta
    employee: {
      name: "Karyawan Test",
      performanceRating: 8,
      salary: 60000000, // Rp 60 juta
      projectRevenue: 200000000, // Rp 200 juta - Employee's share of project revenues
    }
  };

  const calculateManually = () => {
    const { employee, maxDepartmentSalary, totalDepartmentRevenue, bonusPool } = testScenario;
    
    // Contribution Score: (8/10) × 100 = 80
    const contributionScore = (employee.performanceRating / 10) * 100;
    
    // Revenue Score: (200000/1000000) × 100 = 20
    const revenueScore = (employee.projectRevenue / totalDepartmentRevenue) * 100;
    
    // Salary Adjustment Score: (1 - (60000/100000)) × 100 = 40
    const salaryAdjustmentScore = (1 - (employee.salary / maxDepartmentSalary)) * 100;
    
    // Weighted Score: (80 × 0.40) + (20 × 0.40) + (40 × 0.20) = 32 + 8 + 8 = 48
    const weightedScore = (contributionScore * 0.40) + (revenueScore * 0.40) + (salaryAdjustmentScore * 0.20);
    
    // Assuming this is the only employee for simplicity
    // In real scenario, we'd need total weighted score of all employees
    const totalWeightedScore = 48; // This would be sum of all employees
    const bonusPercentage = (weightedScore / totalWeightedScore) * 100;
    const bonusAmount = (weightedScore / totalWeightedScore) * bonusPool;
    
    return {
      contributionScore,
      revenueScore,
      salaryAdjustmentScore,
      weightedScore,
      bonusPercentage,
      bonusAmount
    };
  };

  const runManualCalculation = () => {
    setError(null);
    const manualResult = calculateManually();
    setResult({
      type: "manual",
      ...manualResult,
      testData: testScenario
    });
  };

  const testAPICalculation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First, we need a bonus period ID
      // For testing, you would need to create a test bonus period first
      const testBonusPeriodId = prompt("Enter a Bonus Period ID to test:");
      
      if (!testBonusPeriodId) {
        setError("No bonus period ID provided");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/calculate-bonus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bonusPeriodId: testBonusPeriodId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate bonuses");
      }

      setResult({
        type: "api",
        ...data
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };


  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Test Perhitungan Bonus</h1>
      
      <div className="space-y-6">
        {/* Test Scenario Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Skenario Test</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Dana Bonus Departemen:</Label>
              <p className="font-mono">{formatCurrency(testScenario.bonusPool)}</p>
            </div>
            <div>
              <Label>Total Revenue Departemen:</Label>
              <p className="font-mono">{formatCurrency(testScenario.totalDepartmentRevenue)}</p>
            </div>
            <div>
              <Label>Gaji Maksimum Departemen:</Label>
              <p className="font-mono">{formatCurrency(testScenario.maxDepartmentSalary)}</p>
            </div>
            <div>
              <Label>Nama Karyawan:</Label>
              <p className="font-mono">{testScenario.employee.name}</p>
            </div>
            <div>
              <Label>Rating Performa:</Label>
              <p className="font-mono">{testScenario.employee.performanceRating}/10</p>
            </div>
            <div>
              <Label>Gaji Karyawan:</Label>
              <p className="font-mono">{formatCurrency(testScenario.employee.salary)}</p>
            </div>
            <div>
              <Label>Revenue Proyek Karyawan:</Label>
              <p className="font-mono">{formatCurrency(testScenario.employee.projectRevenue)}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={runManualCalculation} variant="outline">
            Hitung Manual
          </Button>
          <Button onClick={testAPICalculation} disabled={loading}>
            {loading ? "Menguji..." : "Test API Perhitungan"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-4 border-red-500 bg-red-50">
            <p className="text-red-700">Error: {error}</p>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {result.type === "manual" ? "Hasil Perhitungan Manual" : "Hasil Perhitungan API"}
            </h2>
            
            {result.type === "manual" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Skor Kontribusi (bobot 40%):</Label>
                    <p className="font-mono text-lg">{result.contributionScore.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      = (Performa {testScenario.employee.performanceRating}/10) × 100
                    </p>
                  </div>
                  <div>
                    <Label>Skor Revenue (bobot 40%):</Label>
                    <p className="font-mono text-lg">{result.revenueScore.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      = ({formatCurrency(testScenario.employee.projectRevenue)} / {formatCurrency(testScenario.totalDepartmentRevenue)}) × 100
                    </p>
                  </div>
                  <div>
                    <Label>Skor Penyesuaian Gaji (bobot 20%):</Label>
                    <p className="font-mono text-lg">{result.salaryAdjustmentScore.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      = (1 - ({formatCurrency(testScenario.employee.salary)} / {formatCurrency(testScenario.maxDepartmentSalary)})) × 100
                    </p>
                  </div>
                  <div>
                    <Label>Skor Tertimbang:</Label>
                    <p className="font-mono text-lg font-bold">{result.weightedScore.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      = ({result.contributionScore.toFixed(1)} × 0.4) + ({result.revenueScore.toFixed(1)} × 0.4) + ({result.salaryAdjustmentScore.toFixed(1)} × 0.2)
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Persentase Bonus:</Label>
                      <p className="font-mono text-xl font-bold text-green-600">
                        {formatPercentage(result.bonusPercentage)}
                      </p>
                    </div>
                    <div>
                      <Label>Jumlah Bonus:</Label>
                      <p className="font-mono text-xl font-bold text-green-600">
                        {formatCurrency(result.bonusAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Catatan:</strong> Perhitungan ini mengasumsikan hanya satu karyawan untuk kesederhanaan.
                    Dalam skenario nyata, skor tertimbang akan dibandingkan dengan total skor tertimbang
                    semua karyawan untuk menentukan persentase dan jumlah bonus yang sebenarnya.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600 font-semibold">{result.message}</p>
                {result.results && (
                  <div>
                    <Label>Dihitung untuk {result.results.length} karyawan</Label>
                    <div className="mt-2 max-h-96 overflow-y-auto">
                      <Textarea
                        value={JSON.stringify(result.results, null, 2)}
                        readOnly
                        className="font-mono text-xs"
                        rows={20}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Formula Reference */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Referensi Formula</h3>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>Skor Kontribusi:</strong> (Rating Performa / 10) × 100</p>
            <p><strong>Skor Revenue:</strong> (Revenue Karyawan / Total Revenue Departemen) × 100</p>
            <p><strong>Skor Penyesuaian Gaji:</strong> (1 - (Gaji Karyawan / Gaji Maks Departemen)) × 100</p>
            <p><strong>Skor Tertimbang:</strong> (SK × 0.40) + (SR × 0.40) + (SPG × 0.20)</p>
            <p><strong>Jumlah Bonus:</strong> (Skor Tertimbang / Total Skor Tertimbang) × Dana Bonus</p>
          </div>
        </Card>
      </div>
    </div>
  );
}