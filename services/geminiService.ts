import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VerilogProblem, VerificationResult, Difficulty, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

export const generateProblem = async (difficulty: Difficulty): Promise<VerilogProblem> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      description: { type: Type.STRING, description: "Markdown formatted description of the problem, including IO specs." },
      initialCode: { type: Type.STRING, description: "The initial Verilog module skeleton." },
    },
    required: ["id", "title", "difficulty", "description", "initialCode"],
  };

  const prompt = `Generate a unique Verilog interview question. 
  Difficulty: ${difficulty}. 
  Ensure the problem focuses on digital logic design concepts common in FPGA/ASIC interviews (e.g., FSMs, Counters, FIFO, Crossing Clock Domains, Arithmetic).
  The description should be clear and concise.
  The initialCode should be a valid Verilog module definition with empty body or comments indicating where to write code.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8, // Slight creativity for variety
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as VerilogProblem;
  } catch (error) {
    console.error("Error generating problem:", error);
    // Fallback problem if API fails
    return {
      id: "fallback-1",
      title: "D Flip-Flop with Reset",
      difficulty: "Easy",
      description: "Create a D flip-flop with synchronous active-high reset.\n\n**Ports:**\n* `clk`: Clock input\n* `reset`: Synchronous reset\n* `d`: Data input\n* `q`: Output",
      initialCode: "module d_ff (\n    input clk,\n    input reset,\n    input d,\n    output reg q\n);\n\n    always @(posedge clk) begin\n        // Your logic here\n    end\n\nendmodule"
    };
  }
};

export const verifySolution = async (problem: VerilogProblem, userCode: string): Promise<VerificationResult> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      isCorrect: { type: Type.BOOLEAN },
      feedback: { type: Type.STRING, description: "Detailed feedback on logic and syntax. Use Markdown." },
      optimizationTips: { type: Type.STRING, description: "Tips for better hardware utilization or coding style." },
    },
    required: ["isCorrect", "feedback"],
  };

  const prompt = `
  You are a Senior FPGA Engineer interviewing a candidate.
  
  **Problem Statement:**
  ${problem.description}

  **Module Interface (Reference):**
  ${problem.initialCode}

  **Candidate's Solution:**
  ${userCode}

  **Task:**
  1. Check for Verilog syntax errors.
  2. Verify functional correctness against the problem statement.
  3. Check for common pitfalls (latches vs flip-flops, blocking vs non-blocking assignments).
  4. If correct, return true. If incorrect, explain why clearly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as VerificationResult;

  } catch (error) {
    console.error("Error verifying solution:", error);
    return {
      isCorrect: false,
      feedback: "Failed to connect to verification server. Please try again.",
    };
  }
};

export const getChatResponse = async (
  history: ChatMessage[], 
  problem: VerilogProblem, 
  currentCode: string,
  userMessage: string
): Promise<string> => {

  const systemContext = `
    You are an expert Verilog Tutor and FPGA Design Engineer.
    The user is a student solving a coding interview problem.
    
    **Current Problem:**
    Title: ${problem.title}
    Description: ${problem.description}
    
    **User's Current Code:**
    \`\`\`verilog
    ${currentCode}
    \`\`\`
    
    **Guidelines:**
    1. Be helpful, encouraging, and concise.
    2. Do NOT provide the full solution code immediately. Guide the user to the answer.
    3. Explain concepts (like blocking vs non-blocking, FSM state encoding, etc.) if the user seems stuck.
    4. If the user asks to debug, look at their Current Code provided above.
  `;

  // Convert history to API format
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Add the new user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemContext,
        maxOutputTokens: 500, // Keep responses relatively concise
      }
    });

    return response.text || "I'm having trouble thinking right now. Try asking again.";
  } catch (error) {
    console.error("Error in chat:", error);
    return "Connection error. Please try again.";
  }
};
