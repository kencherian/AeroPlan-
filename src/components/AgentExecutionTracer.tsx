import React, { useState } from 'react';
import { 
  Bot, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Calculator,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import { AgentTraceStep } from '../types.ts';

interface AgentExecutionTracerProps {
  traces: AgentTraceStep[];
  isLoading: boolean;
  executionTimeMs?: number;
}

export const AgentExecutionTracer: React.FC<AgentExecutionTracerProps> = ({
  traces,
  isLoading,
  executionTimeMs,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    traces.forEach((t) => (all[t.id] = true));
    setExpandedSteps(all);
  };

  const collapseAll = () => {
    setExpandedSteps({});
  };

  if (traces.length === 0 && !isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">Agent Reasoning Engine Idle</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Click "Run Autonomous Agent" above to watch the agent parse constraints, query flight and hotel tools sequentially, and execute self-correction reflection loops.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Tracer Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Agentic Execution & Reflection Trace
          </span>
          {executionTimeMs !== undefined && (
            <span className="text-xs font-mono text-slate-500">
              · {executionTimeMs}ms elapsed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded transition-colors"
          >
            Expand All
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={collapseAll}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4 space-y-3 font-sans">
        {traces.map((step, idx) => {
          const isExpanded = expandedSteps[step.id] ?? true;
          const isReflection = step.type === 'agentic_reflection';
          const isFailure = step.type === 'failure_deficit';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              className={`rounded-lg border transition-all ${
                isFailure
                  ? 'bg-rose-950/20 border-rose-800/60'
                  : isReflection
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              {/* Step Title Row */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full text-left p-3 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isFailure ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : isReflection ? (
                      <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {step.title}
                      </span>
                      {step.details?.is_correction && (
                        <span className="text-[10px] font-mono font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded">
                          Self-Correction
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="text-slate-500 hover:text-slate-300 mt-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Step Expanded Details */}
              {isExpanded && step.details && (
                <div className="px-4 pb-3 pt-1 border-t border-slate-800/60 space-y-2 text-xs">
                  {/* Budget Arithmetic Ledger */}
                  {step.details.budget_math && (
                    <div className="bg-slate-900/90 rounded p-2.5 border border-slate-800 font-mono text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-slate-500 block">Total Budget:</span>
                        <span className="text-slate-200 font-semibold tabular-nums">
                          ${step.details.budget_math.total_budget.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Flight Allocation:</span>
                        <span className="text-indigo-300 font-semibold tabular-nums">
                          -${step.details.budget_math.flight_cost}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Rem. for Hotel:</span>
                        <span className="text-slate-200 font-semibold tabular-nums">
                          ${step.details.budget_math.remaining_for_hotel}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Nightly Ceiling:</span>
                        <span className="text-amber-300 font-semibold tabular-nums">
                          ${step.details.budget_math.max_nightly_ceiling}/night ({step.details.budget_math.nights}n)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reflection Notes */}
                  {step.details.reflection_notes && (
                    <div className="space-y-1 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded">
                      <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Agent Reflection Insights:
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-amber-200/80 space-y-0.5">
                        {step.details.reflection_notes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tool Call Parameters */}
                  {step.details.tool_name && step.details.params && (
                    <div className="bg-slate-900/90 rounded p-2 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                      <span className="text-indigo-400 font-semibold">{step.details.tool_name}</span>
                      <span>(</span>
                      {Object.entries(step.details.params).map(([k, v], i, arr) => (
                        <span key={k}>
                          <span className="text-slate-300">{k}</span>=
                          <span className="text-emerald-400">"{String(v)}"</span>
                          {i < arr.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                      <span>)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="p-3 bg-slate-950/60 border border-indigo-500/40 rounded-lg flex items-center gap-3 animate-pulse">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            <span className="text-xs text-indigo-300 font-medium">
              Autonomous Agent actively reflecting on tool outputs and validating mathematical constraints...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
