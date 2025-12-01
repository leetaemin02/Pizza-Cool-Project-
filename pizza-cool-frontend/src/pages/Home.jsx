import React from "react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import ProductList from "../components/ProductList";
import PrenyLoader from "../components/PrenyLoader";

function Home() {
  return (
    <>
      {/* Load Preny chat only on home page */}
      <PrenyLoader />
      {/* KHU VỰC BANNER */}
      {/* Bọc Banner trong div chỉ có khoảng đệm trên/dưới (py-6) */}
      <div className="py-6">
        <Banner />
      </div>

      {/* KHU VỰC NỘI DUNG (GIỮ LẠI CONTAINER ĐỂ NỘI DUNG CÓ LỀ) */}
      <div className="bg-white">
        <div className="container mx-auto px-4">
          <ProductList />
        </div>
      </div>
    </>
  );
}

export default Home;
