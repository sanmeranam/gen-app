const fs = require("fs-extra");
const pdfParse = require("pdf-parse");
const pdf2json = require("pdf2json");
const Tesseract = require("tesseract.js");
const pdfPoppler = require("pdf-poppler");
const path = require("path");


async function extractTextFromImage(pdfPath) {
    const outputDir = path.join(__dirname, "output");
    await fs.ensureDir(outputDir);
  
    // Convert PDF to Image
    const imagePath = path.join(outputDir, "page-%d.png");
  
    try {
      await pdfPoppler.convert(pdfPath, {
        format: "png",
        out_dir: outputDir,
        out_prefix: "page",
        resolution: 300, // High resolution for better OCR
      });
  
      console.log("PDF converted to image");
  
      // Perform OCR on the first page (Modify for multiple pages)
      const text = await Tesseract.recognize(
        path.join(outputDir, "page-1.png"), // First page
        "eng"
      );
  
      return text.data.text;
    } catch (error) {
      console.error("OCR Error:", error);
      return "";
    }
  }
  

async function extractTextWithPdf2Json(pdfPath) {
    return new Promise((resolve, reject) => {
        let pdfParser = new pdf2json();
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const extractedText = pdfData.Pages.map(page => page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(" ")).join("\n");
            resolve(extractedText);
        });
        pdfParser.on("pdfParser_dataError", reject);
        pdfParser.loadPDF(pdfPath);
    });
}

async function extractTextFromPDF(pdfPath) {
    let text = "";

    try {
        // Try pdf-parse first
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(pdfBuffer);
        text = pdfData.text.trim();

        // If empty, fallback to pdf2json
        if (!text) {
            console.log("Fallback to pdf2json...");
            text = await extractTextWithPdf2Json(pdfPath);
        }

        // If still empty, use OCR (Tesseract)
        if (!text) {
            console.log("Fallback to OCR...");
            text = await extractTextFromImage(pdfPath);
        }
    } catch (error) {
        console.error("PDF Parsing Error:", error);
    }

    return text || null;
}

module.exports = {
    extractTextFromPDF,
};