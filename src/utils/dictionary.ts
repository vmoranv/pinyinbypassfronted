// 定义同音字字典类型
export interface HomophoneDict {
  [pinyin: string]: string[];
}

// 全局字典缓存
let dictionaryCache: HomophoneDict | null = null;

// 加载同音字字典
export const loadDictionary = async (): Promise<{ pinyinCount: number; charCount: number }> => {
  // 如果已经加载过字典，直接返回缓存的统计信息
  if (dictionaryCache) {
    const pinyinCount = Object.keys(dictionaryCache).length;
    const charCount = Object.values(dictionaryCache).reduce((acc, chars) => acc + chars.length, 0);
    return { pinyinCount, charCount };
  }

  try {
    const response = await fetch('/assets/chinese_homophone_char.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    
    // 解析字典文件
    const dict: HomophoneDict = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [pinyin, ...chars] = line.trim().split('\t');
      if (pinyin && chars.length > 0) {
        dict[pinyin] = chars;
      }
    }

    // 缓存字典
    dictionaryCache = dict;
    
    // 返回统计信息
    const pinyinCount = Object.keys(dict).length;
    const charCount = Object.values(dict).reduce((acc, chars) => acc + chars.length, 0);
    return { pinyinCount, charCount };
  } catch (error) {
    console.error('加载字典失败:', error);
    throw error;
  }
};

// 获取字符的同音字
export const getHomophonesForChar = async (char: string): Promise<string[]> => {
  // 确保字典已加载
  if (!dictionaryCache) {
    await loadDictionary();
  }
  
  // 从缓存的字典中查找
  for (const [, chars] of Object.entries(dictionaryCache!)) {
    if (chars.includes(char)) {
      return chars;
    }
  }
  
  return [];
};

// 转换文本中的中文字符
export const convertText = async (text: string): Promise<string> => {
  // 确保字典已加载
  if (!dictionaryCache) {
    await loadDictionary();
  }
  
  // 找到所有中文字符的位置
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  if (chineseChars.length === 0) {
    return text;
  }

  let currentText = text;

  // 对每个中文字符进行替换
  for (const char of chineseChars) {
    const homophones = await getHomophonesForChar(char);
    // 过滤掉原字符
    const filteredHomophones = homophones.filter(h => h !== char);
    
    if (filteredHomophones.length > 0) {
      const replacement = randomChoice(filteredHomophones);
      // 使用正则表达式替换所有匹配的字符
      currentText = currentText.replace(new RegExp(char, 'g'), replacement);
    }
  }

  // 如果没有任何字符被替换（可能是因为没有同音字），返回原文
  return currentText === text ? text : currentText;
};

// 从数组中随机选择一个元素
const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};
