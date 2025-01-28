import React, { useState, useEffect, useRef } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import {
  Box,
  Button,
  VStack,
  Text,
  useColorMode,
  IconButton,
  HStack,
  Input,
  Textarea,
  useColorModeValue,
  Flex,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
  Image,
  Link
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';
import {
  MdContentCopy,
  MdDelete,
  MdAdd,
  MdMenu,
  MdDarkMode,
  MdLightMode,
  MdChevronRight,
  MdEdit,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';
import {
  loadDictionary, convertText
} from '../utils/dictionary';
import {
  loadFromLocalStorage, saveToLocalStorage
} from '../utils/storage';

// 类型定义
interface Timeline {
  id: string;
  name: string;
  createdAt: number;
}

interface ConversionItem {
  id: string;
  timelineId: string;
  originalText: string;
  results: string[];
  timestamp: number;
  isExpanded: boolean;
}

const MotionHeading = motion(Box);

// 定义渐变动画关键帧
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 渐变标题组件
const GradientTitle: React.FC = () => {
  const { colorMode } = useColorMode();
  
  const lightGradient = 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)';
  const darkGradient = 'linear-gradient(-45deg, #ff3d00, #00a8ff, #ff00c8, #00ffd0)';
  
  return (
    <Heading
      as={motion.h1}
      size="2xl"
      textAlign="center"
      mb={10}
      pb={2}
      bgGradient={colorMode === 'light' ? lightGradient : darkGradient}
      bgClip="text"
      css={{
        animation: `${gradientAnimation} 15s ease infinite`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      同音字转换器
    </Heading>
  );
};

// 背景渐变组件
const GradientBackground = motion(Box);

// 时间线列表组件
const TimelineList: React.FC<{
  timelines: Timeline[];
  selectedTimelineId: string | null;
  onTimelineSelect: (timeline: Timeline) => void;
  onTimelineAction: (timeline: Timeline | null, action: 'rename' | 'delete' | 'new') => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  conversions: ConversionItem[];
}> = ({ 
  timelines, 
  selectedTimelineId, 
  onTimelineSelect, 
  onTimelineAction,
  searchQuery,
  onSearchChange,
  isCollapsed, 
  onToggleCollapse,
  conversions 
}) => {
  const filteredTimelines = timelines.filter(timeline => {
    // 搜索时间线名称
    const nameMatch = timeline.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 搜索该时间线下的所有原文
    const originalTextMatch = conversions
      .filter(c => c.timelineId === timeline.id)
      .some(c => c.originalText.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return nameMatch || originalTextMatch;
  });

  return (
    <Box
      width={isCollapsed ? "60px" : "300px"}
      transition="all 0.3s ease"
      overflow="hidden"
      borderRadius="lg"
      bg="white"
      _dark={{ bg: 'gray.800' }}
      boxShadow="md"
      height="calc(100vh - 200px)"
    >
    <SpeedInsights />
      <VStack spacing={0} align="stretch" height="100%">
        <HStack 
          p={4} 
          borderBottomWidth="1px" 
          borderColor="gray.200"
          _dark={{ borderColor: 'gray.700' }}
        >
          {!isCollapsed && <Text size="md" flex={1}>时间线</Text>}
          <IconButton
            aria-label={isCollapsed ? "展开侧栏" : "收起侧栏"}
            icon={isCollapsed ? <MdChevronRight /> : <MdMenu />}
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
          />
        </HStack>
        
        {!isCollapsed && (
          <VStack spacing={2} p={4} overflowY="auto" flex={1}>
            <HStack width="100%">
              <Input
                placeholder="搜索时间线和原文..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                size="sm"
                flex={1}
              />
              <IconButton
                aria-label="新建时间线"
                icon={<MdAdd />}
                size="sm"
                onClick={() => onTimelineAction(null, 'new')}
              />
            </HStack>
            <VStack spacing={2} width="100%" align="stretch">
              {filteredTimelines.map(timeline => (
                <Box
                  key={timeline.id}
                  p={3}
                  bg={selectedTimelineId === timeline.id ? 'blue.100' : 'gray.50'}
                  _dark={{
                    bg: selectedTimelineId === timeline.id ? 'blue.700' : 'gray.700'
                  }}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => onTimelineSelect(timeline)}
                  _hover={{
                    bg: selectedTimelineId === timeline.id ? 'blue.200' : 'gray.100',
                    _dark: {
                      bg: selectedTimelineId === timeline.id ? 'blue.600' : 'gray.600'
                    }
                  }}
                >
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold" noOfLines={1}>
                        {timeline.name}
                      </Text>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="时间线选项"
                          icon={<MdMenu />}
                          size="sm"
                          variant="ghost"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<MdEdit />}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onTimelineAction(timeline, 'rename');
                            }}
                          >
                            重命名
                          </MenuItem>
                          <MenuItem 
                            icon={<MdDelete />}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onTimelineAction(timeline, 'delete');
                            }}
                          >
                            删除
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                    {searchQuery && conversions
                      .filter(c => 
                        c.timelineId === timeline.id && 
                        c.originalText.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 2)
                      .map((c, idx) => (
                        <Text key={idx} fontSize="xs" color="gray.500" noOfLines={1}>
                          {c.originalText}
                        </Text>
                      ))
                    }
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

// 转换结果显示组件
const ConversionItem: React.FC<{
  item: ConversionItem;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}> = ({ item, onDelete, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(item.isExpanded);

  return (
    <Box
      p={4}
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="lg"
      boxShadow="sm"
      mb={4}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500">
            {new Date(item.timestamp).toLocaleString()}
          </Text>
          <HStack spacing={2}>
            <IconButton
              aria-label={isExpanded ? "收起" : "展开"}
              icon={isExpanded ? <MdExpandLess /> : <MdExpandMore />}
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            />
            <IconButton
              aria-label="复制"
              icon={<MdContentCopy />}
              size="sm"
              variant="ghost"
              onClick={() => onCopy(item.results[1])}
            />
            <IconButton
              aria-label="删除"
              icon={<MdDelete />}
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
            />
          </HStack>
        </HStack>
        {isExpanded && (
          <>
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold">原文：</Text>
              <Text>{item.originalText}</Text>
            </VStack>
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold">转换结果：</Text>
              <Text>{item.results[1]}</Text>
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

// 转换历史组件
const ConversionHistory: React.FC<{
  conversions: ConversionItem[];
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}> = ({ conversions, onDelete, onCopy }) => {
  return (
    <VStack spacing={4} align="stretch">
      {conversions.map((conversion) => (
        <ConversionItem
          key={conversion.id}
          item={conversion}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </VStack>
  );
};

const HomophoneConverter: React.FC = () => {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  const bgRef = useRef<HTMLDivElement>(null);

  // 复制文本到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 从本地存储加载数据
  useEffect(() => {
    const initData = async () => {
      try {
        const savedTimelines = (loadFromLocalStorage('timelines') || []) as Timeline[];
        const savedConversions = (loadFromLocalStorage('conversions') || []) as ConversionItem[];
        const savedSelectedTimelineId = loadFromLocalStorage('selectedTimelineId') as string;

        if (savedTimelines.length === 0) {
          const defaultTimeline: Timeline = {
            id: 'default',
            name: '默认时间线',
            createdAt: Date.now(),
          };
          setTimelines([defaultTimeline]);
          setSelectedTimelineId(defaultTimeline.id);
        } else {
          setTimelines(savedTimelines);
          setConversions(savedConversions);
          setSelectedTimelineId(savedSelectedTimelineId || savedTimelines[0].id);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };

    initData();
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (timelines.length > 0) {
      saveToLocalStorage('timelines', timelines);
      saveToLocalStorage('conversions', conversions);
      saveToLocalStorage('selectedTimelineId', selectedTimelineId);
    }
  }, [timelines, conversions, selectedTimelineId]);

  // 加载字典
  useEffect(() => {
    const loadDict = async () => {
      try {
        await loadDictionary();
      } catch (error) {
        console.error('加载字典失败:', error);
      }
    };

    loadDict();
  }, []);

  // 处理文本转换
  const handleConvert = async () => {
    if (!input.trim()) {
      return;
    }

    if (!selectedTimelineId) {
      return;
    }

    // 检查是否包含中文字符
    if (!/[\u4e00-\u9fa5]/.test(input)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await convertText(input);
      
      const newConversion: ConversionItem = {
        id: Date.now().toString(),
        timelineId: selectedTimelineId,
        originalText: input,
        results: [input, result],
        timestamp: Date.now(),
        isExpanded: true,
      };

      setConversions(prev => [newConversion, ...prev]);
    } catch (error) {
      console.error('转换失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理时间线操作
  const handleTimelineAction = (timeline: Timeline | null, action: 'rename' | 'delete' | 'new') => {
    if (action === 'new') {
      const newTimeline: Timeline = {
        id: Date.now().toString(),
        name: `时间线 ${timelines.length + 1}`,
        createdAt: Date.now()
      };
      setTimelines(prev => [...prev, newTimeline]);
      setSelectedTimelineId(newTimeline.id);
      return;
    }
    
    if (!timeline) return;

    if (action === 'rename') {
      // todo
    } else if (action === 'delete') {
      setTimelines(prev => prev.filter(t => t.id !== timeline.id));
      setConversions(prev => prev.filter(c => c.timelineId !== timeline.id));
      if (selectedTimelineId === timeline.id) {
        setSelectedTimelineId(null);
      }
    }
  };

  // 处理转换结果操作
  const handleConversionDelete = (id: string) => {
    setConversions(prev => prev.filter(c => c.id !== id));
  };

  const handleConversionCopy = (text: string) => {
    handleCopy(text);
  };

  // 字符统计函数
  const countCharacters = (text: string) => {
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    const numbers = text.match(/[0-9]/g) || [];
    const spaces = text.match(/\s/g) || [];
    const others = text.length - chineseChars.length - englishChars.length - numbers.length - spaces.length;

    return {
      chinese: chineseChars.length,
      english: englishChars.length,
      numbers: numbers.length,
      spaces: spaces.length,
      others: others,
      total: text.length
    };
  };

  return (
    <>
      <GradientBackground
        ref={bgRef}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        opacity={0.15}
        transition="all 0.5s ease"
        css={{
          background: useColorModeValue(
            'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
            'linear-gradient(-45deg, #ff3d00, #00a8ff, #ff00c8, #00ffd0)'
          ),
          backgroundSize: '400% 400%',
          animation: `${gradientAnimation} 15s ease infinite`,
        }}
      />
      <Box width="100%" py={10} px={4} position="relative">
        <IconButton
          aria-label="切换深浅色主题"
          icon={colorMode === 'light' ? <MdDarkMode /> : <MdLightMode />}
          position="absolute"
          right={4}
          top={4}
          onClick={toggleColorMode}
          variant="ghost"
          _hover={{ bg: 'transparent' }}
        />
        <GradientTitle />

        <HStack spacing={6} align="flex-start" width="100%">
          {/* 左侧时间线列表 */}
          <TimelineList
            timelines={timelines}
            selectedTimelineId={selectedTimelineId}
            onTimelineSelect={(timeline) => {
              setSelectedTimelineId(timeline.id);
            }}
            onTimelineAction={handleTimelineAction}
            searchQuery=""
            onSearchChange={() => {}}
            isCollapsed={isTimelineCollapsed}
            onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
            conversions={conversions}
          />

          {/* 中间主要内容区域 */}
          <VStack flex={1} spacing={4} align="stretch" width="100%">
            {/* 输入区域 */}
            <Box width="100%" position="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请输入要转换的文字..."
                size="lg"
                rows={6}
                mb={2}
              />
              <Text fontSize="sm" color="gray.500" textAlign="right">
                {(() => {
                  const counts = countCharacters(input);
                  const parts = [];
                  
                  if (counts.chinese > 0) {
                    parts.push(`${counts.chinese} 个汉字`);
                  }
                  if (counts.english > 0) {
                    parts.push(`${counts.english} 个英文字母`);
                  }
                  if (counts.numbers > 0) {
                    parts.push(`${counts.numbers} 个数字`);
                  }
                  if (counts.others > 0) {
                    parts.push(`${counts.others} 个其他字符`);
                  }
                  
                  return parts.join('，') || '0 个字符';
                })()}
              </Text>
            </Box>
            <Button
              colorScheme="blue"
              onClick={handleConvert}
              isLoading={isLoading}
              loadingText="转换中..."
              width="100%"
              isDisabled={!selectedTimelineId}
            >
              转换
            </Button>

            {/* 转换历史 */}
            {selectedTimelineId && (
              <Box>
                <Text size="md" mb={4}>转换历史</Text>
                <ConversionHistory
                  conversions={conversions.filter(c => c.timelineId === selectedTimelineId)}
                  onDelete={handleConversionDelete}
                  onCopy={handleConversionCopy}
                />
              </Box>
            )}
          </VStack>

          {/* 右侧捐赠区域 */}
          <VStack
            width="200px"
            spacing={4}
            align="center"
            display={{ base: 'none', xl: 'flex' }}
          >
            <Image
              src="/assets/donate.jpg"
              alt="捐赠二维码"
              borderRadius="lg"
              width="200px"
              height="200px"
              objectFit="cover"
              boxShadow="lg"
              _hover={{
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }}
            />
            <VStack spacing={2}>
              <Text
                fontSize="sm"
                color="gray.500"
                textAlign="center"
                fontWeight="medium"
              >
                捐赠下开发者谢谢喵~
              </Text>
              <Link
                href="https://github.com/vmoranv/pinyinbypassfronted"
                isExternal
                fontSize="sm"
                color="blue.500"
                _hover={{
                  color: 'blue.600',
                  textDecoration: 'none'
                }}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <Box as={FaGithub} fontSize="lg" />
                点个star谢谢喵~
              </Link>
            </VStack>
          </VStack>
        </HStack>

        {/* 底部赞助链接 */}
        <Box
          as="footer"
          width="100%"
          textAlign="center"
          mt={8}
          pt={4}
          borderTop="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <HStack
            spacing={4}
            justify="center"
            align="center"
            flexWrap="wrap"
          >
            <Link
              href="http://www.freecdn.vip/?zzwz"
              isExternal
              color={useColorModeValue('gray.600', 'gray.400')}
              fontSize="sm"
              _hover={{
                color: useColorModeValue('blue.500', 'blue.300'),
                textDecoration: 'none'
              }}
            >
              本站由免费云加速（FreeCDN）提供网站加速和攻击防御服务
            </Link>
            <Link
              href="http://www.freecdn.vip/?zzlogo"
              isExternal
              display={{ base: 'none', md: 'block' }}
            >
              <Image
                src="http://www.freecdn.vip/images/zzlogo.png"
                alt="免费云加速（FreeCDN），为您免费提供网站加速和网站防御（DDOS、CC攻击）"
                width="150px"
                height="80px"
                objectFit="contain"
              />
            </Link>
          </HStack>
        </Box>
      </Box>
    </>
  );
};

export default HomophoneConverter;
