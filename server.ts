import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Study Plan Generator API
app.post("/api/plan/generate", async (req, res) => {
  try {
    const { syllabusText, weeklyHours, focusArea } = req.body;

    if (!syllabusText || !weeklyHours) {
      return res.status(400).json({ error: "Parâmetros 'syllabusText' e 'weeklyHours' são obrigatórios." });
    }

    const systemInstruction = 
      "Você é um especialista em planejamento e mentoria de estudos de alta performance para concursos, ENEM, vestibulares, OAB e certificações. " +
      "Sua tarefa é analisar o edital ou temas de estudo fornecidos pelo usuário e criar um cronograma semanal estratégico, " +
      "organizado e balanceado, otimizado para o número de horas disponíveis por semana do aluno.";

    const promptText = `
      Analise o edital ou descrição do exame fornecido a seguir:
      "${syllabusText}"

      O estudante possui um foco na área de "${focusArea || 'Geral'}" e tem precisamente ${weeklyHours} horas disponíveis de estudo por semana.

      Siga estas diretrizes estritamente:
      1. Identifique as matérias/disciplinas principais do edital. Crie de 3 a 7 disciplinas (subjects).
      2. Distribua as ${weeklyHours} horas semanais totais de estudo entre essas disciplinas de forma lógica, dando pesos maiores a disciplinas mais extensas, complexas ou fundamentais para a área de foco.
      3. Divida cada disciplina em tópicos (topics) claros e específicos baseados nas informações fornecidas. Se a entrada for genérica, deduza tópicos padrão de excelência de forma realista para aquela matéria.
      4. Monte um cronograma semanal distribuído de segunda-feira a domingo ('weeklySchedule', onde 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado, 7 = Domingo).
      5. Cada item do cronograma semanal deve ter uma duração realista (ex: de 60 a 120 minutos por matéria por dia).
      6. Garanta que a soma de todos os tempos no 'weeklySchedule' bata aproximadamente com as horas disponíveis informadas (${weeklyHours} horas).
    `;

    const planSchema = {
      type: Type.OBJECT,
      properties: {
        examName: { 
          type: Type.STRING, 
          description: "Nome do exame (ex: Concurso Banco do Brasil, OAB, Vestibular Medicina, etc.) detectado ou gerado de forma atrativa." 
        },
        subjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "ID único em minúsculas sem espaços, ex: 'direito-constitucional'" },
              name: { type: Type.STRING, description: "Nome limpo da disciplina, ex: 'Direito Constitucional'" },
              weeklyHours: { type: Type.NUMBER, description: "Carga horária semanal recomendada para esta matéria em horas decimais." },
              topics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista ordenada de tópicos/assuntos do edital para esta disciplina."
              }
            },
            required: ["id", "name", "weeklyHours", "topics"]
          }
        },
        weeklySchedule: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { 
                type: Type.INTEGER, 
                description: "Dia da semana (1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado, 7 = Domingo)." 
              },
              subjectId: { type: Type.STRING, description: "ID correspondente ao subject gerado." },
              topic: { type: Type.STRING, description: "Nome do tópico específico sugerido para estudar neste momento." },
              durationMinutes: { type: Type.INTEGER, description: "Duração da sessão em minutos, ex: 60 ou 90 ou 120." }
            },
            required: ["day", "subjectId", "topic", "durationMinutes"]
          }
        }
      },
      required: ["examName", "subjects", "weeklySchedule"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: planSchema,
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const generatedPlan = JSON.parse(text);

    return res.json({ success: true, plan: generatedPlan });
  } catch (error: any) {
    console.error("Erro ao gerar plano de estudos com Gemini:", error);
    return res.status(500).json({ error: error.message || "Erro interno do servidor ao gerar o plano." });
  }
});

// Setup Vite Dev Server / Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
