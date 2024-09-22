const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const userId = "DineshSaiSandeepDesu_18072003";

// GET endpoint
app.get("/bfhl", (req, res) => {
  res.json({ operation_code: 1 });
});

// POST /bfhl endpoint
app.post("/bfhl", (req, res) => {
  const { data, file_b64 } = req.body;

  // Input validation
  if (!Array.isArray(data)) {
    return res.status(400).json({
      is_success: false,
      user_id: userId,
      message: "Invalid input format. 'data' should be an array.",
    });
  }

  const numbers = [];
  const alphabets = [];

  data.forEach((item) => {
    if (typeof item === "string") {
      if (!isNaN(item)) {
        numbers.push(item);
      } else if (/^[a-zA-Z]$/.test(item)) {
        alphabets.push(item);
      }
    }
  });

  const highestLowercaseAlphabet =
    alphabets
      .filter((char) => char === char.toLowerCase())
      .sort((a, b) => b.localeCompare(a))[0] || [];

  // File handling
  let fileValid = false;
  let fileMimeType;
  let fileSizeKb;

  if (file_b64) {
    try {
      const buffer = Buffer.from(file_b64, "base64");
      fileValid = true;
      fileMimeType = "doc/pdf";
      fileSizeKb = Math.round(buffer.length / 1024);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  }

  res.json({
    is_success: true,
    user_id: userId,
    email: "dineshsaisandeep_desu@srmap.edu.in",
    roll_number: "AP21110011517",
    numbers: numbers,
    alphabets: alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet
      ? [highestLowercaseAlphabet]
      : [],
    file_valid: fileValid,
    file_mime_type: fileMimeType,
    file_size_kb: fileSizeKb,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ is_success: false, message: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
