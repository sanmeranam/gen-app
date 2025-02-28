const { gemini20Flash, googleAI } = require('@genkit-ai/googleai');
const { genkit } = require('genkit');
const fs = require("fs-extra");

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash, // set default model
});

const generateJobDescription = async ({ job, experience, skills }) => {

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

const generateJDForML = async () => {
  try {
    const propmt = `
      Expand the given input into a structured, professional job description in below format, **Do not add any introduction or extra text**—return only the formatted job description:
      **Job Title**:
      **Experience Level**:

      ### **Responsibilities**:
      - [Responsibility 1]
      - [Responsibility 2]

      ### **Required Skills**:
      - [Skill 1]
      - [Skill 2]

      ### **Preferred Skills**:
      - [Skill 1]
      - [Skill 2]
    `;
    const { text } = await ai.generate(propmt);
    return text;
  } catch (error) {
    console.error(error);
  }
  return null;
};

const generateResumeSummerization = async (path) => {

  const pdfBinary = fs.readFileSync(path, { encoding: "base64url" });
  const base64PDF = 'data:application/pdf;base64,' + pdfBinary;

  // const prompt = `
  //     You are a resume summarization AI. Given a resume, summarize it in the following format:

  //     **Candidate Name**: [Extract Name]  
  //     **Current Role**: [Extract Current Role & Company]  
  //     **Experience**: [Total Years]  

  //     ### **Technical Skills**:
  //     - Programming: [Extracted Programming Skills]  
  //     - Databases: [Extracted Database Skills]  
  //     - Cloud Platforms: [Extracted Cloud Services]  
  //     - Frameworks: [Extracted Frameworks]  

  //     ### **Work Experience**:
  //     - **[Role] | [Company] ([Years])**  
  //       - [Key Responsibilities]

  //     ### **Certifications**:
  //     - [Certification 1]  
  //     - [Certification 2] 

  //     ### **Education**:
  //     - [Degree] | [University] ([Years])

  //     ### **Summary**:
  //     [Extracted Summary]

  //     also give contact number, email and name in following format.
  //     <<<[Name] | [Email] | [Contact Number]>>>
  //     Here is the resume attached
  //   `;
  const prompt = `
    Extract key details from this resume and return in JSON format:
      {
        "full_name": "", // should be extracted from the resume space separated
        "email": "",
        "contact_number": "",
        "linkedin": "",
        "github": "",
        "current_role": "",
        "experience": "", // total years of experience, zero if not found
        "summary": "",
        "current_location": "",
        "hobbies": [],
        "technical_skills": [],
        "education": [
          {
            "degree": "",
            "university": "",
            "year": ""
          }
        ],
        "work_experience": [
          {
            "role": "",
            "company": "",
            "duration": "",
            "responsibilities": []
          }
        ],
        "certifications": []
      }
  `;
  // make a generation request
  const { text } = await ai.generate([
    {
      text: prompt,
    },
    {
      media: {
        url: base64PDF,
      },
    },
  ])
  return text;
};

module.exports = {
  generateJDForML,
  generateJobDescription,
  generateResumeSummerization,
};