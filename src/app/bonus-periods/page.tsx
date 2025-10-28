"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getBonusPeriods, createBonusPeriod, getDepartments, calculateBonuses, getBonusCalculations } from "./actions";
import { getEmployees } from "../employees/actions";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/currency";

export default function BonusPeriodsPage() {
  const [bonusPeriods, setBonusPeriods] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [periodsData, deptsData, employeesData] = await Promise.all([
        getBonusPeriods(),
        getDepartments(),
        getEmployees()
      ]);
      setBonusPeriods(periodsData);
      setDepartments(deptsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createBonusPeriod(formData);
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error creating bonus period:", error);
      alert("Failed to create bonus period");
    }
  };

  const handleCalculate = async (periodId: string) => {
    setLoading(true);
    try {
      // Save ratings first
      const ratingsToSave = Object.entries(ratings).map(([employeeId, rating]) => ({
        employeeId,
        rating,
        notes: ""
      }));

      if (ratingsToSave.length > 0) {
        const { saveMultipleRatings } = await import("./actions");
        await saveMultipleRatings(periodId, ratingsToSave);
      }

      // Calculate bonuses
      const result = await calculateBonuses(periodId);
      
      if (result.success) {
        alert("Bonuses calculated successfully!");
        // Load the calculations
        const calcs = await getBonusCalculations(periodId);
        setCalculations(calcs);
      } else {
        alert(`Failed to calculate: ${result.error}`);
      }
    } catch (error) {
      console.error("Error calculating bonuses:", error);
      alert("Failed to calculate bonuses");
    } finally {
      setLoading(false);
      setIsCalculateDialogOpen(false);
      loadData();
    }
  };

  const openCalculateDialog = (period: any) => {
    setSelectedPeriod(period);
    // Initialize ratings with default value of 5
    const defaultRatings: Record<string, number> = {};
    const deptEmployees = employees.filter(e => e.department_id === period.department_id);
    deptEmployees.forEach(emp => {
      defaultRatings[emp.id] = 5;
    });
    setRatings(defaultRatings);
    setIsCalculateDialogOpen(true);
  };


  return (
    <div className="flex flex-col h-full overflow-hidden p-6">
      <div className="flex-shrink-0 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bonus Periods</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Bonus Period</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreatePeriod}>
              <DialogHeader>
                <DialogTitle>Create Bonus Period</DialogTitle>
                <DialogDescription>
                  Create a new bonus calculation period for a department.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Q1 2024"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department_id" className="text-right">
                    Department
                  </Label>
                  <Select name="department_id" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_date" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="net_profit" className="text-right">
                    Net Profit
                  </Label>
                  <Input
                    id="net_profit"
                    name="net_profit"
                    type="number"
                    step="0.01"
                    placeholder="1000000"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Period</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4">
          {bonusPeriods.map((period) => (
            <Card key={period.id}>
              <CardHeader>
                <CardTitle>{period.name}</CardTitle>
                <CardDescription>
                  {period.departments?.name || "Unknown Department"} |
                  Status: {period.status} |
                  Dana Bonus: {formatCurrency(period.bonus_pool || 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => openCalculateDialog(period)}
                    disabled={period.status === "finalized"}
                  >
                    Calculate Bonuses
                  </Button>
                  {period.status === "calculated" && (
                    <Button variant="outline">View Results</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Calculate Dialog */}
      <Dialog open={isCalculateDialogOpen} onOpenChange={setIsCalculateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hitung Bonus untuk {selectedPeriod?.name}</DialogTitle>
            <DialogDescription>
              Atur rating performa karyawan dan hitung bonus mereka.
              Dana Bonus: {formatCurrency(selectedPeriod?.bonus_pool || 0)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPeriod && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Rating Karyawan</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Gaji</TableHead>
                      <TableHead>Rating Performa (1-10)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees
                      .filter(e => e.department_id === selectedPeriod.department_id)
                      .map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                          <TableCell>{formatCurrency(employee.salary)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={ratings[employee.id] || 5}
                              onChange={(e) => setRatings({
                                ...ratings,
                                [employee.id]: parseInt(e.target.value)
                              })}
                              className="w-20"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {calculations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Hasil Perhitungan</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Karyawan</TableHead>
                        <TableHead>Kontribusi</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Penyesuaian Gaji</TableHead>
                        <TableHead>Skor Tertimbang</TableHead>
                        <TableHead>Bonus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculations.map((calc) => (
                        <TableRow key={calc.id}>
                          <TableCell>
                            {calc.employees?.first_name} {calc.employees?.last_name}
                          </TableCell>
                          <TableCell>{calc.contribution_score?.toFixed(2)}</TableCell>
                          <TableCell>{calc.revenue_score?.toFixed(2)}</TableCell>
                          <TableCell>{calc.salary_adjustment_score?.toFixed(2)}</TableCell>
                          <TableCell>{calc.weighted_score?.toFixed(2)}</TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(calc.bonus_amount || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <DialogFooter>
                <Button 
                  onClick={() => handleCalculate(selectedPeriod.id)}
                  disabled={loading}
                >
                  {loading ? "Menghitung..." : "Hitung Bonus"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}