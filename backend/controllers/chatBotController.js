/**
 * Controller using native Fetch instead of Axios
 */
export const chatWithBot = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.json({
        success: false,
        message: "Query is required",
      });
    }

    // Fetch request to Python FastAPI server
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json(); // Python reply

    return res.status(200).json({
      success: true,
      data: data,   // contains messages[] and final_answer
    });

  } catch (error) {
    console.error("🔥 Chatbot fetch error:", error);

    return res.json({
      success: false,
      message: "Python chatbot service unavailable",
      error: error.message,
    });
  }
};
