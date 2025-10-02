// utils/notificationManager.js
// 이제 푸시 알림 대신 화면 내 알림을 사용하므로
// 이 파일은 향후 확장을 위해 기본 구조만 제공합니다.

export const scheduleNotification = async (task) => {
  // 화면 내 알림으로 변경했으므로 실제 스케줄링은 App.js에서 처리
  console.log(`알림 설정됨: ${task.title}`);
  return Promise.resolve();
};

export const cancelNotification = async (taskId) => {
  // 화면 내 알림으로 변경했으므로 취소 로직 없음
  console.log(`알림 취소됨: ${taskId}`);
  return Promise.resolve();
};