import { Route, Routes } from "react-router-dom"

import { BrowserRouter } from "react-router-dom"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Hello World</div>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
