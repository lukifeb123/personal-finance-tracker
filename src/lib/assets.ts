export interface AssetAccount {
  id: string;
  name: string;
  type: 'investment';
  balance: number;
  description?: string;
  platformName?: string;
  accountNumber?: string;
  targetAmount?: number;
  expectedReturn?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetTransaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'interest' | 'profit' | 'loss' | 'transfer' | 'transfer_out';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface TransferTransaction {
  id: string;
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  type: 'transfer' | 'withdrawal';
  description: string;
  date: string;
  createdAt: string;
}

export interface MonthlyNetWorth {
  month: string;
  investment: number;
  total: number;
  growth: number;
}

export interface CashFlowReport {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  investmentAdded: number;
}

const ASSETS_KEY = 'finance_assets';
const ASSET_TRANSACTIONS_KEY = 'finance_asset_transactions';

// Asset Account Management
export function getAssetAccounts(): AssetAccount[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(ASSETS_KEY);
    if (!stored) return [];
    
    const accounts = JSON.parse(stored);
    return Array.isArray(accounts) ? accounts : [];
  } catch (error) {
    console.error('Error reading asset accounts from localStorage:', error);
    return [];
  }
}

export function saveAssetAccount(newAccount: Omit<AssetAccount, 'id' | 'createdAt' | 'updatedAt'>): AssetAccount {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot save asset account in server environment');
    }
    
    const existingAccounts = getAssetAccounts();
    const account: AssetAccount = {
      ...newAccount,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedAccounts = [...existingAccounts, account];
    localStorage.setItem(ASSETS_KEY, JSON.stringify(updatedAccounts));
    
    return account;
  } catch (error) {
    console.error('Error saving asset account to localStorage:', error);
    throw new Error('Failed to save asset account');
  }
}

export function updateAssetAccount(updatedAccount: AssetAccount): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingAccounts = getAssetAccounts();
    const updatedAccounts = existingAccounts.map(a => 
      a.id === updatedAccount.id 
        ? { ...updatedAccount, updatedAt: new Date().toISOString() }
        : a
    );
    
    localStorage.setItem(ASSETS_KEY, JSON.stringify(updatedAccounts));
  } catch (error) {
    console.error('Error updating asset account in localStorage:', error);
    throw new Error('Failed to update asset account');
  }
}

export function deleteAssetAccount(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const existingAccounts = getAssetAccounts();
    const filteredAccounts = existingAccounts.filter(a => a.id !== id);
    
    localStorage.setItem(ASSETS_KEY, JSON.stringify(filteredAccounts));
  } catch (error) {
    console.error('Error deleting asset account from localStorage:', error);
    throw new Error('Failed to delete asset account');
  }
}

// Asset Transaction Management
export function getAssetTransactions(): AssetTransaction[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(ASSET_TRANSACTIONS_KEY);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    return Array.isArray(transactions) ? transactions : [];
  } catch (error) {
    console.error('Error reading asset transactions from localStorage:', error);
    return [];
  }
}

export function saveAssetTransaction(newTransaction: Omit<AssetTransaction, 'id' | 'createdAt'>): AssetTransaction {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Cannot save asset transaction in server environment');
    }
    
    const existingTransactions = getAssetTransactions();
    const transaction: AssetTransaction = {
      ...newTransaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedTransactions = [...existingTransactions, transaction];
    localStorage.setItem(ASSET_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    
    // Update account balance
    updateAccountBalance(newTransaction.accountId, newTransaction.amount, newTransaction.type);
    
    return transaction;
  } catch (error) {
    console.error('Error saving asset transaction to localStorage:', error);
    throw new Error('Failed to save asset transaction');
  }
}

export function updateAccountBalance(accountId: string, amount: number, type: 'deposit' | 'withdrawal' | 'interest' | 'profit' | 'loss' | 'transfer' | 'transfer_out'): void {
  try {
    const accounts = getAssetAccounts();
    const updatedAccounts = accounts.map(account => {
      if (account.id === accountId) {
        let newBalance = account.balance;
        
        switch (type) {
          case 'deposit':
          case 'interest':
          case 'profit':
            newBalance += amount;
            break;
          case 'withdrawal':
          case 'loss':
            newBalance -= amount;
            break;
        }
        
        return {
          ...account,
          balance: Math.max(0, newBalance),
          updatedAt: new Date().toISOString(),
        };
      }
      return account;
    });
    
    localStorage.setItem(ASSETS_KEY, JSON.stringify(updatedAccounts));
  } catch (error) {
    console.error('Error updating account balance:', error);
    throw new Error('Failed to update account balance');
  }
}

// Utility Functions
export function getTotalAssets(): number {
  const accounts = getAssetAccounts();
  return accounts.reduce((total, account) => total + account.balance, 0);
}

export function getAssetsByType(): { type: AssetAccount['type']; total: number; count: number }[] {
  const accounts = getAssetAccounts();
  const byType: Record<AssetAccount['type'], { total: number; count: number }> = {
    investment: { total: 0, count: 0 },
  };

  accounts.forEach(account => {
    if (byType[account.type]) {
      byType[account.type].total += account.balance;
      byType[account.type].count += 1;
    }
  });

  return Object.entries(byType).map(([type, data]) => ({
    type: type as AssetAccount['type'],
    total: data.total,
    count: data.count,
  }));
}

export function getAccountTransactions(accountId: string): AssetTransaction[] {
  const transactions = getAssetTransactions();
  return transactions.filter(t => t.accountId === accountId);
}

export function getAccountBalance(accountId: string): number {
  const accounts = getAssetAccounts();
  const account = accounts.find(a => a.id === accountId);
  return account?.balance || 0;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Monthly Net Worth Tracking
const MONTHLY_NET_WORTH_KEY = 'finance_monthly_net_worth';
const CASH_FLOW_REPORT_KEY = 'finance_cash_flow';

export function getMonthlyNetWorth(): MonthlyNetWorth[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(MONTHLY_NET_WORTH_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error reading monthly net worth:', error);
    return [];
  }
}

export function updateMonthlyNetWorth(): void {
  try {
    if (typeof window === 'undefined') return;
    
    const accounts = getAssetAccounts();
    const investment = accounts.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.balance, 0);
    const total = investment;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingData = getMonthlyNetWorth();
    
    const lastMonthData = existingData[existingData.length - 1];
    const growth = lastMonthData ? ((total - lastMonthData.total) / lastMonthData.total) * 100 : 0;
    
    const updatedData = existingData.filter(d => d.month !== currentMonth);
    updatedData.push({
      month: currentMonth,
      investment,
      total,
      growth: Math.round(growth * 100) / 100
    });
    
    // Keep only last 12 months
    const finalData = updatedData.slice(-12);
    localStorage.setItem(MONTHLY_NET_WORTH_KEY, JSON.stringify(finalData));
  } catch (error) {
    console.error('Error updating monthly net worth:', error);
  }
}

// Cash Flow vs Investment Tracking
export function getCashFlowReport(): CashFlowReport[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(CASH_FLOW_REPORT_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error reading cash flow report:', error);
    return [];
  }
}

export function updateCashFlowReport(income: number, expenses: number, investmentAdded: number): void {
  try {
    if (typeof window === 'undefined') return;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existingData = getCashFlowReport();
    
    const updatedData = existingData.filter(d => d.month !== currentMonth);
    updatedData.push({
      month: currentMonth,
      income,
      expenses,
      netCashFlow: income - expenses,
      investmentAdded
    });
    
    // Keep only last 12 months
    const finalData = updatedData.slice(-12);
    localStorage.setItem(CASH_FLOW_REPORT_KEY, JSON.stringify(finalData));
  } catch (error) {
    console.error('Error updating cash flow report:', error);
  }
}

// Update functions - manual control
export function updateCashFlowFromTransactions(income: number, expenses: number): void {
  const netCashFlow = income - expenses;
  updateCashFlowReport(income, expenses, 0); // Manual allocation
  updateMonthlyNetWorth();
}

// Data Export/Import for Assets
export function exportAssetData(): string {
  try {
    const data = {
      accounts: getAssetAccounts(),
      transactions: getAssetTransactions(),
      monthlyNetWorth: getMonthlyNetWorth(),
      cashFlowReport: getCashFlowReport(),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting asset data:', error);
    throw new Error('Failed to export asset data');
  }
}

export function importAssetData(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.accounts) {
      localStorage.setItem(ASSETS_KEY, JSON.stringify(data.accounts));
    }
    if (data.transactions) {
      localStorage.setItem(ASSET_TRANSACTIONS_KEY, JSON.stringify(data.transactions));
    }
    if (data.monthlyNetWorth) {
      localStorage.setItem(MONTHLY_NET_WORTH_KEY, JSON.stringify(data.monthlyNetWorth));
    }
    if (data.cashFlowReport) {
      localStorage.setItem(CASH_FLOW_REPORT_KEY, JSON.stringify(data.cashFlowReport));
    }
  } catch (error) {
    console.error('Error importing asset data:', error);
    throw new Error('Failed to import asset data');
  }
}
