import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';
import React from 'react'
const MainLayout = () => (
  <>
    <Navbar />
    <main><Outlet /></main>
    <Footer />
  </>
);
export default MainLayout;
