import React, { useState } from 'react';
import { Code, Copy, Check, Download, CheckCircle2, Feather } from 'lucide-react';
import { AgentPlanOutput } from '../types.ts';

interface JsonViewerProps {
  data: AgentPlanOutput;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-${data.status}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#EFECE6] flex items-center justify-between bg-[#FDFCF9]">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-[#8A9A86]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Strict Programmatic Output (MIME: application/json)
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#556B52] bg-[#8A9A86]/15 border border-[#8A9A86]/30 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Schema Validated
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium text-[#3E3832] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#556B52]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8C8279]" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium text-[#3E3832] bg-[#F7F4EF] hover:bg-[#EFECE6] border border-[#E8E4DC] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8C8279]" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="p-5 bg-[#FAF7F2] text-[#3E3832] font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed border-t border-[#EFECE6]">
        <pre className="whitespace-pre">{jsonString}</pre>
      </div>
    </div>
  );
};
