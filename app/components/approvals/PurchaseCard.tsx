'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatDate } from '@/lib/utils/dates';

interface PurchaseCardProps {
  purchase: {
    id: number;
    employee_id: number;
    employee_name: string;
    product_name: string;
    diamond_cost: number;
    created_at: string;
  };
  children?: React.ReactNode;
}

export function PurchaseCard({ purchase, children }: PurchaseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <div className="text-xl font-bold">{purchase.product_name}</div>
            <div className="text-sm text-gray-500 font-normal mt-1">
              Requested by: {purchase.employee_name}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
            <span className="text-2xl">💎</span>
            <span className="text-lg font-bold text-purple-600">{purchase.diamond_cost}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Purchase ID</div>
            <div className="font-medium">#{purchase.id}</div>
          </div>
          <div>
            <div className="text-gray-500">Requested Date</div>
            <div className="font-medium">{formatDate(purchase.created_at)}</div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
