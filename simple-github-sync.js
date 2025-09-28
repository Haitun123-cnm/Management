// 简化的GitHub同步系统
// 将所有数据直接保存在GitHub上的一个文件中

class SimpleGitHubSync {
    constructor() {
        this.owner = 'Haitun123-cnm';
        this.repo = 'Management';
        this.dataFile = 'all-data.json';  // 使用更简单的文件名
        this.token = null;
        this.isEnabled = false;
    }

    // 初始化
    async init() {
        this.token = localStorage.getItem('github-token');
        if (this.token) {
            this.isEnabled = true;
            console.log('✅ GitHub sync enabled');
            return true;
        } else {
            console.log('❌ GitHub sync disabled - no token');
            return false;
        }
    }

    // 设置token
    setToken(token) {
        this.token = token;
        localStorage.setItem('github-token', token);
        this.isEnabled = true;
        console.log('✅ GitHub token set');
    }

    // 移除token
    removeToken() {
        this.token = null;
        localStorage.removeItem('github-token');
        this.isEnabled = false;
        console.log('❌ GitHub token removed');
    }

    // 保存所有数据到GitHub
    async saveAllData(allData) {
        if (!this.isEnabled) {
            console.log('❌ GitHub sync disabled');
            return false;
        }

        console.log('🚀 开始保存数据到GitHub...');
        console.log('📁 仓库:', `${this.owner}/${this.repo}`);
        console.log('📄 文件:', this.dataFile);
        
        // 显示同步状态给用户
        this.showSyncStatus('正在同步到GitHub...');

        try {
            // 准备数据
            const dataToSave = {
                ...allData,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            };

            const content = JSON.stringify(dataToSave, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            console.log('📊 数据大小:', content.length, '字符');

            // 获取现有文件信息
            const existingFile = await this.getFileInfo();
            
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`;
            
            const payload = {
                message: `Auto-sync data`,
                content: encodedContent,
                branch: 'main'
            };

            // 如果文件存在，包含SHA
            if (existingFile && existingFile.sha) {
                payload.sha = existingFile.sha;
                console.log('🔄 更新现有文件');
            } else {
                console.log('🆕 创建新文件');
            }

            // 发送请求
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });

            console.log('📡 GitHub响应状态:', response.status);

            if (response.ok) {
                console.log('✅ 数据成功保存到GitHub!');
                this.showSyncStatus('✅ 数据已同步到GitHub');
                return true;
            } else {
                const error = await response.json();
                console.error('❌ 保存失败:', error);
                this.showSyncStatus('❌ 同步失败');
                return false;
            }
        } catch (error) {
            console.error('❌ 保存错误:', error);
            this.showSyncStatus('❌ 同步错误');
            return false;
        }
    }

    // 从GitHub加载所有数据
    async loadAllData() {
        if (!this.isEnabled) {
            console.log('❌ GitHub sync disabled');
            return null;
        }

        console.log('📥 开始从GitHub加载数据...');

        try {
            const fileInfo = await this.getFileInfo();
            if (!fileInfo) {
                console.log('ℹ️ GitHub上没有数据文件');
                return null;
            }

            console.log('📄 找到数据文件，正在下载...');
            const response = await fetch(fileInfo.download_url);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 数据成功从GitHub加载!');
                console.log('📊 加载的数据包含:', Object.keys(data));
                return data;
            } else {
                console.error('❌ 下载失败:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ 加载错误:', error);
            return null;
        }
    }

    // 获取文件信息
    async getFileInfo() {
        try {
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                return null; // 文件不存在
            } else {
                console.error('❌ 获取文件信息失败:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ 获取文件信息错误:', error);
            return null;
        }
    }

    // 检查是否启用
    isSyncEnabled() {
        return this.isEnabled;
    }

    // 获取状态
    getStatus() {
        return {
            enabled: this.isEnabled,
            hasToken: !!this.token,
            owner: this.owner,
            repo: this.repo,
            dataFile: this.dataFile
        };
    }

    // 显示同步状态
    showSyncStatus(message) {
        // 创建或更新状态显示
        let statusDiv = document.getElementById('github-sync-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'github-sync-status';
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusDiv);
        }
        
        statusDiv.textContent = message;
        statusDiv.style.background = message.includes('✅') ? '#10b981' : 
                                    message.includes('❌') ? '#ef4444' : '#f59e0b';
        
        // 3秒后自动隐藏
        setTimeout(() => {
            if (statusDiv) {
                statusDiv.style.opacity = '0';
                setTimeout(() => {
                    if (statusDiv && statusDiv.parentNode) {
                        statusDiv.parentNode.removeChild(statusDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// 创建全局实例
window.simpleGitHubSync = new SimpleGitHubSync();

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    window.simpleGitHubSync.init();
});
