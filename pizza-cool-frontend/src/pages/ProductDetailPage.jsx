import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast"; // <-- import toast
import { useAuth } from "../context/AuthContext";

const formatCurrency = (price) => {
  if (typeof price !== "number" && typeof price !== "string") return "N/A";
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numericPrice);
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [related, setRelated] = useState([]);
  const [relLoading, setRelLoading] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  // Helper: compute average rating and render star UI
  const getAverageRating = () => {
    if (ratings && ratings.length) {
      return (
        ratings.reduce((s, r) => s + (r.diemDanhGia || 0), 0) / ratings.length
      );
    }
    return product && product.danhGia ? Number(product.danhGia) : 0;
  };

  const renderStars = (value) => {
    const v = Number(value) || 0;
    const rounded = Math.round(v);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`inline-block text-xl leading-none mr-0.5 ${
            i <= rounded ? "text-yellow-400" : "text-gray-300"
          }`}
          aria-hidden
        >
          ★
        </span>
      );
    }
    return <span className="inline-flex items-center">{stars}</span>;
  };

  const { addToCart, fetchCart } = useCart();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!id) {
      setError("Không xác định sản phẩm.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/sanpham/${id}`);
        setProduct(res.data);

        if (Array.isArray(res.data.hinhAnh) && res.data.hinhAnh.length) {
          setMainImage(res.data.hinhAnh[0]);
        } else if (res.data.hinhAnh) {
          setMainImage(res.data.hinhAnh);
        } else {
          setMainImage(null);
        }

        if (res.data.soLuong !== undefined && res.data.soLuong > 0) {
          setQty((q) => Math.min(q, res.data.soLuong));
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Không thể tải thông tin sản phẩm."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      setRelLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/sanpham/related/${product._id}`
        );
        setRelated(res.data || []);
      } catch (err) {
        console.warn("Không lấy được sản phẩm liên quan:", err.message);
        setRelated([]);
      } finally {
        setRelLoading(false);
      }
    };

    fetchRelated();
  }, [product]);

  // Fetch ratings for this product
  useEffect(() => {
    if (!product) return;

    const fetchRatings = async () => {
      setRatingLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/danhgia/sanpham/${product._id}`
        );
        setRatings(res.data || []);
      } catch (err) {
        console.warn("Không lấy được đánh giá:", err.message);
        setRatings([]);
      } finally {
        setRatingLoading(false);
      }
    };

    fetchRatings();
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("❌ Sản phẩm chưa tải xong");
      return;
    }

    try {
      setAdding(true);
      await addToCart(product, qty);
      await fetchCart();
      toast.success(`✅ Đã thêm ${qty} "${product.ten}" vào giỏ`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Thêm vào giỏ thất bại");
    } finally {
      setAdding(false);
    }
  };

  const totalPrice = product ? Number(product.gia || 0) * Number(qty || 1) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-6 w-48 bg-slate-200 rounded mb-3" />
          <div className="animate-pulse h-40 w-80 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-600">Không tìm thấy sản phẩm.</p>
          <Link to="/" className="text-indigo-600 underline mt-2 inline-block">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.hinhAnh)
    ? product.hinhAnh
    : product.hinhAnh
    ? [product.hinhAnh]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-block text-sm text-slate-600 hover:underline"
      >
        ← Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6 shadow">
        {/* Left: gallery */}
        <div>
          <div className="w-full rounded-lg overflow-hidden border border-slate-100">
            <img
              src={
                mainImage ||
                "https://via.placeholder.com/800x600.png?text=No+Image+Available"
              }
              alt={product.ten}
              className="w-full h-[520px] object-cover rounded"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/800x600.png?text=No+Image";
              }}
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`flex-none w-24 h-24 rounded-lg overflow-hidden border ${
                    mainImage === img
                      ? "ring-2 ring-indigo-400"
                      : "border-slate-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/160x120.png?text=No+Image";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.badge && (
                <div className="inline-block px-3 py-1 bg-rose-500 text-white rounded text-sm font-semibold">
                  {product.badge}
                </div>
              )}
              <h1 className="text-3xl font-bold text-slate-800 mt-3">
                {product.ten}
              </h1>
              <p className="text-sm text-slate-500 mt-2">{product.moTa}</p>
              <div className="mt-3 flex items-center gap-3">
                {ratingLoading ? (
                  <div className="text-sm text-slate-600">
                    Đang tải đánh giá...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {renderStars(getAverageRating())}
                    <div className="text-sm text-slate-600">
                      {getAverageRating() ? getAverageRating().toFixed(1) : "-"}{" "}
                      / 5
                      <span className="text-xs text-slate-400 ml-2">
                        ({ratings.length} đánh giá)
                      </span>
                    </div>
                  </div>
                )}
                {product.soLuong !== undefined && (
                  <div
                    className={`text-sm font-medium ${
                      product.soLuong > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.soLuong > 0
                      ? `Còn ${product.soLuong}`
                      : "Hết hàng"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price card */}
          <div className="mt-6 p-4 rounded-lg border border-slate-100 bg-gradient-to-b from-white to-slate-50">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold text-rose-600">
                  {formatCurrency(product.gia)}
                </div>
                {product.giaCu && (
                  <div className="text-sm line-through text-slate-400">
                    {formatCurrency(product.giaCu)}
                  </div>
                )}
              </div>

              <div className="text-sm text-slate-500 text-right">
                <div>Giá / 1 sản phẩm</div>
                <div className="mt-2 font-medium">
                  {formatCurrency(product.gia)}
                </div>
              </div>
            </div>

            {/* quantity & total */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setQty((q) => {
                      const next = Math.max(1, q - 1);
                      return product.soLuong !== undefined
                        ? Math.min(next, product.soLuong)
                        : next;
                    })
                  }
                  className="px-3 py-1 rounded border border-slate-200 bg-white"
                >
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => {
                    const v = Number(e.target.value || 1);
                    if (isNaN(v)) return;
                    const clamped = Math.max(1, v);
                    if (product.soLuong !== undefined) {
                      setQty(Math.min(clamped, product.soLuong));
                    } else {
                      setQty(clamped);
                    }
                  }}
                  className="w-20 text-center rounded border border-slate-200 px-2 py-1"
                  min={1}
                />
                <button
                  onClick={() =>
                    setQty((q) => {
                      const next = q + 1;
                      return product.soLuong !== undefined
                        ? Math.min(next, product.soLuong)
                        : next;
                    })
                  }
                  className="px-3 py-1 rounded border border-slate-200 bg-white"
                >
                  +
                </button>
                <div className="ml-3 text-sm text-slate-500">Số lượng</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Tổng</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  {formatCurrency(totalPrice)}
                </div>
                {product.giaCu && (
                  <div className="text-xs text-slate-400 line-through">
                    {formatCurrency(Number(product.giaCu || 0) * qty)}
                  </div>
                )}
              </div>
            </div>

            {/* actions */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={
                  adding ||
                  (product.soLuong !== undefined && product.soLuong === 0)
                }
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-rose-500 text-white font-semibold shadow hover:shadow-lg disabled:opacity-60"
              >
                {adding ? "Đang thêm..." : "Thêm vào giỏ"}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="px-4 py-3 rounded-lg border border-slate-200 text-slate-700"
              >
                Xem giỏ
              </button>
            </div>
          </div>

          {/* Full description */}
          {product.moTaChiTiet && (
            <div className="mt-6 border-t pt-6 text-sm text-slate-700">
              <h3 className="font-medium mb-3 text-lg">Mô tả chi tiết</h3>
              <div className="prose max-w-none">
                {typeof product.moTaChiTiet === "string" ? (
                  <p>{product.moTaChiTiet}</p>
                ) : (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(product.moTaChiTiet, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Ratings section */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Đánh giá & Nhận xét</h3>

        {/* Submit rating (only for logged-in users) */}
        {user ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const body = {
                  sanPham: product._id,
                  nguoiDung: user._id,
                  diemDanhGia: Number(userRating),
                  nhanXet: userComment,
                };
                const headers = token
                  ? { Authorization: `Bearer ${token}` }
                  : {};
                await axios.post("http://localhost:5000/api/danhgia", body, {
                  headers,
                });
                toast.success("Cảm ơn bạn đã đánh giá!");
                // refresh ratings
                const res = await axios.get(
                  `http://localhost:5000/api/danhgia/sanpham/${product._id}`
                );
                setRatings(res.data || []);
                setUserComment("");
                setUserRating(5);
              } catch (err) {
                console.error(err);
                toast.error(
                  err.response?.data?.message || "Gửi đánh giá thất bại"
                );
              }
            }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-sm font-medium">Chọn điểm:</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setUserRating(s)}
                    className={`text-2xl leading-none ${
                      userRating >= s ? "text-yellow-400" : "text-gray-300"
                    }`}
                    aria-label={`Đánh ${s} sao`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Viết nhận xét của bạn (tùy chọn)"
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Gửi đánh giá
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-4 text-sm text-slate-600">
            Vui lòng{" "}
            <Link to="/login" className="text-indigo-600 underline">
              đăng nhập
            </Link>{" "}
            để đánh giá sản phẩm.
          </div>
        )}

        {/* List of ratings */}
        {ratingLoading ? (
          <div className="text-sm text-slate-600">Đang tải đánh giá...</div>
        ) : ratings.length === 0 ? (
          <div className="text-sm text-slate-500">Chưa có đánh giá nào.</div>
        ) : (
          <div className="space-y-4">
            {ratings.map((r) => (
              <div key={r._id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">
                    {r.nguoiDung?.hoTen || "Người dùng"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm mb-2">
                  {renderStars(r.diemDanhGia)}
                  <span className="ml-2 text-sm text-slate-600">
                    {r.diemDanhGia} / 5
                  </span>
                </div>
                {r.nhanXet && (
                  <div className="text-sm text-slate-700">{r.nhanXet}</div>
                )}

                {r.phanHoi && (
                  <div className="mt-3 p-3 bg-gray-50 border-l-4 border-indigo-500 rounded">
                    <div className="text-sm font-medium text-indigo-700">
                      Phản hồi từ Admin
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      {r.phanHoi}
                    </div>
                    {r.phanHoiAt && (
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(r.phanHoiAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* related products */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Sản phẩm liên quan</h3>
          <Link to="/menu" className="text-sm text-indigo-600 hover:underline">
            Xem tất cả
          </Link>
        </div>

        {relLoading ? (
          <div className="flex gap-3">
            <div className="animate-pulse h-36 w-48 bg-slate-200 rounded" />
            <div className="animate-pulse h-36 w-48 bg-slate-200 rounded" />
            <div className="animate-pulse h-36 w-48 bg-slate-200 rounded" />
          </div>
        ) : related.length === 0 ? (
          <div className="text-sm text-slate-500">
            Chưa có sản phẩm liên quan.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {related.map((p) => (
              <div
                key={p._id || p.id}
                className="min-w-[220px] bg-white rounded-lg shadow p-3 flex-none"
              >
                <div
                  className="h-36 rounded overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${p._id || p.id}`)}
                >
                  <img
                    src={Array.isArray(p.hinhAnh) ? p.hinhAnh[0] : p.hinhAnh}
                    alt={p.ten}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/320x240.png?text=No+Image";
                    }}
                  />
                </div>
                <div className="mt-2">
                  <div className="font-medium text-sm line-clamp-2">
                    {p.ten}
                  </div>
                  <div className="text-sm text-rose-600 font-semibold mt-1">
                    {formatCurrency(p.gia)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
