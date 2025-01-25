// 保存数据到本地存储
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('保存到本地存储失败:', error);
  }
};

// 从本地存储加载数据
export const loadFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('从本地存储加载失败:', error);
    return null;
  }
};
