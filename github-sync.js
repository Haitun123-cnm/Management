// GitHub Data Sync Module
// This module handles saving and loading data from GitHub repository

class GitHubDataSync {
    constructor() {
        this.owner = 'Haitun123-cnm';
        this.repo = 'haitun123-client-system';
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

        try {
            const content = JSON.stringify(data, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            // Check if file exists
            const existingFile = await this.getFileInfo();
            
            const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.dataFile}`;
            
            const payload = {
                message: `Update client data - ${new Date().toISOString()}`,
                content: encodedContent,
                branch: 'main'
            };

            if (existingFile) {
                payload.sha = existingFile.sha;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Data saved to GitHub successfully');
                return true;
            } else {
                const error = await response.json();
                console.error('Failed to save data to GitHub:', error);
                return false;
            }
        } catch (error) {
            console.error('Error saving data to GitHub:', error);
            return false;
        }
    }

    // Load data from GitHub
    async loadData() {
        if (!this.isEnabled) {
            console.log('GitHub sync disabled');
            return null;
        }

        try {
            const fileInfo = await this.getFileInfo();
            if (!fileInfo) {
                console.log('No data file found on GitHub');
                return null;
            }

            const response = await fetch(fileInfo.download_url);
            if (response.ok) {
                const data = await response.json();
                console.log('Data loaded from GitHub successfully');
                return data;
            } else {
                console.error('Failed to load data from GitHub');
                return null;
            }
        } catch (error) {
            console.error('Error loading data from GitHub:', error);
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
    window.githubSync.init();
});
