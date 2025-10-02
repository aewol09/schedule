// components/TaskList.js
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import TaskItem from './TaskItem';
import styles from '../styles/TaskListStyles';

const TaskList = ({ tasks, onComplete, onDelete, onReorder }) => {
  if (tasks.length === 0) {
    return (
      <View style={styles.content}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🎉 오늘 할 일이 없습니다!</Text>
          <Text style={styles.emptySubText}>새로운 일정을 추가해보세요</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TaskItem
            task={item}
            onComplete={onComplete}
            onDelete={onDelete}
            onReorder={onReorder}
            index={index}
            totalTasks={tasks.length}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TaskList;