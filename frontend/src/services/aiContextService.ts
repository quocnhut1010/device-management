import { getAllDevices } from './deviceService';
import { getAllDepartmentsData } from './departmentService';
import { getAllUsersData } from './userService';
import DeviceHistoryService from './deviceHistoryService';

export interface SystemContext {
  devices: any[];
  departments: any[];
  users: any[];
  deviceHistory: any[];
  statistics: {
    totalDevices: number;
    devicesInUse: number;
    devicesByDepartment: { [key: string]: number };
    devicesBySupplier: { [key: string]: number };
    devicesByStatus: { [key: string]: number };
    devicesByType: { [key: string]: number };
  };
}

export interface AIQuery {
  type: 'device_count' | 'department_devices' | 'supplier_devices' | 'device_status' | 'device_history' | 'general_stats' | 'liquidation_devices' | 'user_devices';
  parameters?: {
    departmentName?: string;
    supplierName?: string;
    userId?: string;
    deviceType?: string;
    status?: string;
  };
}

export class AIContextService {
  private static cachedContext: SystemContext | null = null;
  private static lastCacheTime: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private static async fetchSystemData(): Promise<SystemContext> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.cachedContext && (now - this.lastCacheTime) < this.CACHE_DURATION) {
      return this.cachedContext;
    }

    try {
      console.log('🔄 Fetching fresh system data for AI context...');
      
      // Fetch all data in parallel
      const [devices, departments, users] = await Promise.all([
        getAllDevices().catch(err => {
          console.warn('Failed to fetch devices:', err);
          return [];
        }),
        getAllDepartmentsData(false).catch(err => {
          console.warn('Failed to fetch departments:', err);
          return [];
        }),
        getAllUsersData(false).catch(err => {
          console.warn('Failed to fetch users:', err);
          return [];
        })
      ]);

      // Fetch recent device history
      const deviceHistory = await DeviceHistoryService.getAllHistory({
        page: 1,
        pageSize: 100,
        sortBy: 'ActionDate',
        sortOrder: 'desc'
      }).catch(err => {
        console.warn('Failed to fetch device history:', err);
        return [];
      });

      // Calculate statistics
      const statistics = this.calculateStatistics(devices, departments);

      const context: SystemContext = {
        devices,
        departments,
        users,
        deviceHistory,
        statistics
      };

      // Cache the result
      this.cachedContext = context;
      this.lastCacheTime = now;

      console.log('✅ System data fetched successfully:', {
        devices: devices.length,
        departments: departments.length,
        users: users.length,
        history: deviceHistory.length
      });

      console.log('📊 Department list:', departments.map(d => ({ id: d.id, name: d.name })));
      console.log('🔍 Device departments:', devices.map(d => ({ code: d.deviceCode, dept: d.departmentName })));
      console.log('📈 Departments with devices:', Object.keys(statistics.devicesByDepartment));

      return context;
    } catch (error) {
      console.error('❌ Error fetching system data:', error);
      throw error;
    }
  }

  private static calculateStatistics(devices: any[], departments: any[]) {
    const stats = {
      totalDevices: devices.length,
      devicesInUse: 0,
      devicesByDepartment: {} as { [key: string]: number },
      devicesBySupplier: {} as { [key: string]: number },
      devicesByStatus: {} as { [key: string]: number },
      devicesByType: {} as { [key: string]: number }
    };

    devices.forEach(device => {
      // Count devices in use
      if (device.status === 'Đang sử dụng' || device.status === 'InUse' || device.status === 'In Use') {
        stats.devicesInUse++;
      }

      // Group by department
      const deptName = device.departmentName || 'Chưa phân bổ';
      stats.devicesByDepartment[deptName] = (stats.devicesByDepartment[deptName] || 0) + 1;

      // Group by supplier
      const supplierName = device.supplierName || 'Không rõ';
      stats.devicesBySupplier[supplierName] = (stats.devicesBySupplier[supplierName] || 0) + 1;

      // Group by status
      const status = device.status || 'Không rõ';
      stats.devicesByStatus[status] = (stats.devicesByStatus[status] || 0) + 1;

      // Group by type
      const deviceType = device.deviceTypeName || device.type || 'Không rõ';
      stats.devicesByType[deviceType] = (stats.devicesByType[deviceType] || 0) + 1;
    });

    return stats;
  }

  public static async processQuery(query: string): Promise<string> {
    try {
      console.log('🔍 Processing query:', query);
      const context = await this.fetchSystemData();
      const queryInfo = this.analyzeQuery(query);
      console.log('🔎 Query analysis result:', queryInfo);
      
      const response = this.generateResponse(queryInfo, context, query);
      console.log('🚀 Generated response:', response.substring(0, 100) + '...');
      return response;
    } catch (error) {
      console.error('Error processing AI query:', error);
      return 'Xin lỗi, tôi không thể truy cập dữ liệu hệ thống lúc này. Vui lòng thử lại sau.';
    }
  }

  private static analyzeQuery(query: string): AIQuery {
    if (!query || typeof query !== 'string') {
      return { type: 'general_stats' };
    }
    const lowerQuery = query.toLowerCase();

    // Device count queries
    if (lowerQuery.includes('bao nhiêu thiết bị') || lowerQuery.includes('số lượng thiết bị')) {
      if (lowerQuery.includes('đang sử dụng') || lowerQuery.includes('đang dùng')) {
        return { type: 'device_count', parameters: { status: 'in_use' } };
      }
      if (lowerQuery.includes('phòng')) {
        // Try to extract full department name using improved regex
        const deptMatch = lowerQuery.match(/phòng\s+([a-zà-ỹ\s]+?)\s+(có|hiện|bao|đang)/) ||
                          lowerQuery.match(/phòng\s+([a-zà-ỹ\s]+?)\s/) ||
                          lowerQuery.match(/phòng\s+([^\s,?.!]+)/);
        
        const deptName = deptMatch && deptMatch[1] ? deptMatch[1].trim() : undefined;
        console.log('🔍 Regex match result:', { deptMatch, deptName });
        return { 
          type: 'department_devices', 
          parameters: { departmentName: deptName }
        };
      }
      return { type: 'device_count' };
    }

    // Department-specific queries (asking about a specific department)
    if (lowerQuery.includes('phòng ') && !lowerQuery.includes('bao nhiêu') && !lowerQuery.includes('thống kê')) {
      // Try to extract department name - look for patterns like "phòng X có" or "phòng X đang"
      const specificDeptMatch = lowerQuery.match(/phòng\s+([a-zà-ỹ\s]+?)\s+(có|hiện|bao|\u0111ang)/) ||
                                lowerQuery.match(/phòng\s+([^\s,?.!]+)/);
      
      if (specificDeptMatch && specificDeptMatch[1]) {
        const deptName = specificDeptMatch[1].trim();
        console.log('🔎 Dept-specific regex result:', { specificDeptMatch, deptName });
        return { 
          type: 'department_devices', 
          parameters: { departmentName: deptName }
        };
      }
    }
    
    // Supplier queries
    if (lowerQuery.includes('nhà cung cấp')) {
      return { type: 'supplier_devices' };
    }

    // Liquidation queries
    if (lowerQuery.includes('thanh lý') || lowerQuery.includes('chờ thanh lý')) {
      return { type: 'liquidation_devices' };
    }

    // Department statistics queries (general overview)
    if (lowerQuery.includes('thống kê') && lowerQuery.includes('phòng ban')) {
      return { type: 'department_devices' }; // Show all departments
    }
    
    // General statistics
    if (lowerQuery.includes('thống kê') || lowerQuery.includes('tổng quan')) {
      return { type: 'general_stats' };
    }

    // Default to general stats for system-related queries
    return { type: 'general_stats' };
  }

  private static generateResponse(queryInfo: AIQuery, context: SystemContext, originalQuery: string): string {
    const { statistics, devices, departments } = context;
    
    // Null safety checks
    if (!statistics || !devices || !departments) {
      return 'Xin lỗi, không thể tải dữ liệu hệ thống. Vui lòng thử lại sau.';
    }

    switch (queryInfo.type) {
      case 'device_count':
        if (queryInfo.parameters?.status === 'in_use') {
          return `🔧 Hiện tại hệ thống có **${statistics.devicesInUse}** thiết bị đang được sử dụng trên tổng số **${statistics.totalDevices}** thiết bị (${((statistics.devicesInUse / statistics.totalDevices) * 100).toFixed(1)}%).`;
        }
        return `📊 Hệ thống hiện có tổng cộng **${statistics.totalDevices}** thiết bị, trong đó **${statistics.devicesInUse}** thiết bị đang được sử dụng.`;

      case 'department_devices':
        // Create comprehensive department stats including departments with 0 devices
        const allDeptStats = departments
          .filter(dept => dept && dept.name) // Filter out null/undefined departments
          .map(dept => {
            const deviceCount = statistics.devicesByDepartment[dept.name] || 0;
            return [dept.name, deviceCount];
          })
          .sort(([,a], [,b]) => b - a);
        
        if (queryInfo.parameters?.departmentName) {
          const deptName = queryInfo.parameters.departmentName;
          console.log('🔍 Searching for department:', deptName);
          console.log('📈 Available departments:', allDeptStats.map(([name]) => name));
          
          // Try multiple matching strategies
          let found = allDeptStats.find(([name]) => 
            name && deptName && name.toLowerCase().includes(deptName.toLowerCase())
          );
          
          // If no direct match, try partial matching
          if (!found) {
            found = allDeptStats.find(([name]) => 
              name && deptName && (
                deptName.toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes(deptName.toLowerCase().split(' ')[0]) ||
                deptName.toLowerCase().includes(name.toLowerCase().split(' ')[0])
              )
            );
          }
          
          console.log('🔎 Department search result:', { found, deptName });
          
          if (found) {
            const [foundDeptName, deviceCount] = found;
            if (deviceCount === 0) {
              return `🏢 Phòng **${foundDeptName}** hiện có **0** thiết bị (chưa được phân bổ thiết bị nào).`;
            }
            return `🏢 Phòng **${foundDeptName}** hiện có **${deviceCount}** thiết bị.`;
          }
          return `❌ Không tìm thấy phòng ban có tên "${deptName}".`;
        }

        return `🏢 **Thống kê thiết bị theo phòng ban:**\n\n${allDeptStats.map(([dept, count]) => 
          count === 0 
            ? `• **${dept}**: ${count} thiết bị _(chưa có thiết bị)_`
            : `• **${dept}**: ${count} thiết bị`
        ).join('\n')}`;

      case 'supplier_devices':
        const supplierStats = Object.entries(statistics.devicesBySupplier)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10);
        
        const topSupplier = supplierStats[0];
        return `🏭 **Nhà cung cấp có nhiều thiết bị nhất:** **${topSupplier[0]}** với **${topSupplier[1]}** thiết bị.\n\n**Top 5 nhà cung cấp:**\n${supplierStats.slice(0, 5).map(([supplier, count], index) => 
          `${index + 1}. **${supplier}**: ${count} thiết bị`
        ).join('\n')}`;

      case 'liquidation_devices':
        const liquidationDevices = devices.filter(device => 
          device && device.status && (
            device.status.toLowerCase().includes('Chờ thanh lý') ||
            device.status.toLowerCase().includes('liquidation') ||
            device.status === 'Chờ thanh lý'
          )
        );
        
        if (liquidationDevices.length === 0) {
          return `✅ Hiện tại không có thiết bị nào đang chờ thanh lý.`;
        }

        return `🗑️ **Có ${liquidationDevices.length} thiết bị đang chờ thanh lý:**\n\n${liquidationDevices.slice(0, 10).map(device => 
          `• **${device.deviceName || device.deviceCode}** (${device.departmentName || 'Chưa phân bổ'})`
        ).join('\n')}${liquidationDevices.length > 10 ? '\n\n_...và ' + (liquidationDevices.length - 10) + ' thiết bị khác_' : ''}`;

      case 'general_stats':
        const statusStats = Object.entries(statistics.devicesByStatus)
          .sort(([,a], [,b]) => b - a);
        
        // Count departments with and without devices
        const deptsWithDevices = Object.keys(statistics.devicesByDepartment).length;
        const deptsWithoutDevices = departments.length - deptsWithDevices;
        
        return `📈 **Tổng quan hệ thống thiết bị:**

🔢 **Tổng số thiết bị:** ${statistics.totalDevices}
✅ **Đang sử dụng:** ${statistics.devicesInUse} thiết bị
🏢 **Số phòng ban:** ${departments.length}
   • **Đã có thiết bị:** ${deptsWithDevices} phòng
   • **Chưa có thiết bị:** ${deptsWithoutDevices} phòng
🏭 **Số nhà cung cấp:** ${Object.keys(statistics.devicesBySupplier).length}

📈 **Trạng thái thiết bị:**
${statusStats.map(([status, count]) => 
  `• **${status}**: ${count} thiết bị`
).join('\n')}`;

      default:
        return this.generateContextualResponse(originalQuery, context);
    }
  }

  private static generateContextualResponse(query: string, context: SystemContext): string {
    return `🔍 Dựa trên dữ liệu hiện tại:

📈 **Thống kê tổng quan:**
• Tổng thiết bị: ${context.statistics.totalDevices}
• Đang sử dụng: ${context.statistics.devicesInUse}
• Số phòng ban: ${context.departments.length}

❓ Bạn có thể hỏi cụ thể hơn về:
• "Có bao nhiêu thiết bị đang sử dụng?"
• "Phòng nào có nhiều thiết bị nhất?"
• "Nhà cung cấp nào cung cấp nhiều thiết bị nhất?"
• "Những thiết bị đang chờ thanh lý?"`;
  }

  public static clearCache(): void {
    this.cachedContext = null;
    this.lastCacheTime = 0;
  }
}

export default AIContextService;