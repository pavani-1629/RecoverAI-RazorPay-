import { Code2, ShieldAlert, Cpu } from 'lucide-react';

export const AgentToolsVisualization = () => {
  const tools = [
    {
      name: 'get_transaction(transaction_id)',
      role: 'Context Extraction',
      badge: 'Database Layer',
      icon: <ShieldAlert className="w-5 h-5 text-sky-400" />,
      params: 'transaction_id: int',
      returns: '{ id, amount, currency, status, failure_reason, payment_method, retry_count }',
      description:
        'Retrieves ground truth metadata for the failed payment directly from PostgreSQL.',
    },
    {
      name: 'get_recovery_prediction(transaction_id)',
      role: 'ML Inference',
      badge: 'Inference Layer',
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      params: 'transaction_id: int',
      returns: '{ recovery_probability, recoverable, threshold }',
      description:
        'Builds leak-free feature vector from customer history and executes Scikit-learn model inference.',
    },
    {
      name: 'get_recovery_decision(transaction_id)',
      role: 'Policy Compliance',
      badge: 'Guardrail Layer',
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      params: 'transaction_id: int',
      returns: '{ action, priority, reason }',
      description:
        'Applies deterministic business rules and stopping limits. Enforces that the LLM agent never invents or overrides actions.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Agentic Tool Calling Matrix</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          RecoverAI is a tool-augmented agentic control plane, not a free-form chatbot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                {tool.icon}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {tool.badge}
              </span>
            </div>

            <div>
              <code className="text-xs font-mono font-bold text-sky-300 bg-slate-950 px-2 py-1 rounded block border border-slate-800">
                {tool.name}
              </code>
              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">{tool.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px]">
              <div className="text-slate-500">
                Input: <span className="text-slate-300">{tool.params}</span>
              </div>
              <div className="text-slate-500 truncate">
                Returns: <span className="text-cyan-400">{tool.returns}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
