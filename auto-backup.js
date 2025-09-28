// 自动备份系统
// 确保数据永远不会丢失

class AutoBackupSystem {
    constructor() {
        this.backupInterval = 5 * 60 * 1000; // 5分钟备份一次
        this.maxBackups = 10; // 保留最近10个备份
        this.isRunning = false;
    }

    // 启动自动备份
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🔄 自动备份系统已启动');
        
        // 立即备份一次
        this.createBackup();
        
        // 设置定时备份
        this.backupTimer = setInterval(() => {
            this.createBackup();
        }, this.backupInterval);
    }

    // 停止自动备份
    stop() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
        }
        this.isRunning = false;
        console.log('⏹️ 自动备份系统已停止');
    }

    // 创建备份
    async createBackup() {
        try {
            // 获取所有数据
            const allData = this.getAllData();
            if (!allData || Object.keys(allData).length === 0) {
                console.log('ℹ️ 没有数据需要备份');
                return;
            }

            // 创建备份数据
            const backupData = {
                ...allData,
                backupTime: new Date().toISOString(),
                backupId: this.generateBackupId(),
                version: '1.0'
            };

            // 保存到localStorage
            const backupKey = `backup_${backupData.backupId}`;
            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // 清理旧备份
            this.cleanupOldBackups();
            
            console.log('✅ 本地备份已创建:', backupData.backupId);
            
            // 如果GitHub同步启用，也备份到GitHub
            if (window.simpleGitHubSync && window.simpleGitHubSync.isSyncEnabled()) {
                await this.backupToGitHub(backupData);
            }
            
        } catch (error) {
            console.error('❌ 备份失败:', error);
        }
    }

    // 获取所有数据
    getAllData() {
        try {
            const clients = JSON.parse(localStorage.getItem('clients') || '[]');
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const settings = JSON.parse(localStorage.getItem('settings') || '{}');
            const mode = localStorage.getItem('currentMode') || 'service';
            
            return {
                clients,
                tasks,
                settings,
                mode,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ 获取数据失败:', error);
            return null;
        }
    }

    // 备份到GitHub
    async backupToGitHub(backupData) {
        try {
            if (window.simpleGitHubSync && window.simpleGitHubSync.isSyncEnabled()) {
                const success = await window.simpleGitHubSync.saveAllData(backupData);
                if (success) {
                    console.log('✅ GitHub备份已创建');
                } else {
                    console.log('⚠️ GitHub备份失败，但本地备份已保存');
                }
            }
        } catch (error) {
            console.error('❌ GitHub备份错误:', error);
        }
    }

    // 生成备份ID
    generateBackupId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 清理旧备份
    cleanupOldBackups() {
        try {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('backup_')) {
                    backupKeys.push(key);
                }
            }

            // 按时间排序
            backupKeys.sort((a, b) => {
                const aTime = localStorage.getItem(a) ? 
                    JSON.parse(localStorage.getItem(a)).backupTime : '0';
                const bTime = localStorage.getItem(b) ? 
                    JSON.parse(localStorage.getItem(b)).backupTime : '0';
                return new Date(bTime) - new Date(aTime);
            });

            // 删除多余的备份
            if (backupKeys.length > this.maxBackups) {
                const toDelete = backupKeys.slice(this.maxBackups);
                toDelete.forEach(key => {
                    localStorage.removeItem(key);
                    console.log('🗑️ 删除旧备份:', key);
                });
            }
        } catch (error) {
            console.error('❌ 清理备份失败:', error);
        }
    }

    // 恢复备份
    async restoreBackup(backupId) {
        try {
            const backupKey = `backup_${backupId}`;
            const backupData = localStorage.getItem(backupKey);
            
            if (!backupData) {
                console.error('❌ 备份不存在:', backupId);
                return false;
            }

            const data = JSON.parse(backupData);
            
            // 恢复数据
            if (data.clients) localStorage.setItem('clients', JSON.stringify(data.clients));
            if (data.tasks) localStorage.setItem('tasks', JSON.stringify(data.tasks));
            if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
            if (data.mode) localStorage.setItem('currentMode', data.mode);
            
            console.log('✅ 数据已从备份恢复:', backupId);
            
            // 刷新页面
            window.location.reload();
            return true;
            
        } catch (error) {
            console.error('❌ 恢复备份失败:', error);
            return false;
        }
    }

    // 获取所有备份
    getAllBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('backup_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        id: data.backupId,
                        time: data.backupTime,
                        key: key
                    });
                } catch (error) {
                    console.error('❌ 解析备份失败:', key);
                }
            }
        }
        
        return backups.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // 显示备份状态
    showBackupStatus() {
        const backups = this.getAllBackups();
        const status = {
            isRunning: this.isRunning,
            totalBackups: backups.length,
            lastBackup: backups.length > 0 ? backups[0].time : null,
            githubSync: window.simpleGitHubSync ? window.simpleGitHubSync.isSyncEnabled() : false
        };
        
        console.log('📊 备份状态:', status);
        return status;
    }
}

// 创建全局实例
window.autoBackupSystem = new AutoBackupSystem();

// 页面加载时启动自动备份
document.addEventListener('DOMContentLoaded', () => {
    // 等待1秒后启动，确保其他系统已初始化
    setTimeout(() => {
        window.autoBackupSystem.start();
    }, 1000);
});

// 页面卸载时停止备份
window.addEventListener('beforeunload', () => {
    if (window.autoBackupSystem) {
        window.autoBackupSystem.stop();
    }
});
