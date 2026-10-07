import React, { useState, useEffect, useRef } from 'react';
import { ServiceRequest, ChatMessage, UserRole } from '../types';
import { X, Send, Phone, ShieldCheck, CheckCheck, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ChatModalProps {
  request: ServiceRequest | null;
  messages: ChatMessage[];
  currentRole: UserRole;
  onClose: () => void;
  onSendMessage: (requestId: string, text: string) => void;
}

const QUICK_REPLIES_CLIENT = [
  '¿A qué hora llegas aproximadamente?',
  'Ya estoy en la dirección indicada.',
  '¿Debo comprar algún material adicional?',
  'Listo, te espero en el apartamento.',
];

const QUICK_REPLIES_WORKER = [
  '¡Voy en camino con las herramientas! 🛵',
  'Llego en aproximadamente 15 minutos.',
  'Revisé el repuesto y ya lo tengo listo.',
  '¿Podrías confirmar el número de apartamento?',
];

export const ChatModal: React.FC<ChatModalProps> = ({
  request,
  messages,
  currentRole,
  onClose,
  onSendMessage,
}) => {
  if (!request) return null;

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const requestMessages = messages.filter((m) => m.requestId === request.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [requestMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(request.id, inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    onSendMessage(request.id, text);
  };

  const quickReplies = currentRole === 'trabajador' ? QUICK_REPLIES_WORKER : QUICK_REPLIES_CLIENT;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full h-[85vh] max-h-[700px] flex flex-col shadow-2xl border border-slate-200 my-auto overflow-hidden">
        
        {/* Chat Top Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={request.workerAvatar}
                alt={request.workerName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-sm text-[#0F172A] truncate max-w-[180px]">
                  {currentRole === 'trabajador' ? request.clientName : request.workerName}
                </h4>
                <StatusBadge status={request.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {currentRole === 'trabajador' ? `Cliente · ${request.neighborhood}` : request.workerTrade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${currentRole === 'trabajador' ? request.clientPhone : request.workerPhone}`}
              className="w-8 h-8 rounded-full bg-teal-50 hover:bg-teal-100 text-[#0F766E] flex items-center justify-center transition-colors"
              title="Llamar directamente"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar with request context */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800">{request.date}</span> · {request.timeSlot}
          </span>
          <span className="font-semibold text-[#0F766E] truncate shrink-0">
            ${request.estimatedCost.toLocaleString('es-CO')} COP
          </span>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
          {/* Security notice */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-500 shadow-2xs">
              <ShieldCheck className="w-3 h-3 text-[#0F766E]" />
              Chat seguro y auditado por Échele Camello
            </span>
          </div>

          {requestMessages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p>Inicia la conversación para coordinar los detalles de este camello.</p>
            </div>
          ) : (
            requestMessages.map((msg) => {
              // Is sender the current viewer?
              const isMe = msg.senderRole === currentRole;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {msg.senderName} · {msg.timestamp}
                  </div>

                  {/* Bubble according to design specs */}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-[#0F766E] text-white rounded-[1rem] rounded-br-[0.25rem]'
                        : 'bg-[#F1F5F9] text-[#0F172A] rounded-[1rem] rounded-bl-[0.25rem] border border-slate-200/60'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {isMe && (
                    <div className="text-[9px] text-teal-800 flex items-center gap-0.5 mt-0.5 px-1">
                      <CheckCheck className="w-3 h-3" />
                      <span>Entregado</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Bar */}
        <div className="bg-white border-t border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(qr)}
              className="text-[11px] whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors border border-slate-200 shrink-0"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="bg-white border-t border-slate-200 p-3 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje para coordinar el trabajo..."
            className="flex-1 h-11 px-3.5 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-xs text-[#0F172A] outline-hidden bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white flex items-center justify-center shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
