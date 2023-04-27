const { app } = require("./App");

const { PORT = 3000 } = process.env;

app.listen(PORT, () => {
  try {
    console.log(`Server is listening at http://localhost:${PORT}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
});