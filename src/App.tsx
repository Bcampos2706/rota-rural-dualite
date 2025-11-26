import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/MockStore'; // Reverted to MockStore
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { CreateQuote } from './pages/buyer/CreateQuote';
import { QuoteDetails } from './pages/buyer/QuoteDetails';
import { MyQuotes } from './pages/buyer/MyQuotes';
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';
import { SupplierOrders } from './pages/supplier/SupplierOrders';
import { QuoteResponse } from './pages/supplier/QuoteResponse';
import { Promotions } from './pages/supplier/Promotions';
import { Reports } from './pages/supplier/Reports';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/profile/EditProfile';
import { MyAddresses } from './pages/profile/MyAddresses';

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Login Route (Outside Layout) */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes (Inside Layout) */}
          <Route element={<Layout />}>
            
            {/* Buyer Routes */}
            <Route path="buyer" element={<BuyerDashboard />} />
            <Route path="buyer/quotes" element={<MyQuotes />} />
            <Route path="buyer/create" element={<CreateQuote />} />
            <Route path="buyer/quote/:id" element={<QuoteDetails />} />
            
            {/* Supplier Routes */}
            <Route path="supplier" element={<SupplierDashboard />} />
            <Route path="supplier/orders" element={<SupplierOrders />} />
            <Route path="supplier/request/:id" element={<QuoteResponse />} />
            <Route path="supplier/promotions" element={<Promotions />} />
            <Route path="supplier/reports" element={<Reports />} />
            
            {/* Shared Routes */}
            <Route path="chat" element={<Chat />} />
            
            {/* Profile Routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="profile/details" element={<EditProfile />} />
            <Route path="profile/addresses" element={<MyAddresses />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
