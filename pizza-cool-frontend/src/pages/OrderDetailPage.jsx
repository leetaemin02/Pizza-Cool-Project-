import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Truck,
  CreditCard,
  MapPin,
  ArrowLeft,
  Loader,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

// =======================
// UTILS
// =======================
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusColor = (status) => {
  switch (status) {
    case "Thành công":
    case "Đã giao hàng":
    case "Đã hoàn thành":
      return "bg-green-100 text-green-700 border-green-200";
    case "Đã hủy":
      return "bg-red-100 text-red-700 border-red-200";
    case "Đang giao":
    case "VNPAY":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Chờ xác nhận":
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
};

const getPaymentStatusColor = (status) =>
  status === "Thành công"
    ? "text-green-600 font-bold"
    : "text-orange-500 font-bold";

// =======================
// MODAL XÁC NHẬN
// =======================
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isProcessing,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-600 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Đóng
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
          >
            {isProcessing && <Loader className="animate-spin w-4 h-4" />}
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

// =======================
// ORDER DETAIL PAGE
// =======================
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Lấy chi tiết đơn hàng
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/donhang/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.success) setOrder(data.data);
      } catch (error) {
        console.error(error);
        setAlertMessage({
          type: "error",
          text: "Không thể tải chi tiết đơn hàng",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Hủy đơn
  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `http://localhost:5000/api/donhang/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setOrder({ ...order, trangThaiDonHang: "Đã hủy" });
        setAlertMessage({ type: "success", text: "Đơn hàng đã hủy" });
      } else {
        setAlertMessage({
          type: "error",
          text: data.message || "Không thể hủy đơn",
        });
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: "error", text: "Lỗi kết nối server" });
    } finally {
      setCancelling(false);
      setShowConfirmModal(false);
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );

  if (!order)
    return <div className="text-center py-20">Không tìm thấy đơn hàng</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans relative">
      {/* ALERT */}
      {alertMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
            alertMessage.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {alertMessage.type === "success" ? (
            <Truck size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span className="font-medium">{alertMessage.text}</span>
          <button
            onClick={() => setAlertMessage(null)}
            className="ml-2 hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn?"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
        isProcessing={cancelling}
      />

      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/orders-history")}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Chi tiết đơn hàng #
              {order.orderCode || order._id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-gray-500 text-sm">
              Ngày đặt: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: PRODUCTS */}
          <div className="lg:col-span-2 space-y-6">
            {/* ORDER STATUS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Truck className="text-blue-600" size={20} /> Trạng thái đơn
                hàng
              </h3>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(
                  order.trangThaiDonHang
                )}`}
              >
                {order.trangThaiDonHang}
              </span>
            </div>

            {/* PRODUCT LIST */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700">
                Sản phẩm ({order.items.length})
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex gap-4 hover:bg-gray-50 transition"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                      {item.hinhAnh ? (
                        <img
                          src={item.hinhAnh}
                          alt={item.ten}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="text-gray-400 w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.ten}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        x{item.soLuong}
                      </p>
                    </div>
                    <div className="text-right font-bold">
                      {formatCurrency(item.gia)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INFO */}
          <div className="lg:col-span-1 space-y-6">
            {/* CUSTOMER INFO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-orange-500" size={20} /> Địa chỉ nhận
                hàng
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-semibold">{order.thongTinGiaoHang.hoTen}</p>
                <p>{order.thongTinGiaoHang.soDienThoai}</p>
                <p className="text-gray-500">{order.thongTinGiaoHang.diaChi}</p>
              </div>
            </div>

            {/* PAYMENT INFO */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="text-purple-500" size={20} /> Thanh toán
              </h3>
              <div className="flex justify-between text-sm">
                <span>Phương thức</span>
                <span className="font-medium">{order.hinhThucThanhToan}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Trạng thái</span>
                <span
                  className={getPaymentStatusColor(order.trangThaiThanhToan)}
                >
                  {order.trangThaiThanhToan}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h3 className="font-bold text-gray-800 mb-4">Tổng cộng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(order.tienTruocGiam)}</span>
                </div>
                {order.tienGiam > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher giảm giá</span>
                    <span>- {formatCurrency(order.tienGiam)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-2 flex justify-between items-center">
                  <span className="font-bold text-lg">Thành tiền</span>
                  <span className="font-bold text-xl text-blue-600">
                    {formatCurrency(order.tongTien)}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {order.trangThaiDonHang === "Chờ xác nhận" && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <XCircle size={20} /> Hủy đơn
              </button>
            )}
            {(order.trangThaiThanhToan === "Chưa thanh toán" ||
              order.trangThaiThanhToan === "Thất bại") &&
              order.trangThaiDonHang !== "Đã hủy" && (
                <button
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        orderId: order._id,
                        items: order.items,
                        totalPrice: order.tongTien,
                        discount: order.tienGiam,
                        shippingInfo: order.thongTinGiaoHang,
                      },
                    })
                  }
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} /> Thanh toán lại
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
