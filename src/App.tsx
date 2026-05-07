/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Mail, Phone, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    birthDate: "",
    observations: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Formulário enviado com sucesso!");
        setFormData({ name: "", email: "", contact: "", birthDate: "", observations: "" });
      } else {
        setStatus("error");
        setMessage("Erro ao enviar. Por favor, envie os dados por email para formscccaandebol@gmail.com");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Erro de ligação. Por favor, envie os dados por email para formscccaandebol@gmail.com");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl"
      >
        <div className="mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, y: 0 }}
            animate={{ 
              scale: 1,
              y: [0, -8, 0],
            }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              },
              scale: { duration: 0.5 }
            }}
            className="w-24 h-24 mx-auto mb-6 overflow-hidden rounded-xl border border-zinc-800 bg-black/40 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
          >
            <img 
              src="https://imgur.com/ZztTy4C.png" 
              alt="CCCA Andebol Logo" 
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CCCA Andebol</h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-medium">ESTOU INTERESSADO!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label-text">Nome Completo</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label-text">E-mail</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="exemplo@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Telemóvel</label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder="9xx xxx xxx"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>

            <div>
              <label className="label-text">Nascimento</label>
              <input
                type="date"
                required
                className="input-field"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label-text">Observações (Opcional)</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="Escreva aqui alguma nota adicional..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>

          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm flex items-center gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
                {message}
              </motion.div>
            )}

            {status === "error" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm flex items-start gap-3 flex-col"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                     <div className="w-2 h-2 bg-red-400 rounded-full" />
                  </div>
                  <span>{message}</span>
                </div>
                <div className="text-zinc-400 text-xs mt-1 border-t border-red-500/10 pt-2 w-full">
                  Em alternativa se o erro persistir, envie a sua inscrição diretamente para: <br />
                  <a href="mailto:formscccaandebol@gmail.com" className="text-blue-400 underline font-medium">formscccaandebol@gmail.com</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                A enviar...
              </>
            ) : (
              <>
                Submeter Formulário
                <Send size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">
          SERÁS CONTACTADO BREVEMENTE
        </p>
      </motion.div>
    </div>
  );
}
