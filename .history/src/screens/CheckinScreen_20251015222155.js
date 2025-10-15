import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Location from 'expo-location';
import { saveCheckin } from '../utils/storage';

export default function CheckinScreen({ navigation }) {
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập vị trí',
          'Ứng dụng cần quyền truy cập vị trí để hoạt động. Vui lòng cấp quyền trong cài đặt.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      return currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Cần quyền truy cập',
        'Vui lòng cấp quyền truy cập vị trí để check-in.'
      );
      return;
    }

    if (!note.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập ghi chú cho check-in.');
      return;
    }

    setLoading(true);
    const currentLocation = await getCurrentLocation();

    if (currentLocation) {
      const checkinData = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
        note: note.trim(),
        time: new Date().toISOString(),
        timestamp: Date.now(),
      };

      const success = await saveCheckin(checkinData);

      if (success) {
        Alert.alert(
          'Thành công',
          'Check-in đã được lưu!',
          [
            {
              text: 'Xem bản đồ',
              onPress: () => navigation.navigate('Map'),
            },
            {
              text: 'OK',
              onPress: () => setNote(''),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể lưu check-in. Vui lòng thử lại.');
      }
    }

    setLoading(false);
  };

  const formatCoordinate = (value) => {
    return value ? value.toFixed(6) : 'N/A';
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📍 Geo Check-in</Text>
          <Text style={styles.subtitle}>Ghi nhận vị trí của bạn</Text>
        </View>

        <View style={styles.content}>
          {location && (
            <View style={styles.locationBox}>
            <Text style={styles.locationLabel}>Vị trí hiện tại:</Text>
            <Text style={styles.locationText}>
              Lat: {formatCoordinate(location.coords.latitude)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {formatCoordinate(location.coords.longitude)}
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ghi chú:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập ghi chú cho check-in (vd: Văn phòng, Nhà hàng ABC...)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.checkinButton]}
          onPress={handleCheckin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>✓ Check-in ngay</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.locationButton]}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🔄 Cập nhật vị trí</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.footerButtonText}>🗺️ Xem bản đồ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.footerButtonText}>📋 Lịch sử</Text>
        </TouchableOpacity>
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  locationBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkinButton: {
    backgroundColor: '#4CAF50',
  },
  locationButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
