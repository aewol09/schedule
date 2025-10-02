// styles/SettingsStyles.js
import { StyleSheet, Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fd7e14',
    borderRadius: 15,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  saveButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  addDailyTaskContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  dailyTaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addDailyButton: {
    width: 50,
    height: 50,
    backgroundColor: '#28a745',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addDailyButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  addWithNotificationContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  addWithNotificationButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addWithNotificationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dailyTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  dailyTaskInfo: {
    flex: 1,
  },
  dailyTaskTitle: {
    fontSize: 16,
    color: '#343a40',
  },
  dailyTaskTime: {
    fontSize: 12,
    color: '#fd7e14',
    marginTop: 2,
  },
  removeDailyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  removeDailyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default styles;