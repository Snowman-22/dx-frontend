import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home/Home";
import ProductCategory from "@/pages/ProductCategory/ProductCategory";
import Subscription from "@/pages/Subscription/Subscription";
import Login from "@/pages/Login/Login";
import Signup from "@/pages/Signup/Signup";
import Support from "@/pages/Support/Support";
import Recommend from "@/pages/Recommend/Recommend";
import RecommendChatbot from "@/pages/RecommendChatbot/RecommendChatbot";
import Simulation from "@/pages/Simulation/Simulation";
import Chatbot from "@/pages/Chatbot/Chatbot";
import NotReady from "@/pages/NotReady/NotReady";

function App() {
  return (
    <Routes>
      {/* Full-screen (no Header/Footer) */}
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/recommendchatbot" element={<RecommendChatbot />} />
      <Route path="/simulation" element={<Simulation />} />

      {/* Standard layout (Header + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products/:tab" element={<ProductCategory />} />
        <Route path="/products/:tab/:category" element={<ProductCategory />} />
        <Route path="/products/:tab/:category/:sub" element={<ProductCategory />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/subscription/*" element={<Subscription />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support/*" element={<Support />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotReady />} />
      </Route>
    </Routes>
  );
}

export default App;
