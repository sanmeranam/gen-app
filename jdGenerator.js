const { gemini20Flash, googleAI } = require('@genkit-ai/googleai');
const { genkit } = require('genkit');

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash, // set default model
});

const generateJobDescription = async ({job, experience, skills}) => {
    
    const prompt = `System: You are a professional job description generator. Expand the given input into a structured, professional job description. **Do not add any introduction or extra text**—return only the formatted job description.
    User Input:
    Job: ${job}
    Experience: ${experience}
    Skills: ${skills}

    Generate a professional, structured, and well-formatted job description.
  `;
  // make a generation request
  const { text } = await ai.generate(prompt);
  return text;
};

module.exports = generateJobDescription;