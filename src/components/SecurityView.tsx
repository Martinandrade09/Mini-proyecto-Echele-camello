import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Award, PhoneCall, FileText } from 'lucide-react';

export const SecurityView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Security Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-[#0F766E] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold border border-white/20 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Garantía de Confianza Échele Camello</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
          Trabajadores verificados para la tranquilidad de tu hogar
        </h2>
        <p className="text-xs sm:text-sm text-teal-100 mt-2 max-w-2xl leading-relaxed">
          En Échele Camello combinamos el empuje y la dedicación del trabajador colombiano con un estricto protocolo de seguridad, validación de antecedentes penales y respaldo institucional.
        </p>
      </div>

      {/* 3 Pillars of Security */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-[#0F172A]">
            1. Verificación de Identidad y Judicial
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cada trabajador debe subir su Cédula de Ciudadanía original y Certificado de Antecedentes de la Policía Nacional de Colombia vigente. Ningún camellador puede prestar servicios sin aprobación previa de nuestro equipo de auditoría.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-[#0F172A]">
            2. Competencia Técnica Certificada
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Validamos certificaciones del SENA, matrículas profesionales CONTE para electricistas, cursos de trabajo seguro en alturas y experiencia comprobable de más de 5 años en oficios especializados.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-[#0F172A]">
            3. Pago Seguro Contra Entrega
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cero anticipos a ciegas. El cliente solo efectúa el pago o aprueba la liberación de fondos una vez el servicio haya sido ejecutado a plena satisfacción y verificado en la aplicación.
          </p>
        </div>
      </div>

      {/* Protocol table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#0F172A]">
          Protocolo de Atención de Garantías
        </h3>
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="font-bold text-[#0F766E] text-sm shrink-0">01</span>
            <div>
              <strong className="text-slate-900 block mb-0.5">Garantía por escrito de 90 días:</strong>
              Todo trabajo de plomería, electricidad, pintura y cerrajería cuenta con 3 meses de soporte ante desperfectos o fallas de mano de obra.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="font-bold text-[#0F766E] text-sm shrink-0">02</span>
            <div>
              <strong className="text-slate-900 block mb-0.5">Chat y bitácora auditables:</strong>
              Todas las comunicaciones, cotizaciones y acuerdos quedan registrados en la plataforma para mediar de forma transparente en caso de discrepancias.
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="font-bold text-[#0F766E] text-sm shrink-0">03</span>
            <div>
              <strong className="text-slate-900 block mb-0.5">Línea de acompañamiento Échele Camello:</strong>
              Equipo local disponible para atender incidentes, reprogramaciones o asistencia de emergencia en Bogotá y principales ciudades.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
