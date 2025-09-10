// GitHub Data Sync Module
// This module handles saving and loading data from GitHub repository

class GitHubDataSync {
    constructor() {
        this.owner = 'Haitun123-cnm';  // 你的GitHub用户名
        this.repo = 'haitun123-client-system';  // 你的仓库名
        this.dataFile = 'client-data.json';
        this.token = null;
        this.isEnabled = false;
    }

    // Initialize GitHub sync
    async init() {
        // Check if GitHub token is available
        this.token = localStorage.getItem('github-token');
        if (this.token) {
            this.isEnabled = true;
            console.log('GitHub sync enabled');
            return true;
        } else {
            console.log('GitHub sync disabled - no token');
            return false;
        }
    }

    // Set GitHub token
    setToken(token) {
        this.token = token;
        localStorage.setItem('github-token', token);
        this.isEnabled = true;
        console.log('GitHub token set and sync enabled');
    }

    // Remove GitHub token
    removeToken() {
        this.token = null;
        localStorage.removeItem('github-token');
        this.isEnabled = false;
        console.log('GitHub token removed and sync disabled');
    }

    // Save data to GitHub
    async saveData(data) {
        if (!this.isEnabled) {
            console.log('GitHub sync disabled');
            return false;
        }

        console.log('Starting GitHub save process...');
        console.log('Repository:', `${this.owner}/${this.repo}`);
        console.log('Data file:', this.dataFile);

        try {
            const content = JSON.stringify(data, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            // Get the latest file info to avoid conflicts
            console.log('Getting existing file info...');
            const existingFile = await this.getFileInfo();
            console.log('Existing file info:', existingFile ? 'Found' : 'Not found');
            
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`;
            console.log('API URL:', url);
            
            const payload = {
                message: `Update client data - ${new Date().toISOString()}`,
                content: encodedContent,
                branch: 'main'
            };

            // Always include SHA if file exists to avoid conflicts
            if (existingFile && existingFile.sha) {
                payload.sha = existingFile.sha;
                console.log('Using existing SHA:', existingFile.sha);
            } else {
                console.log('No existing SHA - creating new file');
            }

            console.log('Sending PUT request to GitHub...');
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });

            console.log('GitHub response status:', response.status);

            if (response.ok) {
                console.log('✅ Data saved to GitHub successfully');
                return true;
            } else if (response.status === 409) {
                console.warn('⚠️ GitHub sync conflict - file was modified by another device. Retrying...');
                // Retry once with fresh file info
                const freshFile = await this.getFileInfo();
                if (freshFile && freshFile.sha) {
                    payload.sha = freshFile.sha;
                    console.log('Retrying with fresh SHA:', freshFile.sha);
                    const retryResponse = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/vnd.github.v3+json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (retryResponse.ok) {
                        console.log('✅ Data saved to GitHub successfully after retry');
                        return true;
                    } else {
                        console.error('❌ Failed to save data to GitHub after retry, status:', retryResponse.status);
                    }
                }
                console.error('❌ Failed to save data to GitHub after retry');
                return false;
            } else {
                const error = await response.json();
                console.error('❌ Failed to save data to GitHub:', error);
                console.error('Response status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving data to GitHub:', error);
            return false;
        }
    }

    // Load data from GitHub
    async loadData() {
        if (!this.isEnabled) {
            console.log('GitHub sync disabled');
            return null;
        }

        console.log('Starting GitHub load process...');
        console.log('Repository:', `${this.owner}/${this.repo}`);
        console.log('Data file:', this.dataFile);

        try {
            console.log('Getting file info from GitHub...');
            const fileInfo = await this.getFileInfo();
            if (!fileInfo) {
                console.log('No data file found on GitHub - this is normal for first time setup');
                return null;
            }

            console.log('File found, downloading data...');
            const response = await fetch(fileInfo.download_url);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Data loaded from GitHub successfully');
                console.log('Loaded data contains:', Object.keys(data));
                return data;
            } else {
                console.error('❌ Failed to load data from GitHub, status:', response.status);
                return null;
            }
        } catch (error) {
            console.error('❌ Error loading data from GitHub:', error);
            return null;
        }
    }

    // Get file information
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
                return null; // File doesn't exist
            } else {
                console.error('Failed to get file info:', response.status);
                return null;
            }
        } catch (error) {
            console.error('Error getting file info:', error);
            return null;
        }
    }

    // Check if sync is enabled
    isSyncEnabled() {
        return this.isEnabled;
    }

    // Get sync status
    getStatus() {
        return {
            enabled: this.isEnabled,
            hasToken: !!this.token,
            owner: this.owner,
            repo: this.repo,
            dataFile: this.dataFile
        };
    }
}

// Create global instance
window.githubSync = new GitHubDataSync();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing GitHub sync...');
    window.githubSync.init().then((enabled) => {
        console.log('GitHub sync initialization complete. Enabled:', enabled);
    }).catch((error) => {
        console.error('GitHub sync initialization failed:', error);
    });
});
