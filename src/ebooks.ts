import { Ebook } from "./types";

export const ebooks: Ebook[] = [
  {
    id: "repeticao-espacada",
    title: "Técnicas de Memorização & Repetição Espaçada",
    category: "Metodologia",
    readingTime: "5 min de leitura",
    summary: "Aprenda a combater a Curva do Esquecimento de Ebbinghaus usando revisões sistemáticas de 24 horas, 7 dias e 30 dias.",
    content: [
      "Introdução à Curva do Esquecimento: Quando estudamos um assunto novo, nosso cérebro retém 100% da informação imediatamente após o estudo. No entanto, em apenas 24 horas, cerca de 50% a 80% do que foi aprendido é perdido se não houver esforço de recuperação ativa.",
      "O Funcionamento da Repetição Espaçada (Spaced Repetition): Esta técnica consiste em revisar o material estudado em intervalos crescentes. Ao invés de tentar decorar tudo em uma única sessão longa, revisamos o mesmo conteúdo em momentos estratégicos para consolidar a memória de longo prazo.",
      "O Ciclo Clássico de Revisões: Recomendamos o modelo 24h-7d-30d. A primeira revisão deve ocorrer 24 horas após o primeiro contato (rápida, 10-15 min, focada em resumos ou mapas mentais). A segunda ocorre após 7 dias e a terceira após 30 dias. Este ciclo avisa ao cérebro que aquela informação é importante e útil.",
      "Recuperação Ativa (Active Recall): Revisar não significa apenas reler passivamente. Para que a repetição espaçada funcione, você deve forçar seu cérebro a recuperar a informação. Tente explicar o assunto para si mesmo em voz alta, faça flashcards ou resolva perguntas do assunto antes de olhar a resposta.",
      "Como Automatizar no Seu App: Nosso planejador cria as revisões recomendadas de forma automática toda vez que você registra uma sessão de estudo líquida. Fique atento à aba 'Revisões' diariamente e nunca acumule suas tarefas acumuladas."
    ]
  },
  {
    id: "ciclo-de-estudos",
    title: "Como Criar um Ciclo de Estudos Vencedor",
    category: "Planejamento",
    readingTime: "6 min de leitura",
    summary: "Esqueça a rotina rígida. Descubra como os ciclos de estudos dinâmicos ajudam você a evoluir em múltiplas matérias sem procrastinação.",
    content: [
      "O Erro do Quadro de Horários Fixo: Montar uma tabela rígida com matérias fixas por dia (ex: 'segunda-feira às 14h estudar Matemática') costuma falhar. Se você tiver um imprevisto na segunda, toda a sua semana é prejudicada, gerando frustração e sensação de fracasso.",
      "O Que é o Ciclo de Estudos: Um ciclo é uma sequência ordenada de disciplinas com metas de tempo líquido específicas para cada uma. Você estuda a matéria A por 90 minutos, depois passa para a matéria B por 60 minutos, e assim por diante. Se você parar na metade da matéria B hoje, amanhã você recomeça exatamente de onde parou.",
      "Vantagens do Ciclo Dinâmico: 1) Flexibilidade extrema para lidar com imprevistos cotidianos; 2) Estudo frequente de múltiplos assuntos, evitando passar semanas sem ver uma disciplina; 3) Facilidade de ajuste com base no desempenho e peso da matéria na prova.",
      "Definindo os Pesos das Matérias: Distribua o tempo do ciclo com base em três variáveis: o peso da matéria na prova (número de questões/pontuação), sua dificuldade pessoal com aquele assunto, e a extensão do edital. Matérias de peso alto e dificuldade alta ganham mais blocos ou durações maiores no ciclo.",
      "Constância Acima de Intensidade: É preferível estudar 2 horas líquidas todos os dias do que estudar 10 horas em um único dia e passar o restante da semana sem abrir os livros. O cérebro necessita de descanso e sono de qualidade para consolidar as sinapses criadas."
    ]
  },
  {
    id: "ansiedade-provas",
    title: "Controle de Ansiedade & Mentalidade de Aprovado",
    category: "Mentalidade",
    readingTime: "4 min de leitura",
    summary: "Guia prático com técnicas respaldadas pela neurociência para controlar a ansiedade antes e durante o dia da prova.",
    content: [
      "Ansiedade como Reação Fisiológica: Sentir frio na barriga é uma resposta evolutiva de sobrevivência. O problema surge quando esse estresse se torna crônico e paralisa suas funções cognitivas, afetando a memória de trabalho e a tomada de decisões.",
      "A Técnica da Respiração Quadrada (Pranayama): Quando sentir a ansiedade subir, utilize a técnica de respiração 4-4-4-4: Inspire pelo nariz por 4 segundos; Segure o ar nos pulmões por 4 segundos; Expire lentamente pela boca por 4 segundos; Mantenha os pulmões vazios por 4 segundos. Repita o ciclo 5 vezes para acalmar o sistema nervoso autônomo.",
      "Simulados como Treino Mental: O simulado não serve apenas para testar conhecimentos teóricos. Ele serve para treinar sua resistência física, sua gestão de tempo e suas reações emocionais. Faça simulados reproduzindo fielmente as condições reais da prova (sem celular, com cronômetro, no mesmo horário do exame).",
      "Diálogo Interno Construtivo: Substitua pensamentos autoderrotistas como 'eu vou esquecer tudo' por afirmações baseadas em fatos: 'eu me preparei, registrei minhas horas e fiz questões. Meu papel agora é apenas aplicar o que sei'.",
      "Higiene do Sono na Véspera: Dormir bem é um dos maiores potencializadores de nota. Evite estudar na noite anterior à prova. Faça refeições leves, hidrate-se e permita que sua mente descanse para que o cérebro possa acessar facilmente as memórias consolidadas."
    ]
  },
  {
    id: "engenharia-reversa",
    title: "Estudo Ativo & Engenharia Reversa com Questões",
    category: "Metodologia",
    readingTime: "7 min de leitura",
    summary: "Aprenda a estudar focado em resolver problemas. Use as questões da banca para guiar o seu aprendizado conceitual.",
    content: [
      "Estudo Passivo vs. Estudo Ativo: Ler apostilas coloridas e assistir videoaulas de 2 horas em velocidade normal são métodos passivos de baixa retenção. O verdadeiro aprendizado ocorre quando o cérebro é desafiado a produzir uma resposta ou resolver um problema.",
      "O Método da Engenharia Reversa: Em vez de ler toda a teoria para depois fazer exercícios, você começa pelas questões da banca examinadora. Ao errar ou ter dúvidas, você recorre à teoria especificamente para sanar aquele ponto cego. Isso direciona seu foco para o que realmente cai na prova.",
      "Análise Detalhada dos Erros: Não se contente em apenas ver o gabarito. Quando errar uma questão, investigue: 1) Foi falta de atenção? 2) Esquecimento da regra? 3) Falta de base conceitual? Anote o motivo do erro no seu controle por assunto para que a próxima revisão seja focada nesse calcanhar de Aquiles.",
      "Mapeando o Edital com Estatísticas: Nosso app permite registrar o número de acertos por assunto. Assuntos com aproveitamento inferior a 70% devem ser destacados em vermelho e receber maior atenção na próxima rodada do ciclo de estudos.",
      "A Regra dos 80/20 (Princípio de Pareto): Geralmente, 80% das questões de uma prova cobram apenas 20% dos assuntos do edital. Identifique quais são esses temas recorrentes da sua banca e domine-os com perfeição."
    ]
  }
];
