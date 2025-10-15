import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKIN_KEY = '@geo_checkin_data';

/**
 * Lấy danh sách tất cả check-in đã lưu
 */
export const getCheckins = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CHECKIN_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading checkins:', e);
    return [];
  }
};

/**
 * Lưu check-in mới
 */
export const saveCheckin = async (checkin) => {
  try {
    const existingCheckins = await getCheckins();
    const newCheckin = {
      id: Date.now().toString(),
      ...checkin,
    };
    const updatedCheckins = [newCheckin, ...existingCheckins];
    const jsonValue = JSON.stringify(updatedCheckins);
    await AsyncStorage.setItem(CHECKIN_KEY, jsonValue);
    return true;
  } catch (e) {
    console.error('Error saving checkin:', e);
    return false;
  }
};

/**
 * Xóa tất cả check-in
 */
export const clearCheckins = async () => {
  try {
    await AsyncStorage.removeItem(CHECKIN_KEY);
    return true;
  } catch (e) {
    console.error('Error clearing checkins:', e);
    return false;
  }
};

/**
 * Xóa một check-in theo ID
 */
export const deleteCheckin = async (id) => {
  try {
    const existingCheckins = await getCheckins();
    const updatedCheckins = existingCheckins.filter(item => item.id !== id);
    const jsonValue = JSON.stringify(updatedCheckins);
    await AsyncStorage.setItem(CHECKIN_KEY, jsonValue);
    return true;
  } catch (e) {
    console.error('Error deleting checkin:', e);
    return false;
  }
};
