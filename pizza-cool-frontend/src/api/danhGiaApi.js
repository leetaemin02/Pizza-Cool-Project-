import axios from "axios";

const API_BASE = "http://localhost:5000/api/danhgia";
const API_ADMIN_BASE = "http://localhost:5000/api/admin/danhgia";

export async function createDanhGia(
  { sanPham, nguoiDung, diemDanhGia, nhanXet },
  token
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(
    API_BASE + "/",
    { sanPham, nguoiDung, diemDanhGia, nhanXet },
    { headers }
  );
  return res.data;
}

export async function getDanhGiaByProduct(productId) {
  const res = await axios.get(`${API_BASE}/sanpham/${productId}`);
  return res.data;
}

export async function getDanhGiaByUser(userId, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_BASE}/nguoidung/${userId}`, { headers });
  return res.data;
}

// Admin reply to a rating
export async function adminReplyRating(ratingId, phanHoi, token) {
  if (!token) throw new Error("Missing token for admin action");
  const res = await axios.put(
    `${API_ADMIN_BASE}/${ratingId}/phanhoi`,
    { phanHoi },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
