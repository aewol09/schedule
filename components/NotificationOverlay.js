// components/NotificationOverlay.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import styles from '../styles/NotificationStyles';

const { width } = Dimensions.get('window');

const NotificationItem = ({ notification, onRemove, index }) => {
  const slideAnim = new Animated.Value(-width);

  React.useEffect(() => {
    // 슬라이드 인 애니메이션
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRemove = () => {
    // 슬라이드 아웃 애니메이션
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onRemove(notification.id);
    });
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return styles.successNotification;
      case 'warning':
        return styles.warningNotification;
      case 'reminder':
        return styles.reminderNotification;
      default:
        return styles.infoNotification;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'reminder':
        return '🔔';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Animated.View 
      style={[
        styles.notification,
        getNotificationStyle(notification.type),
        {
          transform: [{ translateX: slideAnim }],
          top: 60 + (index * 70), // 알림들을 세로로 배치
        }
      ]}
    >
      <View style={styles.notificationContent}>
        <Text style={styles.notificationIcon}>{getIcon(notification.type)}</Text>
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleRemove}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const NotificationOverlay = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  return (
    <View style={styles.overlay}>
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </View>
  );
};

export default NotificationOverlay;