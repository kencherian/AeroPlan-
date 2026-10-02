import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  ChevronDown,
  ChevronRight,
  Feather,
  Coffee
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
      <div className="bg-white border border-[#EFECE6] rounded-2xl p-10 text-center">
        <Feather className="w-10 h-10 text-[#8A9A86] mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-[#3E3832]">Ready to Thoughtfully Plan With You</h3>
        <p className="text-xs text-[#8C8279] max-w-md mx-auto mt-1">
          Click "Craft My Peaceful Getaway" above. You can follow each calm step as we thoughtfully explore flights, check lovely stays, and ensure complete peace of mind.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
      {/* Tracer Header */}
      <div className="px-6 py-4 border-b border-[#EFECE6] flex items-center justify-between bg-[#FDFCF9]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#73836F]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8279]">
            Mindful Reasoning & Tool Reflection Trace
          </span>
          {executionTimeMs !== undefined && (
            <span className="text-xs font-mono text-[#BBB4AA]">
              · {executionTimeMs}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-[11px] text-[#8C8279] hover:text-[#3E3832] px-2 py-0.5 rounded transition-colors"
          >
            Expand All
          </button>
          <span className="text-[#DED9D0]">·</span>
          <button
            onClick={collapseAll}
            className="text-[11px] text-[#8C8279] hover:text-[#3E3832] px-2 py-0.5 rounded transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-5 space-y-3 font-sans">
        {traces.map((step) => {
          const isExpanded = expandedSteps[step.id] ?? true;
          const isReflection = step.type === 'agentic_reflection';
          const isFailure = step.type === 'failure_deficit';
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={step.id}
              className={`rounded-xl border transition-all ${
                isFailure
                  ? 'bg-[#FAF4F0] border-[#ECD9D4]'
                  : isReflection
                  ? 'bg-[#FDF9F3] border-[#F2E5D0]'
                  : 'bg-[#F9F6F0] border-[#EFECE6]'
              }`}
            >
              {/* Step Title Row */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full text-left p-4 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isFailure ? (
                      <Heart className="w-4 h-4 text-[#C4736B] shrink-0" />
                    ) : isReflection ? (
                      <RotateCcw className="w-4 h-4 text-[#D98880] shrink-0 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#556B52] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#8A9A86] border-t-transparent animate-spin" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#3E3832]">
                        {step.title}
                      </span>
                      {step.details?.is_correction && (
                        <span className="text-[10px] font-mono font-medium text-[#C4736B] bg-[#E0A996]/20 border border-[#E0A996]/40 px-2 py-0.2 rounded-full">
                          Calm Self-Correction
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#524942] mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="text-[#8C8279] hover:text-[#3E3832] mt-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Step Expanded Details */}
              {isExpanded && step.details && (
                <div className="px-5 pb-4 pt-1 border-t border-[#EFECE6] space-y-2.5 text-xs">
                  {/* Budget Arithmetic Ledger */}
                  {step.details.budget_math && (
                    <div className="bg-white rounded-xl p-3 border border-[#EFECE6] font-mono text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2.5 shadow-2xs">
                      <div>
                        <span className="text-[#8C8279] block">Total Goal:</span>
                        <span className="text-[#3E3832] font-semibold tabular-nums">
                          ${step.details.budget_math.total_budget.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8279] block">Flight Fare:</span>
                        <span className="text-[#C4736B] font-semibold tabular-nums">
                          -${step.details.budget_math.flight_cost}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8279] block">Lodging Pool:</span>
                        <span className="text-[#3E3832] font-semibold tabular-nums">
                          ${step.details.budget_math.remaining_for_hotel}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8C8279] block">Nightly Allowance:</span>
                        <span className="text-[#556B52] font-semibold tabular-nums">
                          ${step.details.budget_math.max_nightly_ceiling}/night ({step.details.budget_math.nights}n)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reflection Notes */}
                  {step.details.reflection_notes && (
                    <div className="space-y-1 bg-white/90 border border-[#F2E5D0] p-3 rounded-xl shadow-2xs">
                      <div className="text-[11px] font-semibold text-[#8C6B45] flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 text-[#C4736B]" />
                        Companion Reflections & Care:
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-[#524942] space-y-0.5">
                        {step.details.reflection_notes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tool Call Parameters */}
                  {step.details.tool_name && step.details.params && (
                    <div className="bg-white rounded-xl p-2.5 border border-[#EFECE6] text-[11px] font-mono text-[#8C8279] overflow-x-auto shadow-2xs">
                      <span className="text-[#73836F] font-semibold">{step.details.tool_name}</span>
                      <span>(</span>
                      {Object.entries(step.details.params).map(([k, v], i, arr) => (
                        <span key={k}>
                          <span className="text-[#3E3832]">{k}</span>=
                          <span className="text-[#C4736B]">"{String(v)}"</span>
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
          <div className="p-4 bg-[#F9F6F0] border border-[#8A9A86]/40 rounded-xl flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#8A9A86] border-t-transparent animate-spin" />
            <span className="text-xs text-[#556B52] font-medium">
              We are gently querying real-time flight and hotel options to craft your ideal retreat...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
