export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string; // ISO string format
  createdAt: string;
  category?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string;
  templateId?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  tags?: string[];
}

const STORAGE_KEY = 'finance_transactions';
const BUDGETS_KEY = 'finance_budgets';
const TEMPLATES_KEY = 'finance_templates';

// Transaction Management
export function getTransactions(): Transaction[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    return Array.isArray(transactions) ? transactions : [];
  } catch (error) {
    console.error('Error reading transactions from localStorage:', error);
    return [];
  }
}

export function saveTransaction(newTransaction: Transaction): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingTransactions = getTransactions();
    const updatedTransactions = [...existingTransactions, newTransaction];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error saving transaction to localStorage:', error);
    throw new Error('Failed to save transaction');
  }
}

export function updateTransaction(updatedTransaction: Transaction): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingTransactions = getTransactions();
    const updatedTransactions = existingTransactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error updating transaction in localStorage:', error);
    throw new Error('Failed to update transaction');
  }
}

export function deleteTransaction(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingTransactions = getTransactions();
    const filteredTransactions = existingTransactions.filter(t => t.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTransactions));
  } catch (error) {
    console.error('Error deleting transaction from localStorage:', error);
    throw new Error('Failed to delete transaction');
  }
}

// Budget Management
export function getBudgets(): Budget[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(BUDGETS_KEY);
    if (!stored) return [];
    
    const budgets = JSON.parse(stored);
    return Array.isArray(budgets) ? budgets : [];
  } catch (error) {
    console.error('Error reading budgets from localStorage:', error);
    return [];
  }
}

export function saveBudget(newBudget: Budget): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingBudgets = getBudgets();
    const updatedBudgets = [...existingBudgets, newBudget];
    
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(updatedBudgets));
  } catch (error) {
    console.error('Error saving budget to localStorage:', error);
    throw new Error('Failed to save budget');
  }
}

export function updateBudget(updatedBudget: Budget): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingBudgets = getBudgets();
    const updatedBudgets = existingBudgets.map(b => 
      b.id === updatedBudget.id ? updatedBudget : b
    );
    
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(updatedBudgets));
  } catch (error) {
    console.error('Error updating budget in localStorage:', error);
    throw new Error('Failed to update budget');
  }
}

export function deleteBudget(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingBudgets = getBudgets();
    const filteredBudgets = existingBudgets.filter(b => b.id !== id);
    
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(filteredBudgets));
  } catch (error) {
    console.error('Error deleting budget from localStorage:', error);
    throw new Error('Failed to delete budget');
  }
}

// Template Management
export function getTemplates(): TransactionTemplate[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (!stored) return [];
    
    const templates = JSON.parse(stored);
    return Array.isArray(templates) ? templates : [];
  } catch (error) {
    console.error('Error reading templates from localStorage:', error);
    return [];
  }
}

export function saveTemplate(newTemplate: TransactionTemplate): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingTemplates = getTemplates();
    const updatedTemplates = [...existingTemplates, newTemplate];
    
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error('Error saving template to localStorage:', error);
    throw new Error('Failed to save template');
  }
}

export function deleteTemplate(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingTemplates = getTemplates();
    const filteredTemplates = existingTemplates.filter(t => t.id !== id);
    
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filteredTemplates));
  } catch (error) {
    console.error('Error deleting template from localStorage:', error);
    throw new Error('Failed to delete template');
  }
}

// Data Export/Import
export function exportAllData(): string {
  try {
    const data = {
      transactions: getTransactions(),
      budgets: getBudgets(),
      templates: getTemplates(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

export function importAllData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.transactions) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions));
    }
    if (data.budgets) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));
    }
    if (data.templates) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data.templates));
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data');
  }
}

// Recurring Transactions
export function processRecurringTransactions(): Transaction[] {
  try {
    const transactions = getTransactions();
    const recurringTransactions = transactions.filter(t => t.isRecurring);
    const newTransactions: Transaction[] = [];
    
    recurringTransactions.forEach(transaction => {
      if (!transaction.recurringPattern || !transaction.recurringEndDate) return;
      
      const lastDate = new Date(transaction.date);
      const endDate = new Date(transaction.recurringEndDate);
      const today = new Date();
      
      if (today > endDate) return;
      
      let nextDate = new Date(lastDate);
      const pattern = transaction.recurringPattern;
      
      switch (pattern) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
      
      if (nextDate <= today && nextDate <= endDate) {
        const newTransaction: Transaction = {
          ...transaction,
          id: generateId(),
          date: nextDate.toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          isRecurring: false,
          recurringPattern: undefined,
          recurringEndDate: undefined
        };
        newTransactions.push(newTransaction);
      }
    });
    
    newTransactions.forEach(t => saveTransaction(t));
    return newTransactions;
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    return [];
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Utility functions for data aggregation
export function aggregateTransactionsByPeriod(
  transactions: Transaction[],
  period: 'daily' | 'monthly' | 'yearly'
): { date: string; income: number; expense: number; net: number }[] {
  const grouped: { [key: string]: { income: number; expense: number } } = {};

  transactions.forEach(transaction => {
    let key: string;
    const date = new Date(transaction.date);
    
    switch (period) {
      case 'daily':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'monthly':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        break;
      case 'yearly':
        key = date.getFullYear().toString(); // YYYY
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = { income: 0, expense: 0 };
    }

    if (transaction.type === 'income') {
      grouped[key].income += transaction.amount;
    } else {
      grouped[key].expense += transaction.amount;
    }
  });

  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
