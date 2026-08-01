import React, { useState } from 'react';
import { FileText, Download, BarChart2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const BusinessReportsPage = () => {
  const [downloadingIdx, setDownloadingIdx] = useState(null);
  const [feedback, setFeedback] = useState('');

  const reports = [
    { title: 'Monthly Sustainability Report (July 2026)', size: '2.4 MB', date: '2026-07-30' },
    { title: 'Surplus Food Redistribution Summary', size: '1.8 MB', date: '2026-07-28' },
    { title: 'Financial Loss Avoidance Audit', size: '3.1 MB', date: '2026-07-25' },
  ];

  const handleDownload = (r, idx) => {
    setDownloadingIdx(idx);
    setTimeout(() => {
      // Generate CSV Blob for real file download
      const csvContent = `Report Title,Date Generated,Status\n"${r.title}",${r.date},"VERIFIED_AUDIT"`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${r.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingIdx(null);
      setFeedback(`Downloaded "${r.title}".`);
      setTimeout(() => setFeedback(''), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Audit Exports</h1>
        <p className="text-gray-500 text-sm mt-1">Export PDF and CSV reports for ESG compliance and tax deductions</p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Available Reports</h2>
        <div className="divide-y divide-gray-100">
          {reports.map((r, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{r.title}</h3>
                  <span className="text-xs text-gray-500">{r.date} &bull; {r.size}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(r, idx)}
                disabled={downloadingIdx === idx}
              >
                {downloadingIdx === idx ? (
                  <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                {downloadingIdx === idx ? 'Downloading...' : 'Download'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
