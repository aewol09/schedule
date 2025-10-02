// styles/NotificationStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
  notification: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1001,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  closeButton: {
    padding: 5,
    marginLeft: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // 알림 타입별 스타일
  successNotification: {
    backgroundColor: '#28a745',
  },
  warningNotification: {
    backgroundColor: '#dc3545',
  },
  reminderNotification: {
    backgroundColor: '#fd7e14',
  },
  infoNotification: {
    backgroundColor: '#007bff',
  },
});

export default styles;