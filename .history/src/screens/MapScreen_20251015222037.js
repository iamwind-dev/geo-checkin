import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getCheckins } from '../utils/storage';

export default function MapScreen({ navigation }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 10.8231, // Mặc định: TP.HCM
    longitude: 106.6297,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

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

    // Nếu có dữ liệu, center map vào check-in gần nhất
    if (data.length > 0) {
      const latestCheckin = data[0];
      setRegion({
        latitude: latestCheckin.lat,
        longitude: latestCheckin.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }

    setLoading(false);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMarkerColor = (index) => {
    // Màu khác nhau cho các marker
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  if (checkins.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📍</Text>
        <Text style={styles.emptyText}>Chưa có check-in nào</Text>
        <Text style={styles.emptySubtext}>
          Hãy thực hiện check-in đầu tiên để xem trên bản đồ!
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Checkin')}
        >
          <Text style={styles.emptyButtonText}>Đi đến Check-in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {checkins.map((checkin, index) => (
          <Marker
            key={checkin.id}
            coordinate={{
              latitude: checkin.lat,
              longitude: checkin.lng,
            }}
            pinColor={getMarkerColor(index)}
          >
            <Callout
              style={styles.callout}
              onPress={() => {
                Alert.alert(
                  checkin.note,
                  `Vị trí: ${checkin.lat.toFixed(6)}, ${checkin.lng.toFixed(6)}\n` +
                  `Thời gian: ${formatDate(checkin.time)}`,
                  [
                    {
                      text: 'Xem chi tiết',
                      onPress: () => navigation.navigate('History'),
                    },
                    { text: 'Đóng' },
                  ]
                );
              }}
            >
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{checkin.note}</Text>
                <Text style={styles.calloutTime}>
                  {formatDate(checkin.time)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📌 Tổng số check-in: <Text style={styles.infoValue}>{checkins.length}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadCheckins}
      >
        <Text style={styles.refreshButtonText}>🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  callout: {
    width: 200,
  },
  calloutContent: {
    padding: 10,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  calloutTime: {
    fontSize: 12,
    color: '#666',
  },
  infoBox: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  refreshButtonText: {
    fontSize: 24,
  },
});
