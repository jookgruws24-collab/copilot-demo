'use client';

import { Card, CardContent } from '@/components/ui';

interface DiamondBalanceProps {
  balance: number;
  className?: string;
}

export function DiamondBalance({ balance, className = '' }: DiamondBalanceProps) {
  return (
    <Card className={`bg-gradient-to-br from-purple-500 to-blue-600 text-white ${className}`}>
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">Your Balance</p>
          <div className="flex items-center justify-center gap-2 text-4xl font-bold">
            <span>💎</span>
            <span>{balance.toLocaleString()}</span>
          </div>
          <p className="text-xs opacity-75 mt-2">Diamonds</p>
        </div>
      </CardContent>
    </Card>
  );
}
