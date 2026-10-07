import React, { useState } from 'react';
import { Worker, ServiceRequest } from '../types';
import { X, Calendar, Clock, MapPin, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  worker: Worker | null;
  onClose: () => void;
  onSubmit: (newRequest: Omit<ServiceRequest, 'id' | 'createdAt'>) => void;
}

const TIME_SLOTS = [
  { id: '08:00', label: '08:00 AM - 10:00 AM' },
  { id: '10:00', label: '10:00 AM - 12:00 PM' },
  { id: '14:00', label: '02:00 PM - 04:00 PM' },
  { id: '16:00', label: '04:00 PM - 06:00 PM' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  worker,
  onClose,
  onSubmit,
}) => {
  if (!worker) return null;

  // Defaults: tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [address, setAddress] = useState('Calle 67 # 8-32, Apto 402');
  const [neighborhood, setNeighborhood] = useState('Chapinero');
  const [description, setDescription] = useState('');
  const [clientPhone, setClientPhone] = useState('+57 310 908 1234');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if chosen date + slot is conflicting
  const slotKey = `${date}T${selectedSlot.id}`;
  const isConflict = worker.unavailableSlots?.includes(slotKey);

  // Check if date is in the past
  const isPastDate = date < todayStr;

  const totalEstimate = worker.baseServiceRate + (worker.hourlyRate * (estimatedHours - 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isPastDate) {
      setErrorMessage('No es posible agendar en fechas pasadas. Por favor selecciona una fecha válida.');
      return;
    }

    if (isConflict) {
      setErrorMessage(
        `Conflicto de agenda: ${worker.name} ya tiene un servicio comprometido en el horario de las ${selectedSlot.label} del ${date}. Por favor selecciona otro horario o fecha.`
      );
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Por favor describe brevemente el trabajo que necesitas.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('Por favor ingresa la dirección del domicilio.');
      return;
    }

    onSubmit({
      workerId: worker.id,
      workerName: worker.name,
      workerTrade: worker.trade,
      workerAvatar: worker.avatar,
      workerPhone: worker.phone,
      clientName: 'Carlos Mendoza',
      clientPhone,
      clientAddress: address,
      neighborhood,
      categoryName: worker.trade,
      date,
      timeSlot: selectedSlot.label,
      status: 'PENDIENTE',
      description,
      estimatedCost: totalEstimate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-[#0F172A]">
              Agendar Camello
            </h3>
            <p className="text-xs text-slate-500">
              Con {worker.name} · {worker.trade}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Atención con la solicitud:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#0F766E]" />
              Fecha del servicio
            </label>
            <input
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full h-12 px-3.5 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-sm text-[#0F172A] outline-hidden transition-all bg-white"
              required
            />
            {isPastDate && (
              <span className="text-[11px] text-red-600 mt-1 block">
                Fecha no permitida (ya ocurrió).
              </span>
            )}
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0F766E]" />
              Franja horaria disponible
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isThisSlotConflict = worker.unavailableSlots?.includes(`${date}T${slot.id}`);
                const isSelected = selectedSlot.id === slot.id;

                return (
                  <button
                    type="button"
                    key={slot.id}
                    disabled={isThisSlotConflict}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setErrorMessage(null);
                    }}
                    className={`p-2.5 rounded-lg text-xs font-semibold text-left border transition-all flex flex-col justify-between min-h-[52px] ${
                      isThisSlotConflict
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{slot.label}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">
                      {isThisSlotConflict ? 'Ocupado' : 'Disponible'}
                    </span>
                  </button>
                );
              })}
            </div>
            {isConflict && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                El trabajador tiene otra labor programada en este horario.
              </p>
            )}
          </div>

          {/* Address & Neighborhood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                Dirección exacta
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Calle 72 # 10-34, Apto 301"
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-xs text-[#0F172A] outline-hidden bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Barrio / Sector
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ej. Chapinero, Cedritos"
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-xs text-[#0F172A] outline-hidden bg-white"
                required
              />
            </div>
          </div>

          {/* Hours Estimate slider/counter */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Horas estimadas de labor
              </label>
              <span className="text-xs font-extrabold text-[#0F766E]">
                {estimatedHours} {estimatedHours === 1 ? 'hora' : 'horas'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseInt(e.target.value, 10))}
              className="w-full accent-[#0F766E] cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detalle del problema o tarea a realizar *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué necesitas (ej: cambio de empaque de lavamanos, revisión de tacos que se bajan, resane de humedad...)"
              className="w-full p-3 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-xs text-[#0F172A] outline-hidden bg-white"
              required
            />
          </div>

          {/* Phone Contact */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teléfono de contacto del cliente
            </label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-xs text-[#0F172A] outline-hidden bg-white"
              required
            />
          </div>

          {/* Pricing summary */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-900 font-semibold block">Presupuesto inicial estimado</span>
              <span className="text-[11px] text-amber-700">Diagnóstico base + horas estimadas</span>
            </div>
            <span className="font-heading font-extrabold text-base text-[#0F172A] tabular-nums">
              ${totalEstimate.toLocaleString('es-CO')} COP
            </span>
          </div>

          {/* Security guarantee note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>Pago protegido: No pagas por adelantado hasta que el servicio sea ejecutado.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isConflict || isPastDate}
              className={`px-5 py-2.5 text-xs font-bold rounded-lg shadow-xs min-h-[48px] flex items-center gap-2 focus:ring-2 focus:ring-[#0F766E] focus:outline-hidden ${
                isConflict || isPastDate
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#F59E0B] text-[#0F172A] hover:bg-[#D97706]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Enviar Solicitud</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
