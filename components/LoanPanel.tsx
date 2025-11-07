
import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import Button from './ui/Button';
import { LOAN_APR, MAX_LOAN_MULTIPLIER } from '../constants';
import { cn } from '../lib/utils';

const LoanPanel: React.FC = () => {
  const { t } = useTranslation();
  const { portfolio, takeLoan, repayLoan } = usePortfolio();
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(7); // Default to 7 days
  const [repaymentAmount, setRepaymentAmount] = useState(0);

  const ownedUsd = portfolio.loan ? portfolio.usdBalance - portfolio.loan.principal : portfolio.usdBalance;
  const maxLoan = ownedUsd * MAX_LOAN_MULTIPLIER;

  const numericAmount = parseFloat(amount);
  const isAmountValid = !isNaN(numericAmount) && numericAmount > 0;
  const exceedsMax = isAmountValid && numericAmount > maxLoan;

  const loanPeriods = [
    { days: 1, label: t('bank.days', { count: 1 }) },
    { days: 3, label: t('bank.days_plural', { count: 3 }) },
    { days: 7, label: t('bank.days_plural', { count: 7 }) },
    { days: 30, label: t('bank.month') }
  ];

  const { totalInterest, totalRepayment } = useMemo(() => {
    if (!isAmountValid) return { totalInterest: 0, totalRepayment: 0 };
    const years = period / 365;
    const interest = numericAmount * LOAN_APR * years;
    return {
        totalInterest: interest,
        totalRepayment: numericAmount + interest,
    };
  }, [numericAmount, period, isAmountValid]);

  useEffect(() => {
    if (portfolio.loan) {
        const calculateRepayment = () => {
            const daysPassed = (new Date().getTime() - portfolio.loan!.loanDate.getTime()) / (1000 * 3600 * 24);
            const yearsPassed = daysPassed / 365;
            const interest = portfolio.loan!.principal * portfolio.loan!.interestRate * yearsPassed;
            const totalRepayment = portfolio.loan!.principal + interest;
            // Round to 2 decimal places for display
            const roundedRepayment = Math.round(totalRepayment * 100) / 100;
            setRepaymentAmount(roundedRepayment);
        };
        calculateRepayment(); // Initial calculation
        const interval = setInterval(calculateRepayment, 1000); // Update every second
        return () => clearInterval(interval);
    }
  }, [portfolio.loan]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and numbers with up to two decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleTakeLoan = () => {
    if (isAmountValid && !exceedsMax) {
        const roundedAmount = Math.round(numericAmount * 100) / 100;
        takeLoan(roundedAmount, period);
        setAmount('');
    }
  };

  if (portfolio.loan) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('bank.activeLoan')}</CardTitle>
                <CardDescription>{t('bank.dueDate')}: {portfolio.loan.dueDate.toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">{t('bank.principal')}</span>
                    <span className="text-2xl font-bold">{portfolio.loan.principal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">{t('bank.loanDate')}</span>
                    <span className="font-mono">{portfolio.loan.loanDate.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="text-muted-foreground">{t('bank.interestRateAPR')}</span>
                    <span className="font-mono">{(LOAN_APR * 100).toFixed(2)}%</span>
                </div>
                <div className="border-t pt-4 mt-4 text-center">
                    <p className="text-muted-foreground">{t('bank.amountToRepayNow')}</p>
                    <p className="text-3xl font-bold text-primary">{repaymentAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={repayLoan} className="w-full" disabled={portfolio.usdBalance < repaymentAmount} variant="destructive">
                    {t('bank.repayLoan')}
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('bank.title')}</CardTitle>
        <CardDescription>{t('bank.noLoan')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground">{t('bank.availableCollateral')}</p>
                <p className="text-xl font-bold">{ownedUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{t('bank.maxLoanAmount')}</p>
                <p className="text-xl font-bold">{maxLoan.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <label htmlFor="loan-amount" className="text-sm font-medium">{t('bank.loanAmount')}</label>
            <Input id="loan-amount" type="text" value={amount} onChange={handleAmountChange} placeholder="0.00" />
            {exceedsMax && <p className="text-sm text-brand-red">{t('bank.notifications.loanTooHigh')}</p>}
        </div>

        <div className="space-y-2">
            <p className="text-sm font-medium">{t('bank.repaymentPeriod')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {loanPeriods.map(p => (
                    <Button key={p.days} variant={period === p.days ? 'default' : 'outline'} onClick={() => setPeriod(p.days)}>
                        {p.label}
                    </Button>
                ))}
            </div>
        </div>

        {isAmountValid && (
             <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold">{t('bank.summary')}</h4>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('bank.interestRateAPR')}</span>
                    <span>{(LOAN_APR * 100).toFixed(2)}%</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('bank.totalInterest')}</span>
                    <span>{totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                 <div className="flex justify-between font-bold">
                    <span>{t('bank.totalRepayment')}</span>
                    <span>{totalRepayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter>
         <Button onClick={handleTakeLoan} className="w-full" disabled={!isAmountValid || exceedsMax}>
            {t('bank.takeLoan')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoanPanel;