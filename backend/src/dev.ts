import app from "./app"

const port = parseInt(process.env.PORT || "3001", 10)

app.listen(port, () => {
  console.log(`🚀 API server running at http://localhost:${port}`)
})
