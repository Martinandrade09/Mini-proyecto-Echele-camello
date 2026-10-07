import React, { useState } from 'react';
import { ServiceRequest } from '../types';
import { X, Star, ThumbsUp, CheckCircle2, ShieldCheck } from 'lucide-react';

interface RatingModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onSubmitRating: (requestId: string, rating: number, comment: string) => void;
}

const RATING_TAGS = [
  'Puntualidad paisa ⏰',
  'Trabajo impecable 🛠️',
  'Precio justo y claro 💰',
  'Amabilidad y respeto 🤝',
  'Dejó todo limpio ✨',
  'Trajo repuestos propios 🧰',
];

export const RatingModal: React.FC<RatingModalProps> = ({
  request,
  onClose,
  onSubmitRating,
}) => {
  if (!request) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Validation: only COMPLETADA can be rated
  if (request.status !== 'COMPLETADA') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-sm font-semibold text-red-600 mb-2">Acción no permitida</p>
          <p className="text-xs text-slate-600 mb-4">
            Solo puedes calificar un servicio cuando haya sido marcado como COMPLETADO por ambas partes.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // Check if already rated
  if (request.review) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-heading font-bold text-base text-[#0F172A] mb-1">
            Servicio ya calificado
          </h4>
          <p className="text-xs text-slate-600 mb-3">
            Ya enviaste tu valoración de {request.review.rating} estrellas para este camello. ¡Gracias por fortalecer la confianza comunitaria!
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic mb-4">
            "{request.review.comment}"
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = selectedTags.length > 0 
      ? `${comment.trim() ? comment.trim() + ' · ' : ''}${selectedTags.join(', ')}`
      : comment.trim() || 'Servicio completado satisfactoriamente.';

    onSubmitRating(request.id, rating, finalComment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#0F172A]">
              Calificar Camello
            </h3>
            <p className="text-xs text-slate-500">
              {request.workerName} · {request.categoryName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Star selector */}
          <div className="text-center py-2 bg-amber-50/50 rounded-xl border border-amber-100">
            <span className="text-xs font-semibold text-amber-900 block mb-2">
              ¿Cómo calificarías el trabajo recibido?
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-hidden"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? 'fill-[#F59E0B] text-[#F59E0B]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-extrabold text-[#D97706] mt-2 block">
              {rating === 5 && '¡Excelente trabajo! 5.0'}
              {rating === 4 && 'Muy buen camello 4.0'}
              {rating === 3 && 'Aceptable 3.0'}
              {rating === 2 && 'Regular 2.0'}
              {rating === 1 && 'Malo 1.0'}
            </span>
          </div>

          {/* Quick tags */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Aspectos destacados (opcional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RATING_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment text */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Comentario u observaciones
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntale a la comunidad cómo fue tu experiencia con el maestro..."
              className="w-full p-3 rounded-lg border border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-xs text-[#0F172A] outline-hidden bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-[#D97706] rounded-lg shadow-xs min-h-[44px] flex items-center gap-1.5"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Publicar Calificación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
