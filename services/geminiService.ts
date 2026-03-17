
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, UNIT_DATE_EXTRACTION_INSTRUCTION, SMU_EXTRACTION_INSTRUCTION } from "../constants";
import { DefectEntry, UnitDateEntry, SmuDocShiftEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const cleanBase64 = (base64Data: string) => base64Data.split(',')[1] || base64Data;

export const extractDefectsFromDocument = async (base64Data: string, mimeType: string): Promise<DefectEntry[]> => {
  const prompt = "Process this inspection report and extract all defects into JSON. Ensure you evaluate the clarity of the source data for the 'cek' field.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64(base64Data),
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              halaman: { type: Type.STRING },
              equipment_number: { type: Type.STRING },
              date: { type: Type.STRING },
              distance: { type: Type.STRING },
              shift: { type: Type.STRING },
              inspected_by: { type: Type.STRING },
              id_defect: { type: Type.STRING },
              deskripsi_defect: { type: Type.STRING },
              cek: { 
                type: Type.STRING,
                description: "Tingkat keterbacaan data: 'Jelas', 'Kurang Jelas', atau 'Tidak Jelas'"
              },
            },
            required: ["id_defect", "deskripsi_defect", "equipment_number", "date", "shift", "cek"]
          }
        }
      },
    });

    const jsonText = response.text || "[]";
    const data: DefectEntry[] = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error("Gemini Defect Extraction Error:", error);
    throw new Error("Failed to parse defect data from the document.");
  }
};


export const extractUnitAndDateFromDocument = async (base64Data: string, mimeType: string): Promise<UnitDateEntry[]> => {
  const prompt = "Process this document and extract the page number, equipment number, and date from every page into a JSON array.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64(base64Data),
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: UNIT_DATE_EXTRACTION_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              halaman: { type: Type.STRING },
              equipment_number: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ["halaman", "equipment_number", "date"]
          }
        }
      },
    });

    const jsonText = response.text || "[]";
    const data: UnitDateEntry[] = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error("Gemini Unit/Date Extraction Error:", error);
    throw new Error("Failed to parse unit/date data from the document.");
  }
};

export const extractSmuDocShiftFromDocument = async (base64Data: string, mimeType: string): Promise<SmuDocShiftEntry[]> => {
  const prompt = "Extract SMU, document number, and shift from this document into a JSON array.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64(base64Data),
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction: SMU_EXTRACTION_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              halaman: { type: Type.STRING },
              smu: { type: Type.STRING },
              doc_num: { type: Type.STRING },
              shift: { type: Type.STRING },
            },
            required: ["halaman", "smu", "doc_num", "shift"]
          }
        }
      },
    });
    
    const jsonText = response.text || "[]";
    const data: SmuDocShiftEntry[] = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error("Gemini SMU/Doc Extraction Error:", error);
    throw new Error("Failed to parse SMU/Doc data from the document.");
  }
};
