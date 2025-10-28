import { createClient } from '@/utils/supabase/server';

// Types for bonus calculation
export interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  salary: number;
  department_id: string;
  performance_rating?: number;
}

export interface ProjectData {
  id: string;
  name: string;
  revenue: number;
  employee_count?: number;
}

export interface EmployeeProjectData {
  employee_id: string;
  project_id: string;
  project_revenue: number;
}

export interface BonusCalculationResult {
  employee_id: string;
  employee_name: string;
  contribution_score: number;
  revenue_score: number;
  salary_adjustment_score: number;
  weighted_score: number;
  bonus_amount: number;
  bonus_percentage: number;
  calculation_details: {
    performance_rating: number;
    employee_revenue: number;
    salary: number;
    max_department_salary: number;
    total_department_revenue: number;
    projects: Array<{
      project_id: string;
      project_name: string;
      project_revenue: number;
      employee_share: number;
    }>;
  };
}

/**
 * Calculate contribution score based on performance rating
 * CS = (Performance_Rating / Max_Rating) × 100
 */
export function calculateContributionScore(performanceRating: number): number {
  const maxRating = 10;
  return (performanceRating / maxRating) * 100;
}

/**
 * Calculate revenue participation score
 * RPS = (Employee_Revenue / Total_Department_Revenue) × 100
 */
export function calculateRevenueScore(
  employeeRevenue: number,
  totalDepartmentRevenue: number
): number {
  if (totalDepartmentRevenue === 0) return 0;
  return (employeeRevenue / totalDepartmentRevenue) * 100;
}

/**
 * Calculate salary adjustment score (inverse relationship)
 * SAS = (1 - (Employee_Salary / Max_Department_Salary)) × 100
 */
export function calculateSalaryAdjustmentScore(
  employeeSalary: number,
  maxDepartmentSalary: number
): number {
  if (maxDepartmentSalary === 0) return 0;
  return (1 - employeeSalary / maxDepartmentSalary) * 100;
}

/**
 * Calculate weighted score
 * Weighted_Score = (CS × 0.40) + (RPS × 0.40) + (SAS × 0.20)
 */
export function calculateWeightedScore(
  contributionScore: number,
  revenueScore: number,
  salaryAdjustmentScore: number
): number {
  return contributionScore * 0.4 + revenueScore * 0.4 + salaryAdjustmentScore * 0.2;
}

/**
 * Calculate employee's share of project revenues
 */
export async function calculateEmployeeRevenue(
  employeeId: string,
  bonusPeriodId: string
): Promise<{ totalRevenue: number; projectDetails: any[] }> {
  const supabase = await createClient();

  // Get all projects the employee worked on with their revenues
  const { data: employeeProjects, error } = await supabase
    .from('employee_projects')
    .select(`
      project_id,
      projects!inner (
        id,
        name,
        revenue,
        department_id
      )
    `)
    .eq('employee_id', employeeId);

  if (error || !employeeProjects) {
    console.error('Error fetching employee projects:', error);
    return { totalRevenue: 0, projectDetails: [] };
  }

  let totalRevenue = 0;
  const projectDetails = [];

  for (const ep of employeeProjects) {
    const project = (ep as any).projects;
    
    // Count employees on this project
    const { count: employeeCount } = await supabase
      .from('employee_projects')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id);

    const employeeShare = employeeCount && employeeCount > 0 
      ? project.revenue / employeeCount 
      : 0;

    totalRevenue += employeeShare;
    
    projectDetails.push({
      project_id: project.id,
      project_name: project.name,
      project_revenue: project.revenue,
      employee_count: employeeCount || 0,
      employee_share: employeeShare
    });
  }

  return { totalRevenue, projectDetails };
}

/**
 * Get total department revenue for the period
 */
export async function getTotalDepartmentRevenue(departmentId: string): Promise<number> {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('revenue')
    .eq('department_id', departmentId)
    .eq('status', 'active');

  if (error || !projects) {
    console.error('Error fetching department revenue:', error);
    return 0;
  }

  return projects.reduce((total, project) => total + Number(project.revenue), 0);
}

/**
 * Get maximum salary in department
 */
export async function getMaxDepartmentSalary(departmentId: string): Promise<number> {
  const supabase = await createClient();

  const { data: employees, error } = await supabase
    .from('employees')
    .select('salary')
    .eq('department_id', departmentId)
    .eq('status', 'active')
    .order('salary', { ascending: false })
    .limit(1);

  if (error || !employees || employees.length === 0) {
    console.error('Error fetching max salary:', error);
    return 0;
  }

  return Number(employees[0].salary);
}

/**
 * Main function to calculate bonuses for all employees in a bonus period
 */
export async function calculateBonusesForPeriod(
  bonusPeriodId: string
): Promise<{
  success: boolean;
  results?: BonusCalculationResult[];
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get bonus period details
    const { data: bonusPeriod, error: periodError } = await supabase
      .from('bonus_periods')
      .select('*')
      .eq('id', bonusPeriodId)
      .single();

    if (periodError || !bonusPeriod) {
      return { success: false, error: 'Bonus period not found' };
    }

    const departmentId = bonusPeriod.department_id;
    const bonusPool = Number(bonusPeriod.bonus_pool);

    // Get all active employees in the department with their ratings
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        *,
        employee_ratings!left (
          performance_rating,
          notes
        )
      `)
      .eq('department_id', departmentId)
      .eq('status', 'active')
      .eq('employee_ratings.bonus_period_id', bonusPeriodId);

    if (employeesError || !employees) {
      return { success: false, error: 'Failed to fetch employees' };
    }

    // Get department metrics
    const totalDepartmentRevenue = await getTotalDepartmentRevenue(departmentId);
    const maxDepartmentSalary = await getMaxDepartmentSalary(departmentId);

    // Calculate scores for each employee
    const results: BonusCalculationResult[] = [];
    let totalWeightedScore = 0;

    for (const employee of employees) {
      const performanceRating = (employee as any).employee_ratings?.[0]?.performance_rating || 5; // Default to 5 if not rated
      const salary = Number(employee.salary);

      // Calculate individual scores
      const contributionScore = calculateContributionScore(performanceRating);
      
      const { totalRevenue: employeeRevenue, projectDetails } = await calculateEmployeeRevenue(
        employee.id,
        bonusPeriodId
      );
      
      const revenueScore = calculateRevenueScore(employeeRevenue, totalDepartmentRevenue);
      const salaryAdjustmentScore = calculateSalaryAdjustmentScore(salary, maxDepartmentSalary);
      
      const weightedScore = calculateWeightedScore(
        contributionScore,
        revenueScore,
        salaryAdjustmentScore
      );

      totalWeightedScore += weightedScore;

      results.push({
        employee_id: employee.id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        contribution_score: contributionScore,
        revenue_score: revenueScore,
        salary_adjustment_score: salaryAdjustmentScore,
        weighted_score: weightedScore,
        bonus_amount: 0, // Will be calculated after we have total weighted score
        bonus_percentage: 0, // Will be calculated after we have total weighted score
        calculation_details: {
          performance_rating: performanceRating,
          employee_revenue: employeeRevenue,
          salary: salary,
          max_department_salary: maxDepartmentSalary,
          total_department_revenue: totalDepartmentRevenue,
          projects: projectDetails
        }
      });
    }

    // Calculate bonus amounts and percentages
    for (const result of results) {
      if (totalWeightedScore > 0) {
        result.bonus_percentage = (result.weighted_score / totalWeightedScore) * 100;
        result.bonus_amount = (result.weighted_score / totalWeightedScore) * bonusPool;
      }
    }

    // Save calculations to database
    for (const result of results) {
      const { error: saveError } = await supabase
        .from('bonus_calculations')
        .upsert({
          bonus_period_id: bonusPeriodId,
          employee_id: result.employee_id,
          contribution_score: result.contribution_score,
          revenue_score: result.revenue_score,
          salary_adjustment_score: result.salary_adjustment_score,
          weighted_score: result.weighted_score,
          bonus_amount: result.bonus_amount,
          bonus_percentage: result.bonus_percentage,
          calculation_details: result.calculation_details
        }, {
          onConflict: 'bonus_period_id,employee_id'
        });

      if (saveError) {
        console.error('Error saving calculation:', saveError);
      }
    }

    // Update bonus period status
    await supabase
      .from('bonus_periods')
      .update({ 
        status: 'calculated',
        updated_at: new Date().toISOString()
      })
      .eq('id', bonusPeriodId);

    return { success: true, results };
  } catch (error) {
    console.error('Error calculating bonuses:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Recalculate bonuses for a specific employee
 */
export async function recalculateEmployeeBonus(
  bonusPeriodId: string,
  employeeId: string
): Promise<{
  success: boolean;
  result?: BonusCalculationResult;
  error?: string;
}> {
  const supabase = await createClient();

  try {
    // Get bonus period details
    const { data: bonusPeriod, error: periodError } = await supabase
      .from('bonus_periods')
      .select('*')
      .eq('id', bonusPeriodId)
      .single();

    if (periodError || !bonusPeriod) {
      return { success: false, error: 'Bonus period not found' };
    }

    const departmentId = bonusPeriod.department_id;
    const bonusPool = Number(bonusPeriod.bonus_pool);

    // Get employee details with rating
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        *,
        employee_ratings!left (
          performance_rating,
          notes
        )
      `)
      .eq('id', employeeId)
      .eq('employee_ratings.bonus_period_id', bonusPeriodId)
      .single();

    if (employeeError || !employee) {
      return { success: false, error: 'Employee not found' };
    }

    // Get department metrics
    const totalDepartmentRevenue = await getTotalDepartmentRevenue(departmentId);
    const maxDepartmentSalary = await getMaxDepartmentSalary(departmentId);

    // Calculate scores
    const performanceRating = (employee as any).employee_ratings?.[0]?.performance_rating || 5;
    const salary = Number(employee.salary);

    const contributionScore = calculateContributionScore(performanceRating);
    
    const { totalRevenue: employeeRevenue, projectDetails } = await calculateEmployeeRevenue(
      employee.id,
      bonusPeriodId
    );
    
    const revenueScore = calculateRevenueScore(employeeRevenue, totalDepartmentRevenue);
    const salaryAdjustmentScore = calculateSalaryAdjustmentScore(salary, maxDepartmentSalary);
    
    const weightedScore = calculateWeightedScore(
      contributionScore,
      revenueScore,
      salaryAdjustmentScore
    );

    // Get total weighted score for all employees
    const { data: allCalculations, error: calcError } = await supabase
      .from('bonus_calculations')
      .select('weighted_score')
      .eq('bonus_period_id', bonusPeriodId);

    if (calcError) {
      return { success: false, error: 'Failed to fetch calculations' };
    }

    const totalWeightedScore = allCalculations?.reduce(
      (sum, calc) => sum + Number(calc.weighted_score), 
      0
    ) || weightedScore;

    const bonusPercentage = totalWeightedScore > 0 
      ? (weightedScore / totalWeightedScore) * 100 
      : 0;
    const bonusAmount = totalWeightedScore > 0 
      ? (weightedScore / totalWeightedScore) * bonusPool 
      : 0;

    const result: BonusCalculationResult = {
      employee_id: employee.id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      contribution_score: contributionScore,
      revenue_score: revenueScore,
      salary_adjustment_score: salaryAdjustmentScore,
      weighted_score: weightedScore,
      bonus_amount: bonusAmount,
      bonus_percentage: bonusPercentage,
      calculation_details: {
        performance_rating: performanceRating,
        employee_revenue: employeeRevenue,
        salary: salary,
        max_department_salary: maxDepartmentSalary,
        total_department_revenue: totalDepartmentRevenue,
        projects: projectDetails
      }
    };

    // Save updated calculation
    const { error: saveError } = await supabase
      .from('bonus_calculations')
      .upsert({
        bonus_period_id: bonusPeriodId,
        employee_id: result.employee_id,
        contribution_score: result.contribution_score,
        revenue_score: result.revenue_score,
        salary_adjustment_score: result.salary_adjustment_score,
        weighted_score: result.weighted_score,
        bonus_amount: result.bonus_amount,
        bonus_percentage: result.bonus_percentage,
        calculation_details: result.calculation_details
      }, {
        onConflict: 'bonus_period_id,employee_id'
      });

    if (saveError) {
      return { success: false, error: 'Failed to save calculation' };
    }

    return { success: true, result };
  } catch (error) {
    console.error('Error recalculating employee bonus:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}