const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const port = 3000;

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

const userId = "DineshSaiSandeepDesu_18072003";

// Helper function to process the data
const processData = (inputData) => {
  const numbers = [];
  const alphabets = [];

  inputData.forEach((item) => {
    if (typeof item === "string") {
      if (!isNaN(item)) {
        numbers.push(item);
      } else if (/^[a-zA-Z]$/.test(item)) {
        alphabets.push(item);
      }
    }
  });

  const highestLowercaseAlphabet = alphabets
    .filter((char) => char === char.toLowerCase())
    .sort((a, b) => b.localeCompare(a))[0];

  return {
    numbers,
    alphabets,
    highestLowercaseAlphabet: highestLowercaseAlphabet
      ? [highestLowercaseAlphabet]
      : [],
  };
};

// Updated decodeBase64 function
const decodeBase64 = (b64string) => {
  const matches = b64string.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string format");
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const fileSizeKb = Math.round(buffer.length / 1024);

  return { mimeType, fileSizeKb };
};

// GET endpoint
app.get("/bfhl", (req, res) => {
  res.json({ operation_code: 1 });
});

// POST /bfhl endpoint with flexible handling
app.post("/bfhl", upload.single("file"), (req, res) => {
  console.log("Received request body:", req.body);

  let data;
  try {
    if (
      req.file ||
      (req.headers["content-type"] &&
        req.headers["content-type"].startsWith("multipart/form-data"))
    ) {
      // If it's a multipart form, parse 'data' field
      data = JSON.parse(req.body.data);
    } else {
      // If direct JSON, use body as-is
      data = req.body;
    }

    // Ensure 'data' exists and is an array
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid input format. 'data' should be an array.");
    }
  } catch (error) {
    console.error("Error parsing data:", error);
    return res.status(400).json({
      is_success: false,
      user_id: userId,
      message: error.message,
    });
  }

  const { numbers, alphabets, highestLowercaseAlphabet } = processData(
    data.data
  );

  let fileInfo = {
    file_valid: false,
  };

  // Handle actual file upload using multer
  if (req.file) {
    fileInfo = {
      file_valid: true,
      file_mime_type: req.file.mimetype,
      file_size_kb: Math.round(req.file.size / 1024).toString(),
    };
  }

  // Handle base64 file input
  if (data.file_b64) {
    try {
      const { mimeType, fileSizeKb } = decodeBase64(data.file_b64);
      fileInfo = {
        file_valid: true,
        file_mime_type: mimeType,
        file_size_kb: fileSizeKb.toString(),
      };
    } catch (error) {
      console.error("Error decoding base64:", error);
      return res.status(400).json({
        is_success: false,
        user_id: userId,
        message: error.message,
      });
    }
  }

  const response = {
    is_success: true,
    user_id: userId,
    email: "dineshsaisandeep_desu@srmap.edu.in",
    roll_number: "AP21110011517",
    numbers: numbers,
    alphabets: alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet,
    ...fileInfo,
  };

  console.log("Sending response:", response);
  res.json(response);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ is_success: false, message: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
