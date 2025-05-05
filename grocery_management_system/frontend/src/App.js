import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shopcategory from './Pages/Shopcategory';
import Cart from './Pages/Cart';
import Login from './Pages/Login';
import Hero from './Components/Home/Hero';


function App() {
  return (
    <div>
      <BrowserRouter>
      <Navbar />
      <Routes>
          <Route path='/'element={<Hero />}/>
          <Route path='/pipes'element={<Shopcategory category="pipes" />}/>
          <Route path='/tanks'element={<Shopcategory category="tanks" />}/>
          <Route path="/shopcategory/:category" element={<Shopcategory />} />
          <Route path='/cart' element={<Cart />}/>
          <Route path='/login' element={<Login />}/>
      </Routes>
      <Footer />
      </BrowserRouter>

    </div>
  );
}

export default App;
