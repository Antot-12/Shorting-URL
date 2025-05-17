import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Redirect from './pages/Redirect';
import ResetPassword from './components/ResetPassword';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/r/:code" element={<Redirect />} />
                <Route path="/reset" element={<ResetPassword />} />
            </Routes>
        </BrowserRouter>
    );
}
