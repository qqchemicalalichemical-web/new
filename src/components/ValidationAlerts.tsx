import React from 'react';
import { ValidationIssue } from '../types';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface ValidationAlertsProps {
  issues: ValidationIssue[];
}

export const ValidationAlerts: React.FC<ValidationAlertsProps> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {issues.map(issue => {
        const isError = issue.severity === 'error';
        const isWarning = issue.severity === 'warning';

        return (
          <div
            key={issue.id}
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed shadow-lg ${
              isError
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : isWarning
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {isError ? (
              <AlertOctagon className="w-5 h-5 text-rose-400 flex-none mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
            )}

            <div className="space-y-1">
              <div className="font-bold text-sm">{issue.messageAr}</div>
              {issue.recommendationAr && (
                <div className="opacity-90 font-mono">توجيه العلاج الهندسي: {issue.recommendationAr}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
