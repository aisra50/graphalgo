import { GoogleGenAI, Type } from "@google/genai";
import { RouteData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const calculateRoute = async (
  origin: string,
  destination: string,
  turno: 'dia' | 'noite'
): Promise<RouteData> => {
  const model = "gemini-2.5-flash";

  // 1. Instrução de contexto baseada no turno
  const contextInstruction = turno === 'noite'
    ? "CURRENT TIME: NIGHT. Avoid parks and dark alleys. Prefer well-lit main avenues."
    : "CURRENT TIME: DAY. Optimize for speed. Parks and shortcuts are allowed.";

  // 2. Mock de imagens para simular seu Backend Python
  // (Isso permite você testar a troca visual sem ter o backend pronto ainda)
  const mockMapImage = turno === 'noite'
    ? "https://raw.githubusercontent.com/diego3g/rocketseat-assets/master/ignite/map-night-mock.png" // Exemplo escuro
    : "https://raw.githubusercontent.com/diego3g/rocketseat-assets/master/ignite/map-day-mock.png";   // Exemplo claro

  const prompt = `
    I need a route from "${origin}" to "${destination}".
    ${contextInstruction}

    Return a JSON object with:
    - originName, destinationName
    - steps (array of { instruction, distance })
    - totalDistance, estimatedDuration
    - originCoords, destinationCoords (lat, lng)
    
    Do NOT generate a polyline for now, we will use a static map image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originName: { type: Type.STRING },
            originCoords: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } } },
            destinationName: { type: Type.STRING },
            destinationCoords: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER } } },
            steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { instruction: { type: Type.STRING }, distance: { type: Type.STRING } } } },
            totalDistance: { type: Type.STRING },
            estimatedDuration: { type: Type.STRING },
          }
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    // Retorna os dados formatados para o App
    return {
      origin: { 
        name: data.originName || origin, 
        coords: data.originCoords || { lat: -22.9068, lng: -43.1729 } 
      },
      destination: { 
        name: data.destinationName || destination, 
        coords: data.destinationCoords || { lat: -22.9068, lng: -43.1729 } 
      },
      // Aqui passamos a imagem baseada no turno
      mapImageUrl: mockMapImage,
      possivel: true, // Backend dirá se é possível ou não
      pathCoordinates: [], // Opcional agora
      steps: data.steps || [],
      totalDistance: data.totalDistance || "Calculando...",
      estimatedDuration: data.estimatedDuration || "Calculando...",
    };

  } catch (error) {
    console.error("Erro no Gemini Service:", error);
    throw error;
  }
};