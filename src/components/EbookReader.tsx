import React, { useState } from "react";
import { BookOpen, ArrowLeft, Type, Sun, Moon, Coffee, Sparkles } from "lucide-react";
import { ebooks } from "../ebooks";
import { Ebook } from "../types";

export default function EbookReader() {
  const [activeEbook, setActiveEbook] = useState<Ebook | null>(null);
  
  // Reading preference states
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'sm': return "text-sm leading-relaxed";
      case 'md': return "text-base leading-relaxed md:text-lg";
      case 'lg': return "text-lg leading-loose md:text-xl";
    }
  };

  const getThemeClass = () => {
    switch (readerTheme) {
      case 'light': return "bg-white text-gray-800";
      case 'sepia': return "bg-[#f4ebd0] text-[#433422]";
      case 'dark': return "bg-slate-900 text-slate-100";
    }
  };

  return (
    <div id="ebooks-library-section" className="space-y-6">
      
      {/* 1. BOOKSHELF LIST VIEW */}
      {!activeEbook ? (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h3 className="font-bold text-gray-800 text-sm">Biblioteca e Metodologias de Estudos</h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Desenvolvemos guias práticos fundamentados em neurociência e pedagogia para você otimizar sua absorção de conteúdo, organizar revisões ativas e treinar sua mentalidade competitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ebooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-emerald-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg">
                      {book.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {book.readingTime}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-gray-800 text-sm md:text-base leading-snug">{book.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{book.summary}</p>
                </div>

                <button
                  onClick={() => setActiveEbook(book)}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Iniciar Leitura
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        
        /* 2. READING MODE SCREEN */
        <div className={`rounded-3xl border border-gray-100 p-5 md:p-8 shadow-sm transition-colors duration-300 ${getThemeClass()} space-y-6`}>
          
          {/* Reader toolbar header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 border-gray-200/50">
            <button
              onClick={() => setActiveEbook(null)}
              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-85"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à biblioteca
            </button>

            {/* Customizer row */}
            <div className="flex items-center gap-4 flex-wrap">
              
              {/* Text Size Selectors */}
              <div className="flex items-center gap-1.5 border-r border-gray-200/50 pr-4">
                <Type className="w-4 h-4 opacity-60" />
                <button
                  onClick={() => setTextSize('sm')}
                  className={`text-xs font-bold px-2 py-1 rounded ${textSize === 'sm' ? "bg-emerald-600 text-white" : "hover:bg-black/5"}`}
                  title="Fonte Pequena"
                >
                  A-
                </button>
                <button
                  onClick={() => setTextSize('md')}
                  className={`text-xs font-bold px-2 py-1 rounded ${textSize === 'md' ? "bg-emerald-600 text-white" : "hover:bg-black/5"}`}
                  title="Fonte Média"
                >
                  A
                </button>
                <button
                  onClick={() => setTextSize('lg')}
                  className={`text-xs font-bold px-2 py-1 rounded ${textSize === 'lg' ? "bg-emerald-600 text-white" : "hover:bg-black/5"}`}
                  title="Fonte Grande"
                >
                  A+
                </button>
              </div>

              {/* Theme selectors */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`p-1.5 rounded-lg border flex items-center justify-center ${
                    readerTheme === 'light' ? "border-emerald-600 bg-white text-gray-800" : "border-transparent text-gray-400 hover:bg-black/5"
                  }`}
                  title="Modo Claro"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`p-1.5 rounded-lg border flex items-center justify-center bg-[#f4ebd0] ${
                    readerTheme === 'sepia' ? "border-[#433422] text-[#433422]" : "border-transparent text-gray-500 hover:bg-black/5"
                  }`}
                  title="Modo Sépia (Leitura Segura)"
                >
                  <Coffee className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`p-1.5 rounded-lg border flex items-center justify-center bg-slate-950 ${
                    readerTheme === 'dark' ? "border-sky-500 text-sky-400" : "border-transparent text-gray-400 hover:bg-black/5"
                  }`}
                  title="Modo Escuro"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Ebook Content Area */}
          <article className="max-w-2xl mx-auto space-y-6 md:py-4">
            <div className="space-y-2 pb-4 border-b border-gray-200/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">
                {activeEbook.category} • Guia prático
              </span>
              <h1 className="text-xl md:text-3xl font-black leading-tight tracking-tight">
                {activeEbook.title}
              </h1>
            </div>

            <div className={`space-y-6 ${getTextSizeClass()}`}>
              {activeEbook.content.map((para, index) => {
                // If paragraph has "1)", "2)", or specific steps, highlight it beautifully
                const isStep = para.includes("1)") || para.includes(":") || para.includes("O funcionamento");
                return (
                  <p 
                    key={index} 
                    className={`${
                      isStep 
                        ? "border-l-4 border-emerald-500/50 pl-4 py-1.5 bg-black/5 rounded-r-lg font-medium" 
                        : "opacity-95"
                    }`}
                  >
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Reading completed footer */}
            <div className="pt-8 border-t border-gray-200/50 text-center space-y-4">
              <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-bold text-base">Parabéns pela leitura!</h4>
              <p className="text-xs opacity-75 max-w-sm mx-auto">
                Conhecimento sem prática não gera resultados. Experimente aplicar estas dicas no seu planejamento semanal e cronometrar suas horas líquidas.
              </p>
              <button
                onClick={() => setActiveEbook(null)}
                className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Voltar aos e-books
              </button>
            </div>
          </article>

        </div>
      )}

    </div>
  );
}
