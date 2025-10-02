// styles/TaskItemStyles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  taskItem: {
    marginBottom: 15,
    position: 'relative',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    backgroundColor: '#fff',
  },
  taskContentDragging: {
    elevation: 10,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#007bff',
  },
  taskIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 15,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 4,
  },
  taskType: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 12,
    color: '#fd7e14',
    marginBottom: 2,
  },
  taskHint: {
    fontSize: 10,
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  
  // 삭제 배경
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: -1,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;