import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Loader,
} from "lucide-react";

// --- IMPORT HÌNH NỀN (Giống trang Profile) ---
import pizzaBgImage from "../images/lichsu.jpg";
// --------------------------------------------

// ==========================================
// HÀM HỖ TRỢ (UTILS)
// ==========================================
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "Thành công":
    case "Đã giao hàng":
    case "Đã hoàn thành":
      return "bg-green-100/80 text-green-700 border-green-200"; // Thêm độ trong suốt nhẹ
    case "Đã hủy":
      return "bg-red-100/80 text-red-700 border-red-200";
    case "Đang giao":
    case "VNPAY":
      return "bg-blue-100/80 text-blue-700 border-blue-200";
    case "Chờ xác nhận":
    default:
      return "bg-yellow-100/80 text-yellow-700 border-yellow-200";
  }
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        // Thay URL này bằng endpoint thực tế của bạn
        const { data } = await axios.get(
          "http://localhost:5000/api/donhang/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return (
      // Loading state đồng bộ background
      <div
        className="min-h-screen flex justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${pizzaBgImage})` }}
      >
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <Loader className="animate-spin text-red-600 mb-2" size={40} />
          <span className="font-semibold text-gray-800">
            Đang tải đơn hàng...
          </span>
        </div>
      </div>
    );

  return (
    // --- Wrapper chứa hình nền Pizza ---
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-start justify-center py-12 px-4"
      style={{ backgroundImage: `url(${pizzaBgImage})` }}
    >
      {/* --- Khung Glassmorphism chính --- */}
      <div className="max-w-4xl w-full p-8 bg-white/30 backdrop-blur-lg border border-white/40 rounded-[2rem] shadow-2xl min-h-[500px]">
        <h1 className="text-3xl font-extrabold text-red-700 mb-8 flex items-center gap-3 drop-shadow-sm">
          <ShoppingBag className="text-red-600" size={32} /> Lịch sử đơn hàng
        </h1>

        {orders.length === 0 ? (
          // --- State: Chưa có đơn hàng (Glass style) ---
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-10 text-center shadow-sm border border-white/50">
            <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60">
              <Package size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-600 mb-6 font-medium">
              Bạn chưa mua sắm sản phẩm nào tại cửa hàng Pizza Cool.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg transform hover:scale-105"
            >
              Đặt món ngay
            </button>
          </div>
        ) : (
          // --- State: Có đơn hàng ---
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                // Style cho từng Card: bg-white/60, hover effect
                className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/50 hover:shadow-xl hover:bg-white/80 hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-gray-900">
                        #{order.orderCode || order._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(
                          order.trangThaiDonHang
                        )}`}
                      >
                        {order.trangThaiDonHang}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm gap-4 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} className="text-red-500" />{" "}
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={16} className="text-red-500" />{" "}
                        {order.items.length} sản phẩm
                      </span>
                    </div>
                  </div>

                  {/* Right: Total & Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-semibold uppercase">
                        Tổng tiền
                      </p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(order.tongTien)}
                      </p>
                    </div>
                    <div className="bg-white/50 p-2 rounded-full border border-white/60 group-hover:bg-red-100 group-hover:text-red-600 transition shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
