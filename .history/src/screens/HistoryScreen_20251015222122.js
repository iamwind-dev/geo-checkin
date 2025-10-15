import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getCheckins, deleteCheckin, clearCheckins } from '../utils/storage';

export default function HistoryScreen({ navigation }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckins();

    // Auto refresh khi quay lại màn hình
    const unsubscribe = navigation.addListener('focus', () => {
      loadCheckins();
    });

    return unsubscribe;
  }, [navigation]);

  const loadCheckins = async () => {
    setLoading(true);
    const data = await getCheckins();
    setCheckins(data);
    setLoading(false);
  };

  const openInMaps = (lat, lng, note) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(note);
    
    // URL cho iOS (Apple Maps)
    const iosUrl = `maps://maps.apple.com/?q=${label}&ll=${latLng}`;
    
    // URL cho Android (Google Maps)
    const androidUrl = `geo:${latLng}?q=${latLng}(${label})`;
    
    // URL backup cho Google Maps (web)
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    const url = Platform.select({
      ios: iosUrl,
      android: androidUrl,
      default: webUrl,
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ.');
      });
  };

  const handleDelete = (id, note) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa check-in "${note}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCheckin(id);
            if (success) {
              loadCheckins();
              Alert.alert('Thành công', 'Đã xóa check-in.');
            } else {
              Alert.alert('Lỗi', 'Không thể xóa check-in.');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Xác nhận xóa tất cả',
      'Bạn có chắc muốn xóa tất cả lịch sử check-in? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            const success = await clearCheckins();
            if (success) {
              loadCheckins();
              Alert.alert('Thành công', 'Đã xóa tất cả lịch sử check-in.');
            } else {
              Alert.alert('Lỗi', 'Không thể xóa lịch sử.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => openInMaps(item.lat, item.lng, item.note)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemNote}>{item.note}</Text>
          <Text style={styles.itemTime}>🕒 {formatDate(item.time)}</Text>
          <Text style={styles.itemCoords}>
            📍 {item.lat.toFixed(6)}, {item.lng.toFixed(6)}
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openInMaps(item.lat, item.lng, item.note)}
        >
          <Text style={styles.actionButtonText}>🗺️ Mở bản đồ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id, item.note)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
             Xóa
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
      </View>
    );
  }

  if (checkins.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}></Text>
        <Text style={styles.emptyText}>Chưa có lịch sử check-in</Text>
        <Text style={styles.emptySubtext}>
          Các check-in của bạn sẽ xuất hiện ở đây
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Checkin')}
        >
          <Text style={styles.emptyButtonText}>Check-in ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Tổng số: <Text style={styles.headerValue}>{checkins.length}</Text> check-in
        </Text>
        {checkins.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={checkins}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  headerValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemNote: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  itemCoords: {
    fontSize: 12,
    color: '#888',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#f44336',
  },
});
