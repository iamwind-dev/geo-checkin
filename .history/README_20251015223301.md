# Geo Check-in App

Ứng dụng React Native (Expo) cho phép người dùng check-in với GPS, lưu ghi chú và hiển thị trên bản đồ.

## Tính năng

1. **Check-in với GPS**: Sử dụng `expo-location` để lấy vị trí hiện tại (latitude, longitude)
2. **Ghi chú Check-in**: Nhập ghi chú cho mỗi lần check-in
3. **Lưu trữ dữ liệu**: Sử dụng AsyncStorage để lưu trữ dữ liệu check-in
4. **Hiển thị bản đồ**: Sử dụng `react-native-maps` để hiển thị tất cả các marker check-in
5. **Lịch sử Check-in**: Danh sách FlatList hiển thị tất cả check-in
6. **Mở bản đồ ngoài**: Click vào item để mở Google Maps/Apple Maps
7. **React Navigation**: Điều hướng giữa các màn hình

## Màn hình

- **CheckinScreen**: Màn hình check-in chính

  - Nhập ghi chú
  - Hiển thị tọa độ GPS hiện tại
  - Nút Check-in
  - Cập nhật vị trí
- **MapScreen**: Màn hình bản đồ

  - Hiển thị tất cả marker check-in
  - Callout với thông tin chi tiết
  - Tự động center vào check-in mới nhất
- **HistoryScreen**: Lịch sử check-in

  - Danh sách FlatList
  - Mở Google Maps/Apple Maps
  - Xóa từng item hoặc xóa tất cả

## Cài đặt

### Yêu cầu

- Node.js (v14 trở lên)
- Expo CLI
- Expo Go app trên điện thoại (iOS/Android)

### Các bước cài đặt

1. **Clone/Download project**

```bash
cd geo-checkin
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Chạy ứng dụng**

```bash
npm start
# hoặc
expo start
```

4. **Chạy trên thiết bị**

- Quét QR code bằng Expo Go app (Android) hoặc Camera (iOS)
- Hoặc nhấn `a` để mở Android emulator
- Hoặc nhấn `i` để mở iOS simulator
