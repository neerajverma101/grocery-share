import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import ListDetail from '@/pages/ListDetail'
import ShareView from '@/pages/ShareView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/list/:id" element={<ListDetail />} />
      <Route path="/share/:shareId" element={<ShareView />} />
    </Routes>
  )
}

export default App
