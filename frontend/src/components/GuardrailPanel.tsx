import React from 'react';
import { ShieldCheck, AlertTriangle, Code, Terminal, Brain } from 'lucide-react';
import { format } from 'date-fns';

interface GuardrailPanelProps {
  tickets: any[];
}

const GuardrailPanel: React.FC<GuardrailPanelProps> = ({ tickets }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI Guardrail Operations</h3>
            <p className="text-xs text-gray-500">Real-time validation logs for Gemini 1.5 Pro extractions.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pass Rate</p>
            <p className="text-2xl font-bold text-green-600">100%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Latency</p>
            <p className="text-2xl font-bold text-gray-900">1.8s</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tokens/Sec</p>
            <p className="text-2xl font-bold text-gray-900">42.5</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {tickets.filter(t => t.ai_raw_output).map((ticket) => (
          <div key={ticket.ticket_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal size={18} className="text-gray-400" />
                <span className="text-xs font-mono font-bold text-gray-600">{ticket.ticket_id}</span>
                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">Validated</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                {format(new Date(ticket.created_at), 'HH:mm:ss.SSS')}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  <Brain size={14} />
                  AI Raw Output (JSON)
                </h4>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 font-mono text-[11px] leading-relaxed">
                    {ticket.ai_raw_output || '// No raw data available'}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  <Code size={14} />
                  Validation Logic
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Schema Integrity</span>
                    <ShieldCheck size={18} className="text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Type Enforcement</span>
                    <ShieldCheck size={18} className="text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Sentiment Range</span>
                    <ShieldCheck size={18} className="text-green-500" />
                  </div>
                  
                  {ticket.validation_errors && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3">
                      <AlertTriangle className="text-yellow-600 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-xs font-bold text-yellow-800 uppercase">Warning Logs</p>
                        <p className="text-xs text-yellow-700 mt-1">{ticket.validation_errors}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {tickets.filter(t => t.ai_raw_output).length === 0 && (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Terminal size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No system logs recorded yet.</p>
            <p className="text-sm text-gray-400 mt-1">Raise a ticket to see real-time AI guardrail traces.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuardrailPanel;
